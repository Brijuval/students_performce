const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    studentID: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true }, // Added studentID
    name: { type: String, required: true },
    rollNumber: { type: String, unique: true, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    subjects: [{
        name: String,
        marks: { type: Number, min: 0, max: 100 }, // Added mark validation
        credits: { type: Number, min: 1 } // Added credit validation
    }]
});

// Function to map marks to grade points
function getGradePoint(marks) {
    if (typeof marks !== 'number' || marks < 0 || marks > 100) {
        return NaN; // Handle invalid marks
    }
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 40) return 5;
    return 0; // Fail grade
}

// CGPA Calculation Method
StudentSchema.methods.calculateCGPA = function () {
    if (!this.subjects || this.subjects.length === 0) return 0;

    let totalCredits = 0;
    let totalGradePoints = 0;

    this.subjects.forEach(subject => {
        if (typeof subject.marks !== 'number' || typeof subject.credits !== 'number') {
            return; // Skip invalid subjects
        }
        let gradePoint = getGradePoint(subject.marks);
        if (isNaN(gradePoint)) return; // Skip invalid subjects
        totalGradePoints += gradePoint * subject.credits;
        totalCredits += subject.credits;
    });

    return totalCredits === 0 ? 0 : (totalGradePoints / totalCredits).toFixed(2);
};

// Create MongoDB Indexes for Fast Querying
StudentSchema.index({ rollNumber: 1 }, { unique: true });
StudentSchema.index({ department: 1 });

module.exports = mongoose.models.Student || mongoose.model("Student", StudentSchema);
