/**
 * Integration tests that exercise workflows spanning multiple endpoints.
 * Uses in-memory mock stores so no real database is required.
 * Tests simulate realistic user flows across Students, Subjects, Results, and Analytics.
 */
const request = require('supertest');
const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// In-memory stores - shared across all mocked models in this file
// ---------------------------------------------------------------------------
const stores = {
    students: [],
    subjects: [],
    results: [],
};

function resetStores() {
    stores.students = [];
    stores.subjects = [];
    stores.results = [];
}

// ---------------------------------------------------------------------------
// Student mock
// ---------------------------------------------------------------------------
const mockStudentStore = {
    findOne: jest.fn((q) => {
        const rn = q && q.rollNumber;
        const excludeId = q && q._id && q._id.$ne;
        if (!rn) return Promise.resolve(null);
        const found = stores.students.find(s =>
            s.rollNumber === rn && (!excludeId || String(s._id) !== String(excludeId))
        );
        return Promise.resolve(found || null);
    }),
    find: jest.fn(() => Promise.resolve([...stores.students])),
    findById: jest.fn((id) =>
        Promise.resolve(stores.students.find(s => String(s._id) === String(id)) || null)
    ),
    findByIdAndUpdate: jest.fn((id, data, opts) => {
        const idx = stores.students.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        stores.students[idx] = { ...stores.students[idx], ...data };
        return Promise.resolve(stores.students[idx]);
    }),
    findByIdAndDelete: jest.fn((id) => {
        const idx = stores.students.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        const [removed] = stores.students.splice(idx, 1);
        return Promise.resolve(removed);
    }),
    aggregate: jest.fn(() => Promise.resolve([])),
};

function mockStudentConstructor(data) {
    const doc = { _id: new mongoose.Types.ObjectId(), ...data };
    doc.save = jest.fn(() => { stores.students.push(doc); return Promise.resolve(doc); });
    return doc;
}
Object.assign(mockStudentConstructor, mockStudentStore);

jest.mock('../server/models/student', () => mockStudentConstructor);

// ---------------------------------------------------------------------------
// Subject mock
// ---------------------------------------------------------------------------
const mockSubjectStore = {
    find: jest.fn(() => Promise.resolve([...stores.subjects])),
    findByIdAndUpdate: jest.fn((id, data) => {
        const idx = stores.subjects.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        stores.subjects[idx] = { ...stores.subjects[idx], ...data };
        return Promise.resolve(stores.subjects[idx]);
    }),
    findByIdAndDelete: jest.fn((id) => {
        const idx = stores.subjects.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        const [removed] = stores.subjects.splice(idx, 1);
        return Promise.resolve(removed);
    }),
};

function mockSubjectConstructor(data) {
    const doc = { _id: new mongoose.Types.ObjectId(), ...data };
    doc.save = jest.fn(() => { stores.subjects.push(doc); return Promise.resolve(doc); });
    return doc;
}
Object.assign(mockSubjectConstructor, mockSubjectStore);

jest.mock('../server/models/subject', () => mockSubjectConstructor);

