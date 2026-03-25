/**
 * API tests for the /api/analytics endpoints.
 * Uses Jest module mocking so no real database is required.
 * Covers: CGPA calculation, subject analysis, stats, pass/fail, performance.
 */
const request = require('supertest');
const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Mock all three models before the app is loaded
// ---------------------------------------------------------------------------
const mockStudentModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
};
function StudentConstructor(data) {
    return { ...data, save: jest.fn().mockResolvedValue(data) };
}
Object.assign(StudentConstructor, mockStudentModel);
jest.mock('../server/models/student', () => StudentConstructor);

const mockSubjectModel = { find: jest.fn() };
function SubjectConstructor(data) {
    return { ...data, save: jest.fn().mockResolvedValue(data) };
}
Object.assign(SubjectConstructor, mockSubjectModel);
jest.mock('../server/models/subject', () => SubjectConstructor);

const mockResultModel = {
    find: jest.fn(),
    aggregate: jest.fn(),
};
function ResultConstructor(data) {
    return { ...data, save: jest.fn().mockResolvedValue(data) };
}
Object.assign(ResultConstructor, mockResultModel);
jest.mock('../server/models/result', () => ResultConstructor);

const app = require('../server/app');

beforeEach(() => {
    jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/analytics/cgpa/:studentID
// ---------------------------------------------------------------------------
describe('GET /api/analytics/cgpa/:studentID', () => {
    test('returns 404 for non-existent student', async () => {
        mockStudentModel.findOne.mockResolvedValue(null);
        const res = await request(app).get('/api/analytics/cgpa/NOTEXIST');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns CGPA = 0 and Fail for student with no results', async () => {
        mockStudentModel.findOne.mockResolvedValue({
            rollNumber: 'S01',
            name: 'Alice',
            department: 'CS',
        });
        mockResultModel.aggregate.mockResolvedValue([]);
        const res = await request(app).get('/api/analytics/cgpa/S01');
        expect(res.status).toBe(200);
        expect(parseFloat(res.body.cgpa)).toBe(0);
        expect(res.body.status).toBe('Fail');
    });

    test('returns CGPA and Pass for student with good results', async () => {
        mockStudentModel.findOne.mockResolvedValue({
            rollNumber: 'S02',
            name: 'Bob',
            department: 'Math',
        });
        mockResultModel.aggregate.mockResolvedValue([{
            studentID: 'S02',
            totalWeightedPoints: 36,
            totalCredits: 4,
            cgpa: 9.0,
            subjectDetails: [],
        }]);
        const res = await request(app).get('/api/analytics/cgpa/S02');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Pass');
        expect(parseFloat(res.body.cgpa)).toBeCloseTo(9.0, 1);
    });

    test('returns Fail status when CGPA < 5', async () => {
        mockStudentModel.findOne.mockResolvedValue({
            rollNumber: 'S03',
            name: 'Carol',
            department: 'Arts',
        });
        mockResultModel.aggregate.mockResolvedValue([{
            studentID: 'S03',
            totalWeightedPoints: 0,
            totalCredits: 2,
            cgpa: 0,
            subjectDetails: [],
        }]);
        const res = await request(app).get('/api/analytics/cgpa/S03');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Fail');
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.findOne.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/cgpa/S04');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/cgpa/subject-analysis
// ---------------------------------------------------------------------------
describe('GET /api/analytics/cgpa/subject-analysis', () => {
    test('returns subject averages when data exists', async () => {
        mockResultModel.aggregate.mockResolvedValue([
            { subjectName: 'Mathematics', averageMarks: 78.5, count: 10 },
            { subjectName: 'Physics', averageMarks: 65.0, count: 8 },
        ]);
        const res = await request(app).get('/api/analytics/cgpa/subject-analysis');
        expect(res.status).toBe(200);
        expect(res.body.allSubjectAverages).toHaveLength(2);
        expect(res.body.allSubjectAverages[0]).toHaveProperty('subjectName');
        expect(res.body.allSubjectAverages[0]).toHaveProperty('averageMarks');
    });

    test('returns no-data message when aggregate returns empty array', async () => {
        mockResultModel.aggregate.mockResolvedValue([]);
        const res = await request(app).get('/api/analytics/cgpa/subject-analysis');
        expect(res.status).toBe(200);
        expect(res.body.message).toBeDefined();
    });

    test('returns 500 on database error', async () => {
        mockResultModel.aggregate.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/cgpa/subject-analysis');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/cgpa/cgpa-stats
// ---------------------------------------------------------------------------
describe('GET /api/analytics/cgpa/cgpa-stats', () => {
    test('returns averageCGPA, highestCGPA, passPercentage (200)', async () => {
        // First aggregate call: all-results CGPA stats
        // Second aggregate call: pass/fail data
        mockResultModel.aggregate
            .mockResolvedValueOnce([{ averageCGPA: 7.5, highestCGPA: 9.8 }])
            .mockResolvedValueOnce([{ passPercentage: 80 }]);

        const res = await request(app).get('/api/analytics/cgpa/cgpa-stats');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('averageCGPA');
        expect(res.body).toHaveProperty('highestCGPA');
        expect(res.body).toHaveProperty('passPercentage');
    });

    test('returns zeros when no results exist', async () => {
        mockResultModel.aggregate
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const res = await request(app).get('/api/analytics/cgpa/cgpa-stats');
        expect(res.status).toBe(200);
        expect(res.body.averageCGPA).toBe(0);
        expect(res.body.highestCGPA).toBe(0);
        expect(res.body.passPercentage).toBe(0);
    });

    test('returns 500 on database error', async () => {
        mockResultModel.aggregate.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/cgpa/cgpa-stats');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/cgpa/pass-fail
// ---------------------------------------------------------------------------
describe('GET /api/analytics/cgpa/pass-fail', () => {
    test('returns students list with status (200)', async () => {
        mockStudentModel.aggregate.mockResolvedValue([
            { studentID: 'R01', name: 'Alice', rollNumber: 'R01', cgpa: 7.5, status: 'Pass' },
            { studentID: 'R02', name: 'Bob', rollNumber: 'R02', cgpa: 3.0, status: 'Fail' },
        ]);
        const res = await request(app).get('/api/analytics/cgpa/pass-fail');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.students)).toBe(true);
        expect(res.body.students).toHaveLength(2);
    });

    test('returns empty list when no data', async () => {
        mockStudentModel.aggregate.mockResolvedValue([]);
        const res = await request(app).get('/api/analytics/cgpa/pass-fail');
        expect(res.status).toBe(200);
        expect(res.body.students).toHaveLength(0);
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.aggregate.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/cgpa/pass-fail');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/performance/:studentID
// ---------------------------------------------------------------------------
describe('GET /api/analytics/performance/:studentID', () => {
    test('returns performance data for existing student (200)', async () => {
        mockStudentModel.findOne.mockResolvedValue({
            name: 'Alice',
            rollNumber: 'P01',
            department: 'CS',
        });
        mockResultModel.find.mockResolvedValue([
            { studentID: 'P01', subjectCode: 'MATH', marks: 85 },
        ]);
        mockSubjectModel.find.mockResolvedValue([
            { subjectCode: 'MATH', name: 'Mathematics', credit: 3 },
        ]);

        const res = await request(app).get('/api/analytics/performance/P01');
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Alice');
        expect(res.body.rollNumber).toBe('P01');
        expect(Array.isArray(res.body.subjectPerformance)).toBe(true);
        expect(res.body.subjectPerformance[0].marks).toBe(85);
    });

    test('returns 404 for non-existent student', async () => {
        mockStudentModel.findOne.mockResolvedValue(null);
        const res = await request(app).get('/api/analytics/performance/NOTEXIST');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.findOne.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/performance/ERR');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/compare
// ---------------------------------------------------------------------------
describe('GET /api/analytics/compare', () => {
    test('returns 400 when student query params are missing', async () => {
        const res = await request(app).get('/api/analytics/compare');
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('returns 400 when only one student is provided', async () => {
        const res = await request(app).get('/api/analytics/compare?student1=C01');
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('returns comparison data for two existing students (200)', async () => {
        mockStudentModel.find.mockResolvedValue([
            { rollNumber: 'C01', name: 'Alice', department: 'CS' },
            { rollNumber: 'C02', name: 'Bob', department: 'Math' },
        ]);
        mockResultModel.find.mockResolvedValue([
            { studentID: 'C01', subjectCode: 'ENG', marks: 80 },
            { studentID: 'C02', subjectCode: 'ENG', marks: 60 },
        ]);
        mockSubjectModel.find.mockResolvedValue([
            { subjectCode: 'ENG', name: 'English', credit: 2 },
        ]);

        const res = await request(app).get('/api/analytics/compare?student1=C01&student2=C02');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.find.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/compare?student1=X&student2=Y');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/analytics/performance-with-class/:studentID
// ---------------------------------------------------------------------------
describe('GET /api/analytics/performance-with-class/:studentID', () => {
    test('returns student performance alongside class averages (200)', async () => {
        mockStudentModel.findOne.mockResolvedValue({
            name: 'Alice',
            rollNumber: 'PC01',
            department: 'CS',
        });
        mockResultModel.find.mockResolvedValue([
            { studentID: 'PC01', subjectCode: 'SCI', marks: 75 },
        ]);
        mockSubjectModel.find.mockResolvedValue([
            { subjectCode: 'SCI', name: 'Science', credit: 3 },
        ]);

        const res = await request(app).get('/api/analytics/performance-with-class/PC01');
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Alice');
        expect(Array.isArray(res.body.subjectPerformance)).toBe(true);
        expect(typeof res.body.classAverages).toBe('object');
    });

    test('returns 404 for non-existent student', async () => {
        mockStudentModel.findOne.mockResolvedValue(null);
        const res = await request(app).get('/api/analytics/performance-with-class/NOTEXIST');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.findOne.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/analytics/performance-with-class/ERR');
        expect(res.status).toBe(500);
    });
});
