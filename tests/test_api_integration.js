/**
 * Integration tests that exercise workflows spanning multiple endpoints.
 * These tests simulate realistic user flows: adding students, subjects,
 * recording results, and verifying analytics reflect those changes.
 */
const request = require('supertest');
const app = require('../server/app');
const db = require('./setup');

beforeAll(async () => {
    await db.connect();
});

afterAll(async () => {
    await db.disconnect();
});

afterEach(async () => {
    await db.clearDatabase();
});

// ---------------------------------------------------------------------------
// Full student lifecycle
// ---------------------------------------------------------------------------
describe('Student lifecycle integration', () => {
    test('create → read → update → delete a student', async () => {
        // Create
        const createRes = await request(app).post('/api/students').send({
            name: 'Integration User',
            rollNumber: 'INT001',
            department: 'Engineering',
            year: 2024,
        });
        expect(createRes.status).toBe(201);
        const studentId = createRes.body.insertedStudent._id;

        // Read
        const readRes = await request(app).get(`/api/students/${studentId}`);
        expect(readRes.status).toBe(200);
        expect(readRes.body.name).toBe('Integration User');

        // Update
        const updateRes = await request(app)
            .put(`/api/students/${studentId}`)
            .send({ name: 'Updated User', rollNumber: 'INT001', department: 'Science', year: 2025 });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.updatedStudent.department).toBe('Science');

        // Delete
        const deleteRes = await request(app).delete(`/api/students/${studentId}`);
        expect(deleteRes.status).toBe(200);

        // Confirm deletion
        const afterDeleteRes = await request(app).get(`/api/students/${studentId}`);
        expect(afterDeleteRes.status).toBe(404);
    });
});

