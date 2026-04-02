// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 30000, // 30 seconds
    DEFAULT_PAGE_SIZE: 10,

    ENDPOINTS: {
        STUDENTS: '/students/',
        SUBJECTS: '/subjects/',
        RESULTS: '/results/',
        ANALYTICS: '/analytics/',
    },

    // Error messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        TIMEOUT: 'Request timeout. Please try again.',
        INVALID_DATA: 'Invalid data. Please check your input.',
        NOT_FOUND: 'Resource not found.',
        UNAUTHORIZED: 'Unauthorized access.',
        SERVER_ERROR: 'Server error. Please try again later.',
    },

    // Status codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        SERVER_ERROR: 500,
    }
};

// Local storage keys
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    LAST_SYNC: 'last_sync_time',
};

// Notification settings
const NOTIFY_CONFIG = {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
    INFO_DURATION: 3000,
    WARNING_DURATION: 4000,
};

// Analytics thresholds
const ANALYTICS_CONFIG = {
    PASS_CGPA_THRESHOLD: 5,
};
