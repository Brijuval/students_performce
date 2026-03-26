# Database Schema

Documentation for all data models in the Students Performance Management System.

## Table of Contents

- [Django / PostgreSQL Models](#django--postgresql-models)
  - [Student](#student)
  - [Subject](#subject)
  - [Result](#result)
  - [Relationships Diagram](#relationships-diagram)
  - [Auto-calculated Fields](#auto-calculated-fields)
  - [Custom Managers](#custom-managers)
- [Node.js / MongoDB Schemas](#nodejs--mongodb-schemas)
  - [Student (Mongoose)](#student-mongoose)
  - [Subject (Mongoose)](#subject-mongoose)
  - [Result (Mongoose)](#result-mongoose)
- [Grading Rules](#grading-rules)

---

## Django / PostgreSQL Models

### Student

**Table:** `api_student`

| Column            | Type          | Constraints                   | Description                      |
|-------------------|---------------|-------------------------------|----------------------------------|
| `id`              | BigAutoField  | PK, auto-increment            | Primary key                      |
| `name`            | VARCHAR(255)  | NOT NULL                      | Full name of the student         |
| `email`           | VARCHAR(254)  | NOT NULL, UNIQUE              | Email address (used as identifier)|
| `phone`           | VARCHAR(15)   | NOT NULL                      | 10-digit phone number            |
| `enrollment_date` | DATE          | NOT NULL                      | Date the student enrolled        |
| `status`          | VARCHAR(20)   | NOT NULL, default `'active'`  | `active` or `inactive`           |
| `created_at`      | TIMESTAMP     | auto_now_add                  | Record creation timestamp        |
| `updated_at`      | TIMESTAMP     | auto_now                      | Record last-update timestamp     |

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Default ordering: `name` ascending

---

### Subject

**Table:** `api_subject`

| Column        | Type         | Constraints        | Description                        |
|---------------|--------------|--------------------|------------------------------------|
| `id`          | BigAutoField | PK, auto-increment | Primary key                        |
| `name`        | VARCHAR(255) | NOT NULL, UNIQUE   | Subject full name                  |
| `code`        | VARCHAR(10)  | NOT NULL, UNIQUE   | Short subject code (e.g., MATH101) |
| `description` | TEXT         | NULL, blank        | Optional description               |
| `created_at`  | TIMESTAMP    | auto_now_add       | Record creation timestamp          |

**Indexes:**
- Primary key on `id`
- Unique index on `name`
- Unique index on `code`
- Default ordering: `name` ascending

---

### Result

**Table:** `api_result`

| Column           | Type         | Constraints                          | Description                               |
|------------------|--------------|--------------------------------------|-------------------------------------------|
| `id`             | BigAutoField | PK, auto-increment                   | Primary key                               |
| `student_id`     | BigInt       | FK → `api_student.id`, CASCADE DELETE| The student who sat the exam              |
| `subject_id`     | BigInt       | FK → `api_subject.id`, CASCADE DELETE| The subject examined                      |
| `marks_obtained` | FLOAT        | NOT NULL                             | Marks scored by the student               |
| `total_marks`    | FLOAT        | NOT NULL, default 100                | Maximum possible marks                    |
| `percentage`     | FLOAT        | NOT NULL, NOT editable               | Auto-calculated: `(marks/total) × 100`    |
| `grade`          | VARCHAR(2)   | NOT NULL, NOT editable               | Auto-calculated: A / B / C / D / F        |
| `status`         | VARCHAR(10)  | NOT NULL, NOT editable               | Auto-calculated: `pass` or `fail`         |
| `exam_date`      | DATE         | NOT NULL                             | Date of the exam                          |
| `created_at`     | TIMESTAMP    | auto_now_add                         | Record creation timestamp                 |
| `updated_at`     | TIMESTAMP    | auto_now                             | Record last-update timestamp              |

**Constraints:**
- `UNIQUE(student_id, subject_id, exam_date)` – a student can only have one result per subject per exam date

**Indexes:**
- Primary key on `id`
- Unique composite index on `(student_id, subject_id, exam_date)`
- Default ordering: `exam_date` descending

---

### Relationships Diagram

```
Student (1) ──────< Result (N) >────── Subject (1)
   │                   │
   │                   │  Auto-calculates:
   │                   │   • percentage = marks_obtained / total_marks × 100
   │                   │   • grade      = A/B/C/D/F (based on percentage)
   │                   │   • status     = pass/fail (pass if percentage ≥ 40)
   └── active (custom manager, filters status='active')
       passing (custom manager on Result, filters status='pass')
```

---

### Auto-calculated Fields

When a `Result` is saved, the `save()` method automatically calculates:

```python
percentage = (marks_obtained / total_marks) * 100
grade = calculate_grade(percentage)    # from utils.helpers
status = get_pass_status(percentage)   # from utils.helpers
```

These fields are read-only via the API (`editable=False`).

---

### Custom Managers

| Model   | Manager Name | Filters                |
|---------|--------------|------------------------|
| Student | `active`     | `status = 'active'`    |
| Result  | `passing`    | `status = 'pass'`      |

**Usage:**

```python
# All active students
Student.active.all()

# All passing results for a student
student.results.filter(status='pass')
# or via manager:
Result.passing.filter(student=student)
```

---

## Node.js / MongoDB Schemas

### Student (Mongoose)

**Collection:** `students`

| Field       | Type                     | Required | Description                          |
|-------------|--------------------------|----------|--------------------------------------|
| `_id`       | ObjectId                 | auto     | MongoDB document ID                  |
| `studentID` | ObjectId                 | Yes      | Internal unique identifier           |
| `name`      | String                   | Yes      | Full name                            |
| `rollNumber`| String                   | Yes, unique | Roll number used as student identifier |
| `department`| String                   | Yes      | Department / faculty                 |
| `year`      | Number                   | Yes      | Academic year                        |
| `subjects`  | Array of embedded objects| No       | Embedded subject marks               |

**Embedded `subjects` object:**

| Field     | Type   | Constraints        | Description            |
|-----------|--------|--------------------|------------------------|
| `name`    | String | –                  | Subject name           |
| `marks`   | Number | min: 0, max: 100   | Marks scored           |
| `credits` | Number | min: 1             | Subject credit value   |

**Indexes:**
- Unique on `rollNumber`
- Index on `department`

**Instance Methods:**
- `calculateCGPA()` – computes weighted CGPA from embedded `subjects`

---

### Subject (Mongoose)

**Collection:** `subjects`

| Field         | Type   | Required | Description             |
|---------------|--------|----------|-------------------------|
| `_id`         | ObjectId| auto    | MongoDB document ID     |
| `name`        | String | Yes      | Subject name            |
| `subjectCode` | String | Yes, unique | Subject code (e.g., CS101) |
| `credit`      | Number | Yes      | Credit value            |

---

### Result (Mongoose)

**Collection:** `results`

| Field        | Type   | Required | Description                          |
|--------------|--------|----------|--------------------------------------|
| `_id`        | ObjectId| auto    | MongoDB document ID                  |
| `studentID`  | String | Yes      | Roll number reference to `students`  |
| `subjectCode`| String | Yes      | Reference to `subjects.subjectCode`  |
| `marks`      | Number | Yes      | Marks scored                         |

> **Note:** In MongoDB, `studentID` is stored as the roll number string (not the ObjectId) to allow cross-collection lookups by roll number in analytics pipelines.

---

## Grading Rules

The following grading scale is used in both Django and Node.js backends:

| Percentage Range | Grade | Grade Points (Node.js) | Status |
|-----------------|-------|------------------------|--------|
| ≥ 90            | A     | 10                     | pass   |
| ≥ 80            | B     | 9                      | pass   |
| ≥ 70            | C     | 8                      | pass   |
| ≥ 60            | D     | 7                      | pass   |
| ≥ 50            | –     | 6                      | pass   |
| ≥ 40            | F     | 5                      | pass   |
| < 40            | F     | 0                      | fail   |

> The Django backend uses a **40% passing threshold**. The Node.js CGPA pipeline uses a **10-point grade-point scale** for CGPA calculations.
