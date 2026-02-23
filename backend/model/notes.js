const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: String
  },
  tags: {
    type: String
  },
  color: {
    type: String,
    default: "#fff176"
  },
  image: {
    type: String   // store base64 image
  }
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);