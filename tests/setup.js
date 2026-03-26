/**
 * Test setup: provides in-memory mock implementations for mongoose.
 * This module exports helpers for tests that operate without a real database.
 *
 * For route/integration tests that import the Express app, mongoose is
 * mocked at the module level using Jest's automatic mocking.  Each test
 * file calls `db.reset()` between tests to clear any accumulated call state.
 */

/**
 * Reset all mock call history (useful in afterEach hooks).
 * Works by clearing jest.fn() mocks attached to model methods.
 */
function reset() {
    jest.clearAllMocks();
}

module.exports = { reset };
