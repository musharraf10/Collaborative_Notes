## Features

- **Real-time Collaboration**: Multiple users can edit the same note simultaneously
- **Live Updates**: Changes appear instantly across all connected clients
- **User Awareness**: See who's online and currently editing
- **Auto-save**: Notes are automatically saved as you type
- **Mobile Friendly**: Responsive design that works on all devices
- **User Tracking**: Name-based identification for collaborators
- **Live Statistics**: Character and word count updates
- **Toast Notifications**: Visual feedback for connections and updates
- **Typing Indicators**: See when others are typing

## Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **CORS** for cross-origin requests

### Frontend

- **React** with React Router
- **Socket.IO Client** for real-time updates
- **React Hot Toast** for notifications
- **React Textarea Autosize** for auto-resizing text areas

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn
- First install dependecies using npm install in both folders (server, client)

### Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB URL
MONGODB_URI=mongodb://localhost:27017/collaborative-notes
// or 127.0.0.1:27017

# Server port
PORT=5000

# Client URL
CLIENT_URL=http://localhost:5173
```

## API Endpoints

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/api/notes`     | Create a new note       |
| GET    | `/api/notes/:id` | Fetch note by ID        |
| PUT    | `/api/notes/:id` | Update note content     |
| GET    | `/api/notes`     | Get all notes (limited) |
| GET    | `/api/health`    | Health check            |

## WebSocket Events

| Event               | Description                        |
| ------------------- | ---------------------------------- |
| `join_note`         | Join a note room for collaboration |
| `note_update`       | Broadcast content changes          |
| `note_loaded`       | Receive note data when joining     |
| `note_updated`      | Receive updates from other users   |
| `active_users`      | Get list of online collaborators   |
| `typing_start/stop` | Typing indicator events            |

## Project Structure

```
collaborative-notes-app/
├── server/
│   ├── index.js              # Main server file
│   ├── models/
│   │   └── Note.js           # MongoDB note schema
│   ├── routes/
│   │   └── notes.js          # Note API routes
│   └── socket/
│       └── noteSocket.js     # Socket.IO event handlers
├── client/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Main page components
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # React entry point
│   ├── index.html            # HTML template
│   └── package.json          # Frontend dependencies
├── .env.example              # Environment variables template
├── package.json              # Backend dependencies & scripts
└── README.md                 # This file
```

## Development

### Running in Development

```bash

# Or start individually:
npm start  # Backend only
npm run dev  # Frontend only
```

### Environment Variables for Production

```env
MONGODB_URI=<your-mongodb-connection-string>
PORT=5000
CLIENT_URL=<your-frontend-url>

In frontend 
create .env file add 
VITE_SERVER_URL=http://localhost:5000 
```
