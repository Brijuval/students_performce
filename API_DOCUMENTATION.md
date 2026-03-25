# API Documentation

## Base URL

```
http://localhost:8000/api/
```

---

## Students

### List Students
`GET /api/students/`

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `search` | Search by name, roll_number, email, or department |
| `status` | Filter by `active` or `inactive` |
| `department` | Filter by department name |
| `year` | Filter by year |
| `ordering` | Sort by field (prefix `-` for descending) |
| `page` | Page number |

**Response (200):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "roll_number": "CS001",
      "email": "alice@example.com",
      "phone": null,
      "department": "Computer Science",
      "year": 2,
      "enrollment_date": "2024-01-15",
      "status": "active",
      "cgpa": 8.5,
      "results_count": 3
    }
  ]
}
```

### Create Student
`POST /api/students/`

```json
{
  "name": "Alice Johnson",
  "roll_number": "CS001",
  "department": "Computer Science",
  "year": 2,
  "email": "alice@example.com",
  "phone": "9876543210"
}
```

### Get Student Detail
`GET /api/students/{id}/`

Returns student with nested `results` array.

### Update Student
`PUT /api/students/{id}/` — full update  
`PATCH /api/students/{id}/` — partial update

### Delete Student
`DELETE /api/students/{id}/` → 204 No Content

### Student Performance
`GET /api/students/{id}/performance/`

```json
{
  "student_id": 1,
  "name": "Alice Johnson",
  "roll_number": "CS001",
  "department": "Computer Science",
  "cgpa": 8.75,
  "subject_performance": [
    {
      "subject": "Mathematics",
      "subject_code": "MATH101",
      "marks": 85,
      "grade": "A+",
      "status": "pass",
      "exam_date": "2024-06-15"
    }
  ]
}
```

---

## Subjects

### List Subjects
`GET /api/subjects/`

**Query Parameters:** `search`, `ordering`, `page`

### Create Subject
`POST /api/subjects/`
```json
{
  "name": "Mathematics",
  "subject_code": "MATH101",
  "description": "Advanced calculus",
  "credit": 4
}
```

### Update / Delete Subject
`PUT/PATCH /api/subjects/{id}/`  
`DELETE /api/subjects/{id}/`

---

## Results

### List Results
`GET /api/results/`

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `student` | Filter by student ID |
| `subject` | Filter by subject ID |
| `roll_number` | Filter by student roll number |
| `status` | `pass` or `fail` |
| `grade` | `O`, `A+`, `A`, `B+`, `B`, `C`, `F` |
| `date_from` | Exam date from (YYYY-MM-DD) |
| `date_to` | Exam date to (YYYY-MM-DD) |

### Create Result
`POST /api/results/`
```json
{
  "student": 1,
  "subject": 1,
  "marks": 85,
  "exam_date": "2024-06-15"
}
```

`percentage`, `grade`, and `status` are calculated automatically.

---

## Analytics

### Summary
`GET /api/analytics/summary/`
```json
{
  "total_students": 50,
  "total_subjects": 8,
  "total_results": 200,
  "pass_count": 170,
  "fail_count": 30,
  "pass_rate": 85.0,
  "average_marks": 72.4,
  "average_cgpa": 7.8
}
```

### Subject Analysis
`GET /api/analytics/subject-analysis/`
```json
{
  "all_subject_averages": [
    { "subject_id": 1, "subject_name": "Mathematics", "subject_code": "MATH101", "average_marks": 74.2, "count": 25 }
  ]
}
```

### Pass/Fail Overview
`GET /api/analytics/pass-fail/`
```json
{
  "students": [
    { "id": 1, "name": "Alice", "roll_number": "CS001", "department": "CS", "cgpa": 8.5, "status": "Pass" }
  ]
}
```

### CGPA Statistics
`GET /api/analytics/cgpa-stats/`
```json
{ "average_cgpa": 7.8, "highest_cgpa": 9.5, "pass_percentage": 85.0 }
```

### Student Performance by Roll Number
`GET /api/analytics/performance/{roll_number}/`

### Compare Two Students
`GET /api/analytics/compare/?student1=CS001&student2=CS002`

Returns array of two student objects with subject marks.

---

## Error Responses

All errors return JSON:

```json
{ "error": "Description of the error" }
```

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 404 | Resource not found |
| 409 | Duplicate / conflict |
| 500 | Server error |
