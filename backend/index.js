const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Note = require("./model/notes");

const app = express();

app.use(express.json({ limit: "10mb" })); // important for base64 images
app.use(cors());

mongoose.connect("mongodb+srv://Anandhi:anandhi_2005@cluster0.favzmu6.mongodb.net/stickyDB")
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.log(err));

/* ===========================
   CRUD ROUTES
===========================*/

// GET all notes
app.get("/notes", async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

// CREATE note
app.post("/notes", async (req, res) => {
  const newNote = new Note(req.body);
  await newNote.save();
  res.json(newNote);
});

// DELETE note
app.delete("/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Note deleted" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});