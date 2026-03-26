/**
 * API tests for the /api/results endpoints.
 * Uses Jest module mocking so no real database is required.
 * Covers: CRUD operations, validation, and error cases.
 */
const request = require('supertest');
const mongoose = require('mongoose');

// --- Mock the Result model before the app is loaded ---
const mockResultDoc = {
    _id: new mongoose.Types.ObjectId('64f1234567890abcdef01236'),
    studentID: 'R001',
    subjectCode: 'MATH101',
    marks: 75,
};

const mockResultModel = {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

function mockResultConstructor(data) {
    return {
        ...mockResultDoc,
        ...data,
        save: jest.fn().mockResolvedValue({ ...mockResultDoc, ...data }),
    };
}
Object.assign(mockResultConstructor, mockResultModel);

jest.mock('../server/models/result', () => mockResultConstructor);

const app = require('../server/app');
const { makeResult } = require('./factories');

const VALID_ID = '64f1234567890abcdef01236';

beforeEach(() => {
    jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/results
// ---------------------------------------------------------------------------
describe('POST /api/results', () => {
    test('creates a valid result (201)', async () => {
        const res = await request(app).post('/api/results').send(makeResult());
        expect(res.status).toBe(201);
        expect(res.body.studentID).toBe('R001');
        expect(res.body.subjectCode).toBe('MATH101');
        expect(res.body.marks).toBe(75);
    });

    test('creates result with marks = 0 (boundary)', async () => {
        const res = await request(app)
            .post('/api/results')
            .send(makeResult({ marks: 0, subjectCode: 'S1' }));
        expect(res.status).toBe(201);
        expect(res.body.marks).toBe(0);
    });

    test('creates result with marks = 100 (boundary)', async () => {
        const res = await request(app)
            .post('/api/results')
            .send(makeResult({ marks: 100, subjectCode: 'S2' }));
        expect(res.status).toBe(201);
        expect(res.body.marks).toBe(100);
    });
});

// ---------------------------------------------------------------------------
// GET /api/results
// ---------------------------------------------------------------------------
describe('GET /api/results', () => {
    test('returns empty array when no results exist (200)', async () => {
        mockResultModel.find.mockResolvedValue([]);
        const res = await request(app).get('/api/results');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    test('returns all results', async () => {
        mockResultModel.find.mockResolvedValue([
            { ...mockResultDoc, subjectCode: 'S01' },
            { ...mockResultDoc, subjectCode: 'S02' },
        ]);
        const res = await request(app).get('/api/results');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    test('returns 500 on database error', async () => {
        mockResultModel.find.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/api/results');
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// PUT /api/results/:id
// ---------------------------------------------------------------------------
describe('PUT /api/results/:id', () => {
    test('updates a result with valid data (200)', async () => {
        const updated = { ...mockResultDoc, marks: 90 };
        mockResultModel.findByIdAndUpdate.mockResolvedValue(updated);

        const res = await request(app)
            .put(`/api/results/${VALID_ID}`)
            .send({ studentID: 'R001', subjectCode: 'MATH101', marks: 90 });
        expect(res.status).toBe(200);
        expect(res.body.marks).toBe(90);
    });

    test('returns 404 when result not found', async () => {
        mockResultModel.findByIdAndUpdate.mockResolvedValue(null);
        const res = await request(app)
            .put(`/api/results/${VALID_ID}`)
            .send(makeResult());
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns 400 on update validation error', async () => {
        mockResultModel.findByIdAndUpdate.mockRejectedValue(new Error('validation failed'));
        const res = await request(app)
            .put(`/api/results/${VALID_ID}`)
            .send(makeResult());
        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// DELETE /api/results/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/results/:id', () => {
    test('deletes a result by ID (200)', async () => {
        mockResultModel.findByIdAndDelete.mockResolvedValue(mockResultDoc);
        const res = await request(app).delete(`/api/results/${VALID_ID}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);
    });

    test('returns 404 for non-existent result', async () => {
        mockResultModel.findByIdAndDelete.mockResolvedValue(null);
        const res = await request(app).delete(`/api/results/${VALID_ID}`);
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    test('returns 400 on delete error', async () => {
        mockResultModel.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
        const res = await request(app).delete(`/api/results/${VALID_ID}`);
        expect(res.status).toBe(400);
    });
});

