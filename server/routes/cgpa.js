const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Function to convert marks to grade points
function getGradePoint(marks) {
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 50) return 6;
  if (marks >= 40) return 5;
  return 0; // Fail
}

// 🟢 Route 1: Calculate CGPA for each student
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().populate({
      path: "results.subject",
      select: "credit"
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ error: "No student records found." });
    }

    const studentCGPA = students.map(student => {
      let totalPoints = 0;
      let totalCredits = 0;

      if (!student.results || student.results.length === 0) {
        return { studentId: student._id, name: student.name, cgpa: "N/A" };
      }

      student.results.forEach(result => {
        if (!result.subject || typeof result.marks !== "number") return;

        const gradePoint = getGradePoint(result.marks);
        const credit = result.subject.credit || 0;

        totalPoints += gradePoint * credit;
        totalCredits += credit;
      });

      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";

      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber || "N/A",
        department: student.department || "N/A",
        cgpa: cgpa !== "N/A" ? parseFloat(cgpa) : "N/A"
      };
    });

    res.json(studentCGPA);
  } catch (error) {
    console.error("Error fetching CGPA:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// 🟢 Route 2: Get CGPA Statistics (Average, Highest, Pass %)
router.get("/cgpa-stats", async (req, res) => {
  try {
    const students = await Student.find({}, "cgpa");

    if (!students || students.length === 0) {
      return res.json({ averageCGPA: 0, highestCGPA: 0, passPercentage: 0 });
    }

    const cgpas = students.map(student => student.cgpa).filter(cgpa => typeof cgpa === "number");

    if (cgpas.length === 0) {
      return res.json({ averageCGPA: 0, highestCGPA: 0, passPercentage: 0 });
    }

    const totalStudents = cgpas.length;
    const totalCGPA = cgpas.reduce((sum, cgpa) => sum + cgpa, 0);
    const passingStudents = cgpas.filter(cgpa => cgpa >= 5.0).length;

    const stats = {
      averageCGPA: (totalCGPA / totalStudents).toFixed(2),
      highestCGPA: Math.max(...cgpas),
      passPercentage: ((passingStudents / totalStudents) * 100).toFixed(2)
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching CGPA statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🟢 Route 3: Get pass/fail list based on CGPA
router.get("/pass-fail", async (req, res) => {
  try {
    const students = await Student.find({}, "name rollNumber cgpa");

    if (!students || students.length === 0) {
      return res.status(404).json({ error: "No students found" });
    }

    const studentStatus = students.map(student => {
      let status = "Fail";
      if (typeof student.cgpa === "number" && student.cgpa >= 5.0) {
        status = "Pass";
      }

      return {
        name: student.name,
        rollNumber: student.rollNumber || "N/A",
        cgpa: student.cgpa !== undefined ? student.cgpa : "N/A",
        status
      };
    });

    res.json({ students: studentStatus });
  } catch (error) {
    console.error("Error fetching pass/fail data:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


module.exports = router;