// ---------------------------------------------------------------------------
// Result mock
// ---------------------------------------------------------------------------
const mockResultStore = {
    find: jest.fn(() => Promise.resolve([...stores.results])),
    findByIdAndUpdate: jest.fn((id, data) => {
        const idx = stores.results.findIndex(r => String(r._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        stores.results[idx] = { ...stores.results[idx], ...data };
        return Promise.resolve(stores.results[idx]);
    }),
    findByIdAndDelete: jest.fn((id) => {
        const idx = stores.results.findIndex(r => String(r._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        const [removed] = stores.results.splice(idx, 1);
        return Promise.resolve(removed);
    }),
    aggregate: jest.fn(() => Promise.resolve([])),
};

function mockResultConstructor(data) {
    const doc = { _id: new mongoose.Types.ObjectId(), ...data };
    doc.save = jest.fn(() => { stores.results.push(doc); return Promise.resolve(doc); });
    return doc;
}
Object.assign(mockResultConstructor, mockResultStore);

jest.mock('../server/models/result', () => mockResultConstructor);

const app = require('../server/app');

beforeEach(() => {
    resetStores();
    jest.clearAllMocks();
    // Re-wire store-based implementations after clearAllMocks
    mockStudentStore.findOne.mockImplementation((q) => {
        const rn = q && q.rollNumber;
        const excludeId = q && q._id && q._id.$ne;
        if (!rn) return Promise.resolve(null);
        const found = stores.students.find(s =>
            s.rollNumber === rn && (!excludeId || String(s._id) !== String(excludeId))
        );
        return Promise.resolve(found || null);
    });
    mockStudentStore.find.mockImplementation(() => Promise.resolve([...stores.students]));
    mockStudentStore.findById.mockImplementation((id) =>
        Promise.resolve(stores.students.find(s => String(s._id) === String(id)) || null)
    );
    mockStudentStore.findByIdAndUpdate.mockImplementation((id, data) => {
        const idx = stores.students.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        stores.students[idx] = { ...stores.students[idx], ...data };
        return Promise.resolve(stores.students[idx]);
    });
    mockStudentStore.findByIdAndDelete.mockImplementation((id) => {
        const idx = stores.students.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        const [removed] = stores.students.splice(idx, 1);
        return Promise.resolve(removed);
    });
    mockStudentStore.aggregate.mockImplementation(() => Promise.resolve([]));
    mockSubjectStore.find.mockImplementation(() => Promise.resolve([...stores.subjects]));
    mockSubjectStore.findByIdAndUpdate.mockImplementation((id, data) => {
        const idx = stores.subjects.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        stores.subjects[idx] = { ...stores.subjects[idx], ...data };
        return Promise.resolve(stores.subjects[idx]);
    });
    mockSubjectStore.findByIdAndDelete.mockImplementation((id) => {
        const idx = stores.subjects.findIndex(s => String(s._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        const [removed] = stores.subjects.splice(idx, 1);
        return Promise.resolve(removed);
    });
    mockResultStore.find.mockImplementation(() => Promise.resolve([...stores.results]));
    mockResultStore.findByIdAndUpdate.mockImplementation((id, data) => {
        const idx = stores.results.findIndex(r => String(r._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        stores.results[idx] = { ...stores.results[idx], ...data };
        return Promise.resolve(stores.results[idx]);
    });
    mockResultStore.findByIdAndDelete.mockImplementation((id) => {
        const idx = stores.results.findIndex(r => String(r._id) === String(id));
        if (idx === -1) return Promise.resolve(null);
        const [removed] = stores.results.splice(idx, 1);
        return Promise.resolve(removed);
    });
    mockResultStore.aggregate.mockImplementation(() => Promise.resolve([]));
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
// Validation error cases
// ---------------------------------------------------------------------------
describe('Validation error cases integration', () => {
    test('creating a student with missing fields returns 400', async () => {
        const res = await request(app).post('/api/students').send({ name: 'Incomplete' });
        expect(res.status).toBe(400);
    });

    test('creating a subject with credit < 1 returns 400', async () => {
        const res = await request(app).post('/api/subjects').send({
            name: 'Bad Subject',
            subjectCode: 'BAD01',
            credit: 0,
        });
        expect(res.status).toBe(400);
    });

    test('getting a student with invalid ID format returns 400', async () => {
        const res = await request(app).get('/api/students/not-a-valid-id');
        expect(res.status).toBe(400);
    });

    test('getting a non-existent student returns 404', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/api/students/${validId}`);
        expect(res.status).toBe(404);
    });

    test('getting a non-existent subject returns 404', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).put(`/api/subjects/${validId}`).send({
            name: 'Test',
            subjectCode: 'T01',
            credit: 2,
        });
        expect(res.status).toBe(404);
    });
});

// ---------------------------------------------------------------------------
// Analytics endpoints smoke tests
// ---------------------------------------------------------------------------
describe('Analytics endpoints integration', () => {
    test('analytics/cgpa/:studentID returns 404 for unknown student', async () => {
        const res = await request(app).get('/api/analytics/cgpa/UNKNOWN');
        expect(res.status).toBe(404);
    });

    test('analytics/compare returns 400 when query params missing', async () => {
        const res = await request(app).get('/api/analytics/compare');
        expect(res.status).toBe(400);
    });

    test('analytics/cgpa/cgpa-stats returns 200 with zeroed stats when empty', async () => {
        const res = await request(app).get('/api/analytics/cgpa/cgpa-stats');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('averageCGPA');
        expect(res.body).toHaveProperty('passPercentage');
    });

    test('analytics/cgpa/pass-fail returns 200 with empty list when no data', async () => {
        mockStudentStore.aggregate.mockResolvedValue([]);
        const res = await request(app).get('/api/analytics/cgpa/pass-fail');
        expect(res.status).toBe(200);
        expect(res.body.students).toHaveLength(0);
    });
});


