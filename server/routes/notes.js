import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

// Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content = '', lastEditedBy = 'Anonymous', isPinned = false, tags = [] } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = new Note({
      title: title.trim(),
      content,
      lastEditedBy,
      isPinned,
      tags
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update note content
router.put('/:id', async (req, res) => {
  try {
    const { content, title, lastEditedBy = 'Anonymous', isPinned, tags } = req.body;
    
    const updateData = {
      updatedAt: new Date(),
      lastEditedBy
    };

    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title.trim();
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (tags !== undefined) updateData.tags = tags;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Toggle pin status
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    note.updatedAt = new Date();
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');
    
    const notes = await Note.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
      .select('title content isPinned tags updatedAt lastEditedBy')
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(50);
    
    res.json(notes);
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

// Get all notes (for listing)
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find()
      .select('title content isPinned tags updatedAt lastEditedBy')
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(50);
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

export default router;