import Note from "../models/Note.js";

const activeUsers = new Map();
const userSockets = new Map();

export function handleSocketConnection(socket, io) {
  console.log("User connected:", socket.id);

  socket.on("join_note", async (data) => {
    try {
      const { noteId, userName = "Anonymous" } = data;

      const previousRooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id
      );
      previousRooms.forEach((room) => {
        socket.leave(room);
        removeUserFromRoom(room, socket.id);
      });

      socket.join(noteId);

      const userInfo = {
        socketId: socket.id,
        userName,
        joinedAt: new Date(),
      };

      userSockets.set(socket.id, { ...userInfo, noteId });

      if (!activeUsers.has(noteId)) {
        activeUsers.set(noteId, new Set());
      }
      activeUsers.get(noteId).add(userInfo);

      // Get current note data
      const note = await Note.findById(noteId);
      if (note) {
        socket.emit("note_loaded", note);
      }

      // Broadcast updated user list
      const users = Array.from(activeUsers.get(noteId) || []);
      io.to(noteId).emit("active_users", users);

      console.log(`User ${userName} joined note ${noteId}`);
    } catch (error) {
      console.error("Error joining note:", error);
      socket.emit("error", { message: "Failed to join note" });
    }
  });

  // Handle note updates
  socket.on("note_update", async (data) => {
    try {
      const { noteId, content, title, userName = "Anonymous" } = data;
      const userInfo = userSockets.get(socket.id);

      if (!userInfo || userInfo.noteId !== noteId) {
        socket.emit("error", { message: "Not authorized to edit this note" });
        return;
      }

      // Update in database
      const updateData = {
        updatedAt: new Date(),
        lastEditedBy: userName,
      };

      if (content !== undefined) updateData.content = content;
      if (title !== undefined) updateData.title = title;

      const note = await Note.findByIdAndUpdate(noteId, updateData, {
        new: true,
      });

      if (note) {
        // Broadcast to all users in the room except sender
        socket.to(noteId).emit("note_updated", {
          content: note.content,
          title: note.title,
          updatedAt: note.updatedAt,
          lastEditedBy: note.lastEditedBy,
          updatedBy: userName,
        });
      }
    } catch (error) {
      console.error("Error updating note:", error);
      socket.emit("error", { message: "Failed to update note" });
    }
  });

  socket.on("typing_start", (data) => {
    const { noteId, userName } = data;
    socket.to(noteId).emit("user_typing", { userName, isTyping: true });
  });

  socket.on("typing_stop", (data) => {
    const { noteId, userName } = data;
    socket.to(noteId).emit("user_typing", { userName, isTyping: false });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const userInfo = userSockets.get(socket.id);
    if (userInfo) {
      removeUserFromRoom(userInfo.noteId, socket.id);
      userSockets.delete(socket.id);
    }
  });
}

function removeUserFromRoom(noteId, socketId) {
  if (activeUsers.has(noteId)) {
    const users = activeUsers.get(noteId);
    const userToRemove = Array.from(users).find(
      (user) => user.socketId === socketId
    );

    if (userToRemove) {
      users.delete(userToRemove);

      if (users.size === 0) {
        activeUsers.delete(noteId);
      }
    }
  }
}
