import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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
try {
const response = await axios.get(`${API_URL}/notes`);
setNotes(response.data);
setIsLoading(false);
} catch (err) {
console.error('Error fetching notes:', err);
setIsLoading(false);
}
};

const handleSubmit = async (e) => {
e.preventDefault();
try {
await axios.post(`${API_URL}/notes`, { title, content });
setTitle('');
setContent('');
fetchNotes();
} catch (err) {
console.error('Error creating note:', err);
}
};

const handleDelete = async (id) => {
try {
await axios.delete(`${API_URL}/notes/${id}`);
fetchNotes();
} catch (err) {
console.error('Error deleting note:', err);
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
{notes.map((note) => (
<div key={note._id} className="note">
<h3>{note.title}</h3>
<p>{note.content}</p>
<button onClick={() => handleDelete(note._id)}>Delete</button>
</div>
))}
</div>
)}
</div>
);
}

export default App;