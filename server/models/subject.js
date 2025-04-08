const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjectCode: { type: String, required: true, unique: true },
  credit: { type: Number, required: true }
});

// Prevent model overwrite
const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

module.exports = Subject;
