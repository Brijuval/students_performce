const Result = require("../models/result");
const Subject = require("../models/subject");
const Student = require("../models/student");
const express = require("express");
const router = express.Router();

// Compute Individual CGPA
router.get("/cgpa/:studentID", async (req, res) => {
  const studentID = req.params.studentID;

  try {
      // Find student by rollNumber (NOT ObjectId!)
      const student = await Student.findOne({ rollNumber: studentID });

      if (!student) {
          return res.status(404).json({ error: "Student not found" });
      }

      const pipeline = [
          { $match: { studentID: studentID } }, // studentID is rollNumber (string)
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
                  },
                  subjectCredits: "$subjectInfo.credit", // fix here
                  subjectName: "$subjectInfo.name",      // fix here
                  resultMarks: "$marks"
              }
          },
          {
              $addFields: {
                  weightedPoints: {
                      $multiply: ["$gradePoints", { $ifNull: ["$subjectCredits", 0] }]
                  }
              }
          },
          {
              $group: {
                  _id: "$studentID",
                  totalWeightedPoints: { $sum: "$weightedPoints" },
                  totalCredits: { $sum: { $ifNull: ["$subjectCredits", 0] } },
                  subjectDetails: {
                      $push: {
                          subjectName: "$subjectName",
                          marks: "$resultMarks",
                          credits: "$subjectCredits",
                          gradePoints: "$gradePoints",
                          weightedPoints: "$weightedPoints"
                      }
                  }
              }
          },
          {
              $project: {
                  _id: 0,
                  studentID: "$_id",
                  totalWeightedPoints: 1,
                  totalCredits: 1,
                  subjectDetails: 1,
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

// Subject Performance Analysis
router.get("/cgpa/subject-analysis", async (req, res) => {
    try {
        const analysis = await Result.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectCode",
                    foreignField: "subjectCode",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $group: {
                    _id: "$subjectInfo.name",
                    averageMarks: { $avg: "$marks" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { averageMarks: -1 } },
            {
                $project: {
                    _id: 0,
                    subjectName: "$_id",
                    averageMarks: { $round: ["$averageMarks", 2] },
                    count: 1
                }
            }
        ]);

        if (analysis.length > 0) {
            res.json({ allSubjectAverages: analysis });
        } else {
            res.json({ message: "No results data available for subject analysis." });
        }

    } catch (error) {
        console.error("Error during subject-wise analysis:", error);
        res.status(500).json({ error: "Failed to perform subject analysis", details: error.message });
    }
});

// CGPA Stats
router.get("/cgpa/cgpa-stats", async (req, res) => {
    try {
        const allResults = await Result.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectCode",
                    foreignField: "subjectCode",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $group: {
                    _id: "$studentID",
                    totalWeightedPoints: { $sum: { $multiply: ["$marks", "$subjectInfo.credit"] } },
                    totalCredits: { $sum: "$subjectInfo.credit" }
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
            },
            {
                $group: {
                    _id: null,
                    averageCGPA: { $avg: "$cgpa" },
                    highestCGPA: { $max: "$cgpa" }
                }
            }
        ]);

        const passFailData = await Result.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectCode",
                    foreignField: "subjectCode",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $group: {
                    _id: "$studentID",
                    totalWeightedPoints: { $sum: { $multiply: ["$marks", "$subjectInfo.credit"] } },
                    totalCredits: { $sum: "$subjectInfo.credit" }
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
                    },
                    pass: { $gte: [{
                                $cond: [
                                    { $eq: ["$totalCredits", 0] },
                                    0,
                                    { $divide: ["$totalWeightedPoints", "$totalCredits"] }
                                ]
                            }, 5] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    passingStudents: { $sum: { $cond: ["$pass", 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    passPercentage: {
                        $cond: [
                            { $eq: ["$totalStudents", 0] },
                            0,
                            { $multiply: [{ $divide: ["$passingStudents", "$totalStudents"] }, 100] }
                        ]
                    }
                }
            }
        ]);

        res.json({
            averageCGPA: (allResults[0]?.averageCGPA || 0),
            highestCGPA: (allResults[0]?.highestCGPA || 0),
            passPercentage: (passFailData[0]?.passPercentage || 0)
        });
    } catch (error) {
        console.error("Error fetching CGPA stats:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// Pass/Fail List
router.get("/cgpa/pass-fail", async (req, res) => {
    try {
        const studentsWithCGPA = await Student.aggregate([
            {
                $lookup: {
                    from: "results",
                    localField: "rollNumber",   // join by rollNumber
                    foreignField: "studentID",  // results.studentID == student.rollNumber
                    as: "results"
                }
            },
            {
                $unwind: { path: "$results", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "results.subjectCode",
                    foreignField: "subjectCode",
                    as: "subjects"
                }
            },
            {
                $unwind: { path: "$subjects", preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: "$rollNumber",
                    name: { $first: "$name" },
                    rollNumber: { $first: "$rollNumber" },
                    totalWeightedPoints: { $sum: { $multiply: [{ $ifNull: ["$results.marks", 0] }, { $ifNull: ["$subjects.credit", 0] }] } },
                    totalCredits: { $sum: { $ifNull: ["$subjects.credit", 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    studentID: "$_id",
                    name: 1,
                    rollNumber: 1,
                    cgpa: {
                        $cond: [
                            { $eq: ["$totalCredits", 0] },
                            0,
                            { $round: [{ $divide: ["$totalWeightedPoints", "$totalCredits"] }, 2] }
                        ]
                    },
                    status: {
                        $cond: [
                            { $gte: [{
                                    $cond: [
                                        { $eq: ["$totalCredits", 0] },
                                        0,
                                        { $divide: ["$totalWeightedPoints", "$totalCredits"] }
                                    ]
                                }, 5]
                            },
                            "Pass",
                            "Fail"
                        ]
                    }
                }
            }
        ]);

        res.json({ students: studentsWithCGPA });
    } catch (error) {
        console.error("Error fetching pass/fail data:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get("/performance/:studentID", async (req, res) => {
    const studentID = req.params.studentID;
    try {
        const student = await Student.findOne({ rollNumber: studentID });
        if (!student) return res.status(404).json({ error: "Student not found" });

        const results = await Result.find({ studentID: studentID });
        const subjects = await Subject.find();

        const subjectPerformance = results.map(result => {
            const subj = subjects.find(s => s.subjectCode === result.subjectCode);
            return {
                subject: subj ? subj.name : result.subjectCode,
                marks: result.marks
            };
        });

        res.json({
            name: student.name,
            rollNumber: student.rollNumber,
            department: student.department,
            subjectPerformance
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/compare", async (req, res) => {
    // Usage: /api/analytics/compare?student1=12&student2=34
    const { student1, student2 } = req.query;
    if (!student1 || !student2) return res.status(400).json({ error: "Provide two student roll numbers" });

    try {
        const students = await Student.find({ rollNumber: { $in: [student1, student2] } });
        const results = await Result.find({ studentID: { $in: [student1, student2] } });
        const subjects = await Subject.find();

        // Prepare result mapping
        const studentResults = {};
        students.forEach(stud => {
            studentResults[stud.rollNumber] = {
                name: stud.name,
                rollNumber: stud.rollNumber,
                department: stud.department,
                subjects: []
            }
        });

        results.forEach(res => {
            const subj = subjects.find(s => s.subjectCode === res.subjectCode);
            const stud = studentResults[res.studentID];
            if (stud) {
                stud.subjects.push({
                    subject: subj ? subj.name : res.subjectCode,
                    marks: res.marks
                });
            }
        });

        res.json(Object.values(studentResults));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


router.get("/performance-with-class/:studentID", async (req, res) => {
    const studentID = req.params.studentID;
    try {
        const student = await Student.findOne({ rollNumber: studentID });
        if (!student) return res.status(404).json({ error: "Student not found" });
        const results = await Result.find();
        const subjects = await Subject.find();

        // Student's marks
        const myResults = results.filter(r => r.studentID === studentID);
        const subjectPerformance = myResults.map(r => {
            const subj = subjects.find(s => s.subjectCode === r.subjectCode);
            return { subject: subj ? subj.name : r.subjectCode, marks: r.marks };
        });

        // Class averages for each subject
        const classAverages = {};
        subjects.forEach(subj => {
            const marks = results.filter(r => r.subjectCode === subj.subjectCode).map(r => r.marks);
            classAverages[subj.name] = marks.length ? (marks.reduce((a,b)=>a+b,0) / marks.length) : 0;
        });

        res.json({
            name: student.name,
            rollNumber: student.rollNumber,
            department: student.department,
            subjectPerformance,
            classAverages
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;