# Students Performance Management System

A full-stack web application for managing university student performance, including student records, subjects, and exam results with analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Students Performance Management System allows educational institutions to:

- Manage student records (add, update, delete, search)
- Track subjects and their details
- Record exam results and auto-calculate grades, percentages, and pass/fail status
- View analytics including CGPA, class performance, and subject-wise reports
- Administer data through a Django admin panel

The system consists of a **Node.js/Express/MongoDB** backend (original), a **Django REST Framework** backend (refactored), and a plain **HTML/CSS/JavaScript** frontend.

## Features

- **Student Management** – CRUD operations with status tracking (active/inactive)
- **Subject Management** – Subject catalog with unique codes
- **Result Tracking** – Auto-calculated grades (A–F), percentages, and pass/fail status
- **Analytics** – CGPA computation, class reports, subject-wise performance
- **Search & Filtering** – Filter by status, subject, grade, date range; search by name/email/code
- **Pagination** – Automatic pagination for large datasets
- **Input Validation** – Server-side validation with descriptive error messages
- **Django Admin Panel** – Full management interface at `/admin/`
- **CORS Support** – Configured for frontend-to-API communication
- **Request Logging** – All requests and errors are logged to `logs/app.log`

## Tech Stack
_______________________________________________________________
| Layer     | Technology                                       |
|-----------|--------------------------------------------------|
| Backend   | Python 3.x, Django, Django REST Framework        |
| Database  | PostgreSQL (Django) / MongoDB (Node.js legacy)   |
| Frontend  | HTML5, CSS3, Vanilla JavaScript                  |
| Server    | Node.js, Express (legacy)                        |
| Logging   | Python `logging`, rotating file handler          |

## Project Structure

```
students_performce/
├── api/                        # Django app – models, views, serializers
│   ├── __init__.py
│   └── models.py               # Student, Subject, Result models
├── core/                       # Django project settings
│   ├── __init__.py
│   └── settings.py
├── utils/                      # Shared utilities
│   ├── decorators.py           # Permission & validation decorators
│   ├── exceptions.py           # Custom API exceptions
│   ├── helpers.py              # Grade/percentage calculation helpers
│   ├── logger.py               # Logging setup
│   ├── middleware.py           # Error handling & request logging middleware
│   ├── response.py             # Standardized API response format
│   └── validators.py           # Input validators
├── server/                     # Node.js/Express legacy backend
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route handlers
│   └── server.js
├── config/
│   └── database.js             # MongoDB connection
├── public/                     # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── dashboard.html
│   ├── students.html
│   ├── subjects.html
│   ├── results.html
│   └── analytics.html
├── logs/                       # Runtime log files
├── .env.example                # Environment variable template
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
└── manage.py                   # Django management CLI
```

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Node.js 16+ and npm (for legacy backend or frontend dev server)
### Django Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Brijuval/students_performce.git
cd students_performce

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and secret key

# 5. Create the PostgreSQL database
createdb students_db            # or use pgAdmin / psql

# 6. Apply migrations
python manage.py migrate

# 7. Create a superuser (for Django admin)
python manage.py createsuperuser

# 8. Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.
The admin panel is at `http://localhost:8000/admin/`.

### Node.js Backend Setup (Legacy)

```bash
# Install Node.js dependencies
npm install

# Start the Node.js server
npm start                       # production
npm run dev                     # development (nodemon)
```

The Node.js server runs on `http://localhost:5000`.

### Frontend

Open `public/index.html` directly in a browser, or serve it with any static server:

```bash
# Using Python's built-in server
cd public
python -m http.server 5500
```

Then open `http://127.0.0.1:5500`.

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint documentation with request/response examples.

### Base URL

```
http://localhost:8000/api/
```

### Endpoints Summary

| Method | Endpoint                                    | Description                  |
|--------|---------------------------------------------|------------------------------|
| GET    | `/api/students/`                            | List all students            |
| POST   | `/api/students/`                            | Create a student             |
| GET    | `/api/students/{id}/`                       | Get a student                |
| PUT    | `/api/students/{id}/`                       | Update a student             |
| DELETE | `/api/students/{id}/`                       | Delete a student             |
| GET    | `/api/subjects/`                            | List all subjects            |
| POST   | `/api/subjects/`                            | Create a subject             |
| GET    | `/api/results/`                             | List all results             |
| POST   | `/api/results/`                             | Create a result              |
| GET    | `/api/analytics/summary/`                   | Overall statistics           |
| GET    | `/api/analytics/student-performance/{id}/`  | Per-student analytics        |

## Frontend

The frontend consists of static HTML/JS pages that communicate with the backend API:

| Page     | File             | Description                  |
|----------|------------------|------------------------------|
| Home     | `index.html`     | Landing page                 |
| Dashboard| `dashboard.html` | Key metrics and charts       |
| Students | `students.html`  | Student management           |
| Subjects | `subjects.html`  | Subject catalog              |
| Results  | `results.html`   | Exam result entry/view       |
| Analytics| `analytics.html` | Performance analytics        |

Configure the API base URL in each JS file (default: `http://localhost:8000/api`).

## Configuration

Copy `.env.example` to `.env` and fill in all values:

```env
SECRET_KEY=<strong-random-string>
DEBUG=False
ALLOWED_HOSTS=localhost,your-domain.com
database_name=students_db
database_user=postgres
database_password=<password>
database_host=localhost
database_port=5432
CORS_ALLOWED_ORIGINS=http://localhost:5500
```
See [SETUP.md](SETUP.md) for a full setup walkthrough and [DEPLOYMENT.md](DEPLOYMENT.md) for production configuration.

## Troubleshooting

### Database connection errors

- Ensure PostgreSQL is running: `pg_isready`
- Check `database_*` values in `.env`
- Ensure the database exists: `psql -U postgres -c "\l"`

### `ModuleNotFoundError` on startup

- Make sure the virtual environment is activated: `source venv/bin/activate`
- Re-install dependencies: `pip install -r requirements.txt`

### CORS errors in browser

- Add your frontend origin to `CORS_ALLOWED_ORIGINS` in `.env`
- Restart the Django server after changing `.env`

### Logs

All errors are written to `logs/app.log`. Check this file for detailed tracebacks.

### Django migrations fail

```bash
python manage.py showmigrations   # view migration state
python manage.py migrate --run-syncdb
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, coding standards, and the pull request process.

## License

This project is licensed under the ISC License. See `package.json` for details.
