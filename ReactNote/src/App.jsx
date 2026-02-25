import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://notes-j22w.onrender.com/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    body: "",
    date: "",
    tags: "",
    color: "#fff176",
    image: ""
  });

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then(data =>
        setNotes(
          data.map(n => ({ ...n, x: Math.random() * 600, y: Math.random() * 300 }))
        )
      )
      .catch(console.error);
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleImage = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const addNote = () => {
    if (!form.body.trim()) return alert("Note body required!");
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(saved => {
        setNotes(prev => [
          ...prev,
          { ...saved, x: Math.random() * 600, y: Math.random() * 300 }
        ]);
        setForm({ title: "", body: "", date: "", tags: "", color: "#fff176", image: "" });
        closeModal();
      })
      .catch(console.error);
  };

  const deleteNote = id => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => setNotes(prev => prev.filter(n => n._id !== id)))
      .catch(console.error);
  };

  /* DRAGGING */
  const startDrag = (e, id) => {
    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const note = notes.find(n => n._id === id) || { x: 0, y: 0 };
    const shiftX = clientX - (note.x || 0);
    const shiftY = clientY - (note.y || 0);

    const onMove = (ev) => {
      const mx = ev.type === 'touchmove' ? ev.touches[0].clientX : ev.clientX;
      const my = ev.type === 'touchmove' ? ev.touches[0].clientY : ev.clientY;
      setNotes(prev => prev.map(n => n._id === id ? ({ ...n, x: mx - shiftX, y: my - shiftY }) : n));
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  return (
    <div className="app">
      <h1 className="app-title">🗒️ My Sticky Board</h1>

      <div className="board">
        {notes.map(note => (
          <div
            key={note._id}
            className="note"
            onMouseDown={(e) => startDrag(e, note._id)}
            onTouchStart={(e) => startDrag(e, note._id)}
            style={{ left: note.x + "px", top: note.y + "px", backgroundColor: note.color }}
          >
            {note.title && <h3>{note.title}</h3>}
            <p>{note.body}</p>
            {note.date && <small>📅 {note.date}</small>}
            {note.tags && <div className="tags">🏷️ {note.tags}</div>}
            {note.image && <img src={note.image} alt="note" />}
            <div className="actions">
              <button onClick={() => deleteNote(note._id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <button className="fab" onClick={openModal}>+</button>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Sticky Note</h2>
            <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea placeholder="Write your note..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input type="file" accept="image/*" onChange={handleImage} />
            <input placeholder="Tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <label>Pick Color 🎨</label>
            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            <div className="modal-buttons">
              <button onClick={addNote}>Add</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;