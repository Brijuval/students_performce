class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.timeout = API_CONFIG.API_TIMEOUT;
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, {
                ...config,
                signal: AbortSignal.timeout(this.timeout)
            });

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(data?.message || API_CONFIG.ERRORS.SERVER_ERROR);
            error.status = response.status;
            error.code = data?.error_code;
            error.details = data?.details;
            throw error;
        }

        return {
            success: true,
            data: data?.data || data,
            message: data?.message,
            pagination: data?.pagination,
        };
    }

    /**
     * Handle errors
     */
    handleError(error) {
        if (error.name === 'AbortError') {
            return {
                success: false,
                message: API_CONFIG.ERRORS.TIMEOUT,
                error: error,
            };
        }

        if (!navigator.onLine) {
            return {
                success: false,
                message: API_CONFIG.ERRORS.NETWORK,
                error: error,
            };
        }

        return {
            success: false,
            message: error.message || API_CONFIG.ERRORS.SERVER_ERROR,
            error: error,
        };
    }

    // ============ STUDENTS ENDPOINTS ============

    async getStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_CONFIG.ENDPOINTS.STUDENTS}${queryString ? '?' + queryString : ''}`;
        return this.request(endpoint);
    }

    async getStudent(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.STUDENTS}${id}/`);
    }

    async createStudent(data) {
        return this.request(API_CONFIG.ENDPOINTS.STUDENTS, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateStudent(id, data) {
        return this.request(`${API_CONFIG.ENDPOINTS.STUDENTS}${id}/`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteStudent(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.STUDENTS}${id}/`, {
            method: 'DELETE',
        });
    }

    // ============ SUBJECTS ENDPOINTS ============

    async getSubjects(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_CONFIG.ENDPOINTS.SUBJECTS}${queryString ? '?' + queryString : ''}`;
        return this.request(endpoint);
    }

    async getSubject(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUBJECTS}${id}/`);
    }

    async createSubject(data) {
        return this.request(API_CONFIG.ENDPOINTS.SUBJECTS, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSubject(id, data) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUBJECTS}${id}/`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteSubject(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.SUBJECTS}${id}/`, {
            method: 'DELETE',
        });
    }

    // ============ RESULTS ENDPOINTS ============

    async getResults(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_CONFIG.ENDPOINTS.RESULTS}${queryString ? '?' + queryString : ''}`;
        return this.request(endpoint);
    }

    async getResult(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.RESULTS}${id}/`);
    }

    async createResult(data) {
        return this.request(API_CONFIG.ENDPOINTS.RESULTS, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateResult(id, data) {
        return this.request(`${API_CONFIG.ENDPOINTS.RESULTS}${id}/`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteResult(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.RESULTS}${id}/`, {
            method: 'DELETE',
        });
    }

    // ============ ANALYTICS ENDPOINTS ============

    async getAnalyticsSummary() {
        return this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS}cgpa/cgpa-stats`);
    }

    async getStudentPerformance(studentId) {
        return this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS}performance/${studentId}`);
    }

    async getSubjectPerformance() {
        return this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS}cgpa/subject-analysis`);
    }

    async getClassReport() {
        return this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS}cgpa/pass-fail`);
    }
}

// Initialize API client
const api = new APIClient(API_CONFIG.BASE_URL);
