// server/models/result.js
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  subjectCode: { type: String, required: true },
  marks: { type: Number, required: true }
});

module.exports = mongoose.model("Result", resultSchema);
