import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Ensure VITE_API_URL is set in your Vercel environment variables
  // It should point to your deployed backend, e.g., https://your-backend.onrender.com/api
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Effect hook to fetch notes when the component mounts
  useEffect(() => {
    fetchNotes();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch all notes from the backend
  const fetchNotes = async () => {
    setIsLoading(true); // Set loading state before fetching
    try {
      const response = await axios.get(`${API_URL}/notes`);
      setNotes(response.data); // Update notes state with data from API
    } catch (err) {
      console.error('Error fetching notes:', err);
      // Log more detailed error information if available
      if (err.response) {
        console.error("Axios error data (fetchNotes):", err.response.data);
        console.error("Axios error status (fetchNotes):", err.response.status);
      }
    } finally {
      setIsLoading(false); // Set loading to false after fetch attempt (success or fail)
    }
  };

  // Function to handle form submission for creating a new note
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!content.trim()) { // Basic validation: ensure content is not empty
        alert("Note content cannot be empty!");
        return;
    }
    try {
      await axios.post(`${API_URL}/notes`, { title, content });
      setTitle(''); // Clear title input
      setContent(''); // Clear content textarea
      fetchNotes(); // Refresh the notes list to show the new note
    } catch (err) {
      console.error('Error creating note:', err);
      if (err.response) {
        console.error("Axios error data (handleSubmit):", err.response.data);
        console.error("Axios error status (handleSubmit):", err.response.status);
      }
    }
  };

  // Function to handle deleting a note
  const handleDelete = async (id) => {
    // --- DIAGNOSTIC LOGGING ---
    // Log the ID and its type to help debug the "undefined" ID issue
    console.log("Attempting to delete note with ID:", id);
    console.log("Type of ID being sent to delete:", typeof id);
    // --- END DIAGNOSTIC LOGGING ---

    if (id === undefined) {
        console.error("Delete aborted: ID is undefined.");
        alert("Cannot delete note: ID is missing. Please refresh and try again.");
        return;
    }

    try {
      await axios.delete(`${API_URL}/notes/${id}`);
      fetchNotes(); // Refresh the notes list after deleting a note
    } catch (err) {
      console.error('Error deleting note:', err);
      if (err.response) {
        // This will show the specific error message from your backend,
        // like the "invalid input syntax for type integer" if the ID is still problematic.
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
          required // HTML5 validation for required field
        />
        <button type="submit">Post It!</button>
      </form>

      {isLoading ? (
        <p>Loading notes...</p>
      ) : (
        <div className="notes-grid">
          {/* Ensure notes is an array before mapping */}
          {Array.isArray(notes) && notes.length > 0 ? (
            notes.map((note) => (
              // Ensure 'note' and 'note._id' are valid before rendering
              note && note._id ? (
                <div key={note._id} className="note">
                  <h3>{note.title || 'No Title'}</h3>
                  <p>{note.content}</p>
                  <button onClick={() => handleDelete(note._id)}>Delete</button>
                </div>
              ) : (
                // Optional: Render a placeholder or log an error for invalid note data
                <div key={Math.random()} className="note error-note"> 
                  <p>Invalid note data received.</p>
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
