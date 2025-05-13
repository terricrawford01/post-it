import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Make sure this file exists and has some basic styling

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/notes`);
      // --- DIAGNOSTIC LOGGING ---
      // Log the raw data received from the backend
      console.log('Fetched notes data:', response.data);
      // --- END DIAGNOSTIC LOGGING ---
      setNotes(response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      if (err.response) {
        console.error("Axios error data (fetchNotes):", err.response.data);
        console.error("Axios error status (fetchNotes):", err.response.status);
      }
      setNotes([]); // Set notes to empty array on error to avoid issues with .map
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
        alert("Note content cannot be empty!");
        return;
    }
    try {
      await axios.post(`${API_URL}/notes`, { title, content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (err) {
      console.error('Error creating note:', err);
      if (err.response) {
        console.error("Axios error data (handleSubmit):", err.response.data);
        console.error("Axios error status (handleSubmit):", err.response.status);
      }
    }
  };

  const handleDelete = async (id) => {
    console.log("Attempting to delete note with ID:", id);
    console.log("Type of ID being sent to delete:", typeof id);

    if (id === undefined) {
        console.error("Delete aborted: ID is undefined.");
        alert("Cannot delete note: ID is missing. Please refresh and try again.");
        return;
    }

    try {
      await axios.delete(`${API_URL}/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      if (err.response) {
        console.error("Axios error data (handleDelete):", err.response.data);
        console.error("Axios error status (handleDelete):", err.response.status);
        alert(`Error deleting note: ${err.response.data.message || 'Server error'}`);
      } else {
        alert('Error deleting note: Could not connect to server.');
      }
    }
  };

  return (
    <div className="app">
      <h1>Post It Notes</h1>
      
      <form onSubmit={handleSubmit} className="note-form">
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Your note content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Post It!</button>
      </form>

      {isLoading ? (
        <p>Loading notes...</p>
      ) : (
        <div className="notes-grid">
          {Array.isArray(notes) && notes.length > 0 ? (
            notes.map((note, index) => ( // Added index for a more robust key if _id is missing
              // Check if note object itself is valid, then check for _id
              note && typeof note === 'object' && note._id ? (
                <div key={note._id} className="note">
                  <h3>{note.title || 'No Title'}</h3>
                  <p>{note.content}</p>
                  <button onClick={() => handleDelete(note._id)}>Delete</button>
                </div>
              ) : (
                <div key={index} className="note error-note"> {/* Use index as fallback key */}
                  <p>Invalid note data received. Check console for details.</p>
                  {/* Log the problematic note for easier debugging */}
                  <script>{console.log("Problematic note data:", note)}</script>
                </div>
              )
            ))
          ) : (
            <p>No notes yet. Add one above!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

