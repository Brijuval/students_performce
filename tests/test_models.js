/**
 * Unit tests for Mongoose models: Student, Subject, Result.
 * Tests field constraints, required fields, uniqueness, and custom methods.
 * Uses validateSync() which runs schema validation without a database connection.
 */
const mongoose = require('mongoose');

// Load models (no DB connection needed for schema validation)
const Student = require('../server/models/student');
const Subject = require('../server/models/subject');
const Result = require('../server/models/result');

// ---------------------------------------------------------------------------
// Student Model
// ---------------------------------------------------------------------------
describe('Student Model — schema validation', () => {
    function validStudentData(overrides = {}) {
        return {
            studentID: new mongoose.Types.ObjectId(),
            name: 'Alice Smith',
            rollNumber: 'R001',
            department: 'Computer Science',
            year: 2024,
            ...overrides,
        };
    }

    test('passes validation for a valid student', () => {
        const student = new Student(validStudentData());
        const err = student.validateSync();
        expect(err).toBeUndefined();
    });

    test('fails validation when name is missing', () => {
        const { name, ...data } = validStudentData();
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('name');
    });

    test('fails validation when rollNumber is missing', () => {
        const { rollNumber, ...data } = validStudentData();
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('rollNumber');
    });

    test('fails validation when department is missing', () => {
        const { department, ...data } = validStudentData();
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('department');
    });

    test('fails validation when year is missing', () => {
        const { year, ...data } = validStudentData();
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('year');
    });

    test('fails validation when subject marks exceed 100', () => {
        const data = validStudentData({ subjects: [{ name: 'Math', marks: 150, credits: 3 }] });
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
    });

    test('fails validation when subject marks are below 0', () => {
        const data = validStudentData({ subjects: [{ name: 'Math', marks: -5, credits: 3 }] });
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
    });

    test('fails validation when subject credits are below 1', () => {
        const data = validStudentData({ subjects: [{ name: 'Math', marks: 70, credits: 0 }] });
        const err = new Student(data).validateSync();
        expect(err).toBeDefined();
    });

    test('passes validation for subject at boundary marks 0 and 100', () => {
        const data = validStudentData({
            subjects: [
                { name: 'Math', marks: 0, credits: 1 },
                { name: 'Physics', marks: 100, credits: 1 },
            ],
        });
        const err = new Student(data).validateSync();
        expect(err).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Student.calculateCGPA()
// ---------------------------------------------------------------------------
describe('Student.calculateCGPA()', () => {
    test('returns 0 when student has no subjects', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'Test',
            rollNumber: 'T001',
            department: 'CS',
            year: 2024,
        });
        expect(student.calculateCGPA()).toBe(0);
    });

    test('computes CGPA correctly with multiple subjects', () => {
        // marks=90 → gradePoint=10, credits=4; marks=80 → gradePoint=9, credits=3
        // CGPA = (10*4 + 9*3) / (4+3) = 67/7 ≈ 9.57
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'Test',
            rollNumber: 'T002',
            department: 'CS',
            year: 2024,
            subjects: [
                { name: 'Math', marks: 90, credits: 4 },
                { name: 'Physics', marks: 80, credits: 3 },
            ],
        });
        expect(parseFloat(student.calculateCGPA())).toBeCloseTo(9.57, 1);
    });

    test('grade thresholds: marks>=90 → 10', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T003',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 90, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(10);
    });

    test('grade thresholds: marks>=80 → 9', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T004',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 80, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(9);
    });

    test('grade thresholds: marks>=70 → 8', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T005',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 70, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(8);
    });

    test('grade thresholds: marks>=60 → 7', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T006',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 60, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(7);
    });

    test('grade thresholds: marks>=50 → 6', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T007',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 50, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(6);
    });

    test('grade thresholds: marks>=40 → 5', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T008',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 40, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(5);
    });

    test('grade thresholds: marks<40 → 0 (fail)', () => {
        const student = new Student({
            studentID: new mongoose.Types.ObjectId(),
            name: 'T',
            rollNumber: 'T009',
            department: 'CS',
            year: 2024,
            subjects: [{ name: 'A', marks: 30, credits: 1 }],
        });
        expect(parseFloat(student.calculateCGPA())).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Subject Model
// ---------------------------------------------------------------------------
describe('Subject Model — schema validation', () => {
    function validSubjectData(overrides = {}) {
        return { name: 'Mathematics', subjectCode: 'MATH101', credit: 3, ...overrides };
    }

    test('passes validation for a valid subject', () => {
        const err = new Subject(validSubjectData()).validateSync();
        expect(err).toBeUndefined();
    });

    test('fails validation when name is missing', () => {
        const { name, ...data } = validSubjectData();
        const err = new Subject(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('name');
    });

    test('fails validation when subjectCode is missing', () => {
        const { subjectCode, ...data } = validSubjectData();
        const err = new Subject(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('subjectCode');
    });

    test('fails validation when credit is missing', () => {
        const { credit, ...data } = validSubjectData();
        const err = new Subject(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('credit');
    });
});

// ---------------------------------------------------------------------------
// Result Model
// ---------------------------------------------------------------------------
describe('Result Model — schema validation', () => {
    function validResultData(overrides = {}) {
        return { studentID: 'R001', subjectCode: 'MATH101', marks: 75, ...overrides };
    }

    test('passes validation for a valid result', () => {
        const err = new Result(validResultData()).validateSync();
        expect(err).toBeUndefined();
    });

    test('fails validation when studentID is missing', () => {
        const { studentID, ...data } = validResultData();
        const err = new Result(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('studentID');
    });

    test('fails validation when subjectCode is missing', () => {
        const { subjectCode, ...data } = validResultData();
        const err = new Result(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('subjectCode');
    });

    test('fails validation when marks is missing', () => {
        const { marks, ...data } = validResultData();
        const err = new Result(data).validateSync();
        expect(err).toBeDefined();
        expect(err.errors).toHaveProperty('marks');
    });

    test('passes validation for boundary marks 0', () => {
        const err = new Result(validResultData({ marks: 0 })).validateSync();
        expect(err).toBeUndefined();
    });

    test('passes validation for boundary marks 100', () => {
        const err = new Result(validResultData({ marks: 100 })).validateSync();
        expect(err).toBeUndefined();
    });
});
