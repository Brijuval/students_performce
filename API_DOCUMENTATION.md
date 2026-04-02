# API Documentation

Complete reference for all Students Performance Management System REST API endpoints.

## Base URL

```
http://localhost:8000/api/
```

All responses are JSON. Successful responses follow this structure:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "status_code": 200
}
```

Error responses follow this structure:

```json
{
  "success": false,
  "message": "Description of the error",
  "error_code": "ERROR_CODE",
  "status_code": 400,
  "details": null
}
```

---

## Students

### List Students

Retrieve a paginated list of students. Supports filtering and search.

```
GET /api/students/
```

**Query Parameters**

| Parameter   | Type   | Description                                       |
|-------------|--------|---------------------------------------------------|
| `status`    | string | Filter by status: `active` or `inactive`          |
| `search`    | string | Search by name, email, or phone                   |
| `page`      | int    | Page number (default: 1)                          |
| `page_size` | int    | Results per page (default: 10)                    |

**Example Request**

```bash
curl http://localhost:8000/api/students/?status=active&search=john
```

**Example Response**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "9876543210",
      "enrollment_date": "2023-08-01",
      "status": "active",
      "created_at": "2023-08-01T10:00:00Z",
      "updated_at": "2023-08-01T10:00:00Z"
    }
  ]
}
```

---

### Create Student

```
POST /api/students/
```

**Request Body**

| Field             | Type   | Required | Description                          |
|-------------------|--------|----------|--------------------------------------|
| `name`            | string | Yes      | Full name (max 255 characters)       |
| `email`           | string | Yes      | Unique email address                 |
| `phone`           | string | Yes      | 10-digit phone number                |
| `enrollment_date` | date   | Yes      | Format: `YYYY-MM-DD`                 |
| `status`          | string | No       | `active` (default) or `inactive`     |

**Example Request**

```bash
curl -X POST http://localhost:8000/api/students/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "9876543211",
    "enrollment_date": "2024-01-15",
    "status": "active"
  }'
```

**Example Response** `201 Created`

```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "9876543211",
  "enrollment_date": "2024-01-15",
  "status": "active",
  "created_at": "2024-01-15T09:30:00Z",
  "updated_at": "2024-01-15T09:30:00Z"
}
```

**Validation Errors** `400 Bad Request`

```json
{
  "email": ["student with this email already exists."],
  "phone": ["Phone must be 10 digits"]
}
```

---

### Get Student

```
GET /api/students/{id}/
```

**Example Response** `200 OK`

```json
{
  "id": 1,
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "9876543210",
  "enrollment_date": "2023-08-01",
  "status": "active",
  "created_at": "2023-08-01T10:00:00Z",
  "updated_at": "2023-08-01T10:00:00Z"
}
```

**Not Found** `404 Not Found`

```json
{
  "detail": "No Student matches the given query."
}
```

---

### Update Student

```
PUT /api/students/{id}/
```

Send the full resource body (same fields as Create). Use `PATCH` for partial updates.

**Example Request**

```bash
curl -X PUT http://localhost:8000/api/students/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "9876543210",
    "enrollment_date": "2023-08-01",
    "status": "inactive"
  }'
```

---

### Delete Student

```
DELETE /api/students/{id}/
```

**Response** `204 No Content`

---

## Subjects

### List Subjects

```
GET /api/subjects/
```

**Query Parameters**

| Parameter | Type   | Description                   |
|-----------|--------|-------------------------------|
| `search`  | string | Search by name or code        |

**Example Response**

```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH101",
      "description": "Core mathematics",
      "created_at": "2023-07-01T08:00:00Z"
    },
    {
      "id": 2,
      "name": "Physics",
      "code": "PHY101",
      "description": null,
      "created_at": "2023-07-01T08:05:00Z"
    }
  ]
}
```

---

### Create Subject

```
POST /api/subjects/
```

**Request Body**

| Field         | Type   | Required | Description                     |
|---------------|--------|----------|---------------------------------|
| `name`        | string | Yes      | Unique subject name (max 255)   |
| `code`        | string | Yes      | Unique subject code (max 10)    |
| `description` | string | No       | Optional description            |

**Example Request**

```bash
curl -X POST http://localhost:8000/api/subjects/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Chemistry", "code": "CHEM101", "description": "Organic chemistry"}'
```

---

### Get Subject

```
GET /api/subjects/{id}/
```

---

### Update Subject

```
PUT /api/subjects/{id}/
```

---

### Delete Subject

```
DELETE /api/subjects/{id}/
```

---

## Results

