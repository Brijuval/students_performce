const express = require("express");
const router = express.Router();
const Subject = require("../models/subject");

// Add a new subject
router.post("/", async (req, res) => {
  try {
    const { name, subjectCode, credit } = req.body;

    if (!name || !subjectCode || !credit || credit < 1) {
      return res.status(400).json({ error: "Invalid subject data" });
    }

    const newSubject = new Subject({ name, subjectCode, credit });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update subject
router.put("/:id", async (req, res) => {
  try {
    const { name, subjectCode, credit } = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, subjectCode, credit },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete subject
router.delete("/:id", async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    if (!deletedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
