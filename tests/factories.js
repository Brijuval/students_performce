/**
 * Test data factories for creating consistent test objects.
 */

/**
 * Returns a plain student data object. Optionally override any field.
 * @param {object} overrides
 */
function makeStudent(overrides = {}) {
    return {
        name: 'Alice Smith',
        rollNumber: 'R001',
        department: 'Computer Science',
        year: 2024,
        ...overrides,
    };
}

/**
 * Returns a plain subject data object. Optionally override any field.
 * @param {object} overrides
 */
function makeSubject(overrides = {}) {
    return {
        name: 'Mathematics',
        subjectCode: 'MATH101',
        credit: 3,
        ...overrides,
    };
}

/**
 * Returns a plain result data object. Optionally override any field.
 * @param {object} overrides
 */
function makeResult(overrides = {}) {
    return {
        studentID: 'R001',
        subjectCode: 'MATH101',
        marks: 75,
        ...overrides,
    };
}

module.exports = {
    makeStudent,
    makeSubject,
    makeResult,
};
