
const Result = require("../models/result");
const Subject = require("../models/subject");
const Student = require("../models/student"); // add this if not already
const express = require("express");
const router = express.Router();


router.get("/cgpa/:studentID", async (req, res) => {
  const studentID = req.params.studentID;

  try {
    const student = await Student.findOne({ rollNumber:studentID }); // get student details

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const pipeline = [
      { $match: { studentID: studentID } },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectCode",
          foreignField: "subjectCode",
          as: "subjectInfo"
        }
      },
      { $unwind: { path: "$subjectInfo", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          gradePoints: {
            $switch: {
              branches: [
                { case: { $gte: ["$marks", 90] }, then: 10 },
                { case: { $gte: ["$marks", 80] }, then: 9 },
                { case: { $gte: ["$marks", 70] }, then: 8 },
                { case: { $gte: ["$marks", 60] }, then: 7 },
                { case: { $gte: ["$marks", 50] }, then: 6 },
                { case: { $gte: ["$marks", 40] }, then: 5 }
              ],
              default: 0
            }
          }
        }
      },
      {
        $addFields: {
          weightedPoints: {
            $multiply: ["$gradePoints", { $ifNull: ["$subjectInfo.credits", 0] }]
          }
        }
      },
      {
        $group: {
          _id: "$studentID",
          totalWeightedPoints: { $sum: "$weightedPoints" },
          totalCredits: { $sum: { $ifNull: ["$subjectInfo.credits", 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          studentID: "$_id",
          cgpa: {
            $cond: [
              { $eq: ["$totalCredits", 0] },
              0,
              { $divide: ["$totalWeightedPoints", "$totalCredits"] }
            ]
          }
        }
      }
    ];

    const result = await Result.aggregate(pipeline);
    const cgpa = result.length > 0 ? result[0].cgpa : 0;
    const status = cgpa >= 5.0 ? "Pass" : "Fail";

    res.json({
      studentID,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      cgpa: cgpa.toFixed(2),
      status
    });
  } catch (error) {
    console.error("Error computing CGPA:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