// ---------------------------------------------------------------------------
// Full subject lifecycle
// ---------------------------------------------------------------------------
describe('Subject lifecycle integration', () => {
    test('create → read all → update → delete a subject', async () => {
        // Create
        const createRes = await request(app).post('/api/subjects').send({
            name: 'Integration Subject',
            subjectCode: 'INT101',
            credit: 3,
        });
        expect(createRes.status).toBe(201);
        const subjectId = createRes.body._id;

        // Read all
        const listRes = await request(app).get('/api/subjects');
        expect(listRes.body).toHaveLength(1);
        expect(listRes.body[0].subjectCode).toBe('INT101');

        // Update
        const updateRes = await request(app)
            .put(`/api/subjects/${subjectId}`)
            .send({ name: 'Updated Subject', subjectCode: 'INT101', credit: 4 });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.credit).toBe(4);

        // Delete
        const deleteRes = await request(app).delete(`/api/subjects/${subjectId}`);
        expect(deleteRes.status).toBe(200);

        // Confirm deletion
        const afterDeleteRes = await request(app).get('/api/subjects');
        expect(afterDeleteRes.body).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Full result lifecycle
// ---------------------------------------------------------------------------
describe('Result lifecycle integration', () => {
    test('create → read all → update → delete a result', async () => {
        // Create
        const createRes = await request(app).post('/api/results').send({
            studentID: 'ROLL01',
            subjectCode: 'CS101',
            marks: 70,
        });
        expect(createRes.status).toBe(201);
        const resultId = createRes.body._id;

        // Read all
        const listRes = await request(app).get('/api/results');
        expect(listRes.body).toHaveLength(1);

        // Update
        const updateRes = await request(app)
            .put(`/api/results/${resultId}`)
            .send({ studentID: 'ROLL01', subjectCode: 'CS101', marks: 85 });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.marks).toBe(85);

        // Delete
        const deleteRes = await request(app).delete(`/api/results/${resultId}`);
        expect(deleteRes.status).toBe(200);

        // Confirm deletion
        const afterDeleteRes = await request(app).get('/api/results');
        expect(afterDeleteRes.body).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Analytics reflects created data
// ---------------------------------------------------------------------------
describe('Analytics integration', () => {
    test('CGPA analytics reflect recorded results', async () => {
        // Seed student, subject, result
        await request(app).post('/api/students').send({
            name: 'Analytics Test Student',
            rollNumber: 'ANST01',
            department: 'Math',
            year: 2024,
        });
        await request(app).post('/api/subjects').send({
            name: 'Calculus',
            subjectCode: 'CALC101',
            credit: 4,
        });
        await request(app).post('/api/results').send({
            studentID: 'ANST01',
            subjectCode: 'CALC101',
            marks: 80,
        });

        const cgpaRes = await request(app).get('/api/analytics/cgpa/ANST01');
        expect(cgpaRes.status).toBe(200);
        // marks=80 → gradePoint=9 → CGPA=9 >= 5 → Pass
        expect(cgpaRes.body.status).toBe('Pass');
        expect(parseFloat(cgpaRes.body.cgpa)).toBeGreaterThan(0);
    });

    test('pass/fail list grows as students and results are added', async () => {
        const emptyRes = await request(app).get('/api/analytics/cgpa/pass-fail');
        expect(emptyRes.body.students).toHaveLength(0);

        await request(app).post('/api/students').send({
            name: 'PF Student',
            rollNumber: 'PF01',
            department: 'Arts',
            year: 2023,
        });
        await request(app).post('/api/subjects').send({
            name: 'History',
            subjectCode: 'HIST01',
            credit: 2,
        });
        await request(app).post('/api/results').send({
            studentID: 'PF01',
            subjectCode: 'HIST01',
            marks: 55,
        });

        const populatedRes = await request(app).get('/api/analytics/cgpa/pass-fail');
        expect(populatedRes.body.students.length).toBeGreaterThanOrEqual(1);
    });

    test('subject analysis includes subjects with results', async () => {
        await request(app).post('/api/subjects').send({
            name: 'Statistics',
            subjectCode: 'STAT01',
            credit: 3,
        });
        await request(app).post('/api/results').send({
            studentID: 'ST01',
            subjectCode: 'STAT01',
            marks: 72,
        });

        const analysisRes = await request(app).get('/api/analytics/cgpa/subject-analysis');
        expect(analysisRes.status).toBe(200);
        if (Array.isArray(analysisRes.body.allSubjectAverages)) {
            const stats = analysisRes.body.allSubjectAverages.find(s => s.subjectName === 'Statistics');
            expect(stats).toBeDefined();
            expect(stats.averageMarks).toBe(72);
        }
    });

    test('cgpa-stats passPercentage increases when passing students are added', async () => {
        const emptyRes = await request(app).get('/api/analytics/cgpa/cgpa-stats');
        expect(emptyRes.body.passPercentage).toBe(0);

        await request(app).post('/api/subjects').send({
            name: 'Biology',
            subjectCode: 'BIO01',
            credit: 3,
        });
        await request(app).post('/api/results').send({
            studentID: 'BIO_STU',
            subjectCode: 'BIO01',
            marks: 70,
        });

        const populatedRes = await request(app).get('/api/analytics/cgpa/cgpa-stats');
        expect(populatedRes.status).toBe(200);
        // marks=70 → gradePoint=8 → CGPA=8 >= 5 → included in pass percentage
        expect(populatedRes.body.passPercentage).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// Error propagation across endpoints
// ---------------------------------------------------------------------------
describe('Cross-endpoint error handling', () => {
    test('analytics returns 404 for student that was deleted', async () => {
        await request(app).post('/api/students').send({
            name: 'Temp Student',
            rollNumber: 'TEMP01',
            department: 'CS',
            year: 2024,
        });

        // Should work initially - use performance endpoint which uses findOne
        const preDelete = await request(app).get('/api/analytics/performance/TEMP01');
        expect(preDelete.status).toBe(200);

        // Delete via students endpoint
        const listRes = await request(app).get('/api/students');
        const studentId = listRes.body.students[0]._id;
        await request(app).delete(`/api/students/${studentId}`);

        // Now analytics should return 404
        const postDelete = await request(app).get('/api/analytics/performance/TEMP01');
        expect(postDelete.status).toBe(404);
    });
});