### List Results

```
GET /api/results/
```

**Query Parameters**

| Parameter   | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| `student`   | int    | Filter by student ID                           |
| `subject`   | int    | Filter by subject ID                           |
| `status`    | string | Filter by `pass` or `fail`                     |
| `grade`     | string | Filter by grade: `A`, `B`, `C`, `D`, or `F`   |
| `date_from` | date   | Filter results on or after this date (YYYY-MM-DD) |
| `date_to`   | date   | Filter results on or before this date          |

**Example Response**

```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "student": 1,
      "student_name": "John Smith",
      "subject": 1,
      "subject_name": "Mathematics",
      "marks_obtained": 85.0,
      "total_marks": 100.0,
      "percentage": 85.0,
      "grade": "B",
      "status": "pass",
      "exam_date": "2024-03-15",
      "created_at": "2024-03-15T14:00:00Z",
      "updated_at": "2024-03-15T14:00:00Z"
    }
  ]
}
```

---

### Create Result

```
POST /api/results/
```

`percentage`, `grade`, and `status` are automatically calculated by the server and must not be included in the request body.

**Request Body**

| Field           | Type  | Required | Description                                 |
|-----------------|-------|----------|---------------------------------------------|
| `student`       | int   | Yes      | Student ID                                  |
| `subject`       | int   | Yes      | Subject ID                                  |
| `marks_obtained`| float | Yes      | Marks scored (must be ≤ `total_marks`)      |
| `total_marks`   | float | No       | Total possible marks (default: 100)         |
| `exam_date`     | date  | Yes      | Exam date (YYYY-MM-DD)                      |

**Example Request**

```bash
curl -X POST http://localhost:8000/api/results/ \
  -H "Content-Type: application/json" \
  -d '{
    "student": 1,
    "subject": 1,
    "marks_obtained": 78,
    "total_marks": 100,
    "exam_date": "2024-05-10"
  }'
```

**Example Response** `201 Created`

```json
{
  "id": 5,
  "student": 1,
  "subject": 1,
  "marks_obtained": 78.0,
  "total_marks": 100.0,
  "percentage": 78.0,
  "grade": "C",
  "status": "pass",
  "exam_date": "2024-05-10",
  "created_at": "2024-05-10T11:00:00Z",
  "updated_at": "2024-05-10T11:00:00Z"
}
```

**Grading Scale**

| Percentage | Grade | Status |
|-----------|-------|--------|
| ≥ 90      | A     | Pass   |
| ≥ 80      | B     | Pass   |
| ≥ 70      | C     | Pass   |
| ≥ 60      | D     | Pass   |
| ≥ 40      | F     | Pass   |
| < 40      | F     | Fail   |

**Conflict** `400 Bad Request`

A student can only have one result per subject per exam date (`unique_together` constraint).

---

### Get Result

```
GET /api/results/{id}/
```

---

### Update Result

```
PUT /api/results/{id}/
```

---

### Delete Result

```
DELETE /api/results/{id}/
```

---

## Analytics (Node.js Backend)

The following endpoints are served by the Node.js backend on port 5000.

### Get CGPA for a Student

```
GET /api/analytics/cgpa/:studentID
```

`studentID` is the student's roll number.

**Example Request**

```bash
curl http://localhost:5000/api/analytics/cgpa/CS2024001
```

**Example Response**

```json
{
  "student": {
    "name": "John Smith",
    "rollNumber": "CS2024001",
    "department": "Computer Science"
  },
  "cgpa": 8.45,
  "results": [
    {
      "subjectCode": "CS101",
      "subjectName": "Data Structures",
      "marks": 85,
      "gradePoints": 9,
      "credits": 4
    }
  ]
}
```

### Get Overall Analytics

```
GET /api/analytics/overall
```

**Example Response**

```json
{
  "analytics": [
    {
      "name": "John Smith",
      "rollNumber": "CS2024001",
      "cgpa": 8.45
    }
  ],
  "passRate": "87.50"
}
```

---

## Error Codes

| Error Code         | HTTP Status | Description                           |
|--------------------|-------------|---------------------------------------|
| `VALIDATION_ERROR` | 400         | Invalid or missing request data       |
| `NOT_FOUND`        | 404         | Requested resource does not exist     |
| `UNAUTHORIZED`     | 401         | Authentication required               |
| `FORBIDDEN`        | 403         | Insufficient permissions              |
| `CONFLICT`         | 409         | Duplicate data (e.g., duplicate email)|
| `SERVER_ERROR`     | 500         | Unexpected server-side error          |
