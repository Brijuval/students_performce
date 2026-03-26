/**
 * API tests for the /api/students endpoints.
 * Uses Jest module mocking so no real database is required.
 * Covers: CRUD operations, input validation, and error cases.
 */
const request = require('supertest');
const mongoose = require('mongoose');

// --- Mock the Student model before app is loaded ---
const mockStudentDoc = {
    _id: new mongoose.Types.ObjectId('64f1234567890abcdef01234'),
    name: 'Alice Smith',
    rollNumber: 'R001',
    department: 'Computer Science',
    year: 2024,
    subjects: [],
    save: jest.fn(),
};

const mockStudentModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

// Constructor mock: returns a document object with a save() method
function mockStudentConstructor(data) {
    return { ...mockStudentDoc, ...data, save: jest.fn().mockResolvedValue({ ...mockStudentDoc, ...data }) };
}
Object.assign(mockStudentConstructor, mockStudentModel);

jest.mock('../server/models/student', () => mockStudentConstructor);

// --- Mock mongoose.Types.ObjectId for ID validation ---
// The real mongoose is still used for ObjectId generation; we keep it intact.

const app = require('../server/app');
const { makeStudent } = require('./factories');

const VALID_ID = '64f1234567890abcdef01234';
const INVALID_ID = 'not-an-id';

beforeEach(() => {
    jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/students
// ---------------------------------------------------------------------------
describe('POST /api/students', () => {
    test('creates a new student with valid data (201)', async () => {
        mockStudentModel.findOne.mockResolvedValue(null); // no duplicate

        const res = await request(app).post('/api/students').send(makeStudent());
        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/added/i);
    });

    test('returns 400 when name is missing', async () => {
        const { name, ...data } = makeStudent();
        const res = await request(app).post('/api/students').send(data);
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('returns 400 when rollNumber is missing', async () => {
        const { rollNumber, ...data } = makeStudent();
        const res = await request(app).post('/api/students').send(data);
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('returns 400 when department is missing', async () => {
        const { department, ...data } = makeStudent();
        const res = await request(app).post('/api/students').send(data);
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('returns 400 when year is missing', async () => {
        const { year, ...data } = makeStudent();
        const res = await request(app).post('/api/students').send(data);
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('returns 400 for invalid year (too old)', async () => {
        const res = await request(app).post('/api/students').send(makeStudent({ year: 1800 }));
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/year/i);
    });

    test('returns 400 for duplicate rollNumber', async () => {
        // Simulate existing student with same rollNumber
        mockStudentModel.findOne.mockResolvedValue({ rollNumber: 'R001' });
        const res = await request(app).post('/api/students').send(makeStudent());
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/roll number/i);
    });

    test('returns 500 on unexpected server error', async () => {
        mockStudentModel.findOne.mockRejectedValue(new Error('DB error'));
        const res = await request(app).post('/api/students').send(makeStudent());
        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// GET /api/students
// ---------------------------------------------------------------------------
describe('GET /api/students', () => {
    test('returns empty list when no students exist (200)', async () => {
        mockStudentModel.find.mockResolvedValue([]);
        const res = await request(app).get('/api/students');
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
        expect(res.body.students).toHaveLength(0);
    });

    test('returns all students with count', async () => {
        const students = [
            { ...mockStudentDoc, rollNumber: 'A01' },
            { ...mockStudentDoc, rollNumber: 'A02' },
        ];
        mockStudentModel.find.mockResolvedValue(students);
        const res = await request(app).get('/api/students');
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(2);
        expect(res.body.students).toHaveLength(2);
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.find.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/students');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// GET /api/students/:id
// ---------------------------------------------------------------------------
describe('GET /api/students/:id', () => {
    test('returns a student for a valid ID (200)', async () => {
        mockStudentModel.findById.mockResolvedValue(mockStudentDoc);
        const res = await request(app).get(`/api/students/${VALID_ID}`);
        expect(res.status).toBe(200);
        expect(res.body.rollNumber).toBe('R001');
    });

    test('returns 404 when student is not found', async () => {
        mockStudentModel.findById.mockResolvedValue(null);
        const res = await request(app).get(`/api/students/${VALID_ID}`);
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns 400 for malformed ID', async () => {
        const res = await request(app).get(`/api/students/${INVALID_ID}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid/i);
    });
});

// ---------------------------------------------------------------------------
// PUT /api/students/:id
// ---------------------------------------------------------------------------
describe('PUT /api/students/:id', () => {
    test('updates a student with valid data (200)', async () => {
        const updated = { ...mockStudentDoc, name: 'Updated Name', department: 'Physics' };
        mockStudentModel.findByIdAndUpdate.mockResolvedValue(updated);
        mockStudentModel.findOne.mockResolvedValue(null); // no duplicate roll number

        const res = await request(app)
            .put(`/api/students/${VALID_ID}`)
            .send({ name: 'Updated Name', rollNumber: 'R001', department: 'Physics', year: 2025 });
        expect(res.status).toBe(200);
        expect(res.body.updatedStudent.name).toBe('Updated Name');
    });

    test('returns 404 when student is not found', async () => {
        mockStudentModel.findByIdAndUpdate.mockResolvedValue(null);
        mockStudentModel.findOne.mockResolvedValue(null);

        const res = await request(app)
            .put(`/api/students/${VALID_ID}`)
            .send(makeStudent());
        expect(res.status).toBe(404);
    });

    test('returns 400 for malformed ID', async () => {
        const res = await request(app)
            .put(`/api/students/${INVALID_ID}`)
            .send(makeStudent());
        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// DELETE /api/students/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/students/:id', () => {
    test('deletes a student by ID (200)', async () => {
        mockStudentModel.findByIdAndDelete.mockResolvedValue(mockStudentDoc);
        const res = await request(app).delete(`/api/students/${VALID_ID}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);
    });

    test('returns 404 for non-existent student', async () => {
        mockStudentModel.findByIdAndDelete.mockResolvedValue(null);
        const res = await request(app).delete(`/api/students/${VALID_ID}`);
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns 400 for malformed ID', async () => {
        const res = await request(app).delete(`/api/students/${INVALID_ID}`);
        expect(res.status).toBe(400);
    });

    test('returns 500 on database error', async () => {
        mockStudentModel.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
        const res = await request(app).delete(`/api/students/${VALID_ID}`);
        expect(res.status).toBe(500);
    });
});
