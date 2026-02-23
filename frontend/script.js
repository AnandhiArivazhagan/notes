const board = document.getElementById("board");
const API_URL = "https://notes-j22w.onrender.com/notes";

/* ===============================
   LOAD NOTES FROM DATABASE
=================================*/

window.onload = async () => {
  const res = await fetch(API_URL);
  const notes = await res.json();
  notes.forEach(createNoteElement);
};

/* ===============================
   OPEN / CLOSE MODAL
=================================*/

function openModal() {
  document.getElementById("noteModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("noteModal").style.display = "none";
}

/* ===============================
   ADD NOTE (SAVE TO DB)
=================================*/

async function addNote() {

  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;
  const date = document.getElementById("date").value;
  const imageFile = document.getElementById("image").files[0];
  const tags = document.getElementById("tags").value;
  const color = document.getElementById("color").value;

  if (!body.trim()) {
    alert("Note body required!");
    return;
  }

  let imageBase64 = "";

  if (imageFile) {
    imageBase64 = await toBase64(imageFile);
  }

  const noteData = { title, body, date, tags, color, image: imageBase64 };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(noteData)
  });

  const savedNote = await res.json();
  createNoteElement(savedNote);

  closeModal();
}

/* ===============================
   CREATE NOTE ELEMENT
=================================*/

function createNoteElement(noteData) {

  const note = document.createElement("div");
  note.className = "note";
  note.style.backgroundColor = noteData.color || "#caff90";

  // Random position (inside board)
  note.style.left = Math.random() * 70 + "%";
  note.style.top = Math.random() * 60 + "%";

  let content = "";
  if (noteData.title) content += `<h3>${noteData.title}</h3>`;
  content += `<p>${noteData.body}</p>`;
  if (noteData.date) content += `<small>📅 ${noteData.date}</small>`;
  if (noteData.tags) content += `<div class="tags">🏷️ ${noteData.tags}</div>`;

  note.innerHTML = content;

  if (noteData.image) {
    const img = document.createElement("img");
    img.src = noteData.image;
    note.appendChild(img);
  }

  const actions = document.createElement("div");
  actions.className = "actions";

  const del = document.createElement("button");
  del.innerHTML = "🗑️";
  del.onclick = async () => {
    await fetch(`${API_URL}/${noteData._id}`, { method: "DELETE" });
    note.style.animation = "peel 0.4s forwards";
    setTimeout(() => note.remove(), 400);
  };

  actions.appendChild(del);
  note.appendChild(actions);

  // 🔥 Enable Drag
  makeDraggable(note);

  board.appendChild(note);
}

/* ===============================
   DRAG FUNCTION
=================================*/

function makeDraggable(note) {

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  note.addEventListener("mousedown", (e) => {
    isDragging = true;

    offsetX = e.clientX - note.offsetLeft;
    offsetY = e.clientY - note.offsetTop;

    note.style.zIndex = 1000;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const boardRect = board.getBoundingClientRect();

    let x = e.clientX - offsetX - boardRect.left;
    let y = e.clientY - offsetY - boardRect.top;

    // Keep inside board boundaries
    x = Math.max(0, Math.min(x, boardRect.width - note.offsetWidth));
    y = Math.max(0, Math.min(y, boardRect.height - note.offsetHeight));

    note.style.left = x + "px";
    note.style.top = y + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    note.style.zIndex = "";
  });
}

/* ===============================
   HELPER
=================================*/

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}