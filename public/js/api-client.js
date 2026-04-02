/**
 * Centralized API client for the Student Performance Management System.
 * Handles all HTTP requests to the Django backend.
 */

const ApiClient = (() => {
  const BASE_URL = (typeof CONFIG !== "undefined" && CONFIG.API_BASE_URL)
    ? CONFIG.API_BASE_URL
    : "http://localhost:8000/api";

  async function request(method, path, body = null) {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return {
    get: (path) => request("GET", path),
    post: (path, data) => request("POST", path, data),
    put: (path, data) => request("PUT", path, data),
    patch: (path, data) => request("PATCH", path, data),
    delete: (path) => request("DELETE", path),

    // Students
    getStudents: (params = "") => request("GET", `/students/${params}`),
    getStudent: (id) => request("GET", `/students/${id}/`),
    createStudent: (data) => request("POST", "/students/", data),
    updateStudent: (id, data) => request("PUT", `/students/${id}/`, data),
    patchStudent: (id, data) => request("PATCH", `/students/${id}/`, data),
    deleteStudent: (id) => request("DELETE", `/students/${id}/`),
    getStudentPerformance: (id) => request("GET", `/students/${id}/performance/`),

    // Subjects
    getSubjects: (params = "") => request("GET", `/subjects/${params}`),
    getSubject: (id) => request("GET", `/subjects/${id}/`),
    createSubject: (data) => request("POST", "/subjects/", data),
    updateSubject: (id, data) => request("PUT", `/subjects/${id}/`, data),
    patchSubject: (id, data) => request("PATCH", `/subjects/${id}/`, data),
    deleteSubject: (id) => request("DELETE", `/subjects/${id}/`),

    // Results
    getResults: (params = "") => request("GET", `/results/${params}`),
    getResult: (id) => request("GET", `/results/${id}/`),
    createResult: (data) => request("POST", "/results/", data),
    updateResult: (id, data) => request("PUT", `/results/${id}/`, data),
    deleteResult: (id) => request("DELETE", `/results/${id}/`),

    // Analytics
    getSummary: () => request("GET", "/analytics/summary/"),
    getSubjectAnalysis: () => request("GET", "/analytics/subject-analysis/"),
    getPassFail: () => request("GET", "/analytics/pass-fail/"),
    getCgpaStats: () => request("GET", "/analytics/cgpa-stats/"),
    getStudentPerformanceByRoll: (rollNumber) =>
      request("GET", `/analytics/performance/${rollNumber}/`),
    compareStudents: (roll1, roll2) =>
      request("GET", `/analytics/compare/?student1=${roll1}&student2=${roll2}`),
  };
})();
