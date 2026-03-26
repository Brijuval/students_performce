const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/student");

// Add a new student
router.post("/", async (req, res) => {
    try {
        const { name, rollNumber, department, year } = req.body;

        if (!name || !rollNumber || !department || !year) {
            return res.status(400).json({ error: "All fields are required." });
        }

        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
            return res.status(400).json({ error: "Invalid year." });
        }

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ error: "Roll number already exists." });
        }

        const studentID = new mongoose.Types.ObjectId();
        const newStudent = new Student({ name, rollNumber, department, year, studentID });
        const result = await newStudent.save();

        res.status(201).json({ message: "Student added", insertedStudent: result });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Get all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.json({ count: students.length, students });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Get a single student by ID
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid student ID format" });
        }

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: "Error fetching student", details: error.message });
    }
});

// Update a student by ID
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid student ID format" });
        }

        const { name, rollNumber, department, year, subjects } = req.body;
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { name, rollNumber, department, year, subjects },
            { new: true, runValidators: true }
        );
        if (rollNumber) {
            const existingStudent = await Student.findOne({ rollNumber, _id: { $ne: req.params.id } });
            if (existingStudent) {
                return res.status(400).json({ error: "Roll number already exists." });
            }
        }

        if (!updatedStudent) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ message: "Student updated successfully", updatedStudent });
    } catch (error) {
        res.status(400).json({ error: "Invalid data", details: error.message });
    }
});

// Delete a student by ID
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid student ID format" });
        }

        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Get CGPA and analytics


router.get("/cgpa-analytics", async (req, res) => {
    try {
        console.log("📢 Fetching CGPA analytics...");

        const students = await Student.find();
        console.log("📝 Total Students Found:", students.length);

        const analytics = await Student.aggregate([
            { $unwind: { path: "$subjects", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    studentId: { $first: { $toString: "$_id" } }, // Convert _id to string
                    name: { $first: "$name" },
                    rollNumber: { $first: "$rollNumber" },
                    totalMarks: { $sum: { $ifNull: ["$subjects.marks", 0] } },
                    subjectCount: { $sum: { $cond: { if: { $gt: ["$subjects", null] }, then: 1, else: 0 } } }
                }
            },
            {
                $addFields: {
                    cgpa: {
                        $cond: {
                            if: { $gt: ["$subjectCount", 0] },
                            then: { $divide: ["$totalMarks", "$subjectCount"] },
                            else: 0
                        }
                    }
                }
            },
            { $sort: { cgpa: -1 } }
        ]);

        console.log("✅ Aggregation Result:", analytics);

        const totalStudents = analytics.length;
        const passingStudents = analytics.filter(student => student.cgpa >= 5);
        const passRate = totalStudents > 0 ? ((passingStudents.length / totalStudents) * 100).toFixed(2) : "0.00";

        res.json({ analytics, passRate });
    } catch (error) {
        console.error("❌ ERROR in CGPA Analytics:", error.message);
        res.status(500).json({ error: "Error fetching CGPA data", details: error.message });
    }
});



module.exports = router;