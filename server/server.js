require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Define Note model
const Note = sequelize.define('Note', {
  title: {
    type: DataTypes.STRING, // <-- Fix this typo to STRING
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    await Note.sync({ alter: true });
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

initializeDatabase();

// Routes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.findAll({ order: [['createdAt', 'DESC']] });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  
  if (!content) return res.status(400).json({ message: 'Content required' });

  try {
    const note = await Note.create({ 
      title: title || 'Untitled Note',
      content
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});