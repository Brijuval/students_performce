# Setup Guide

Step-by-step instructions for setting up the Students Performance Management System in a local development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. Clone the Repository](#1-clone-the-repository)
- [2. Python / Django Setup](#2-python--django-setup)
- [3. PostgreSQL Setup](#3-postgresql-setup)
- [4. Environment Variables](#4-environment-variables)
- [5. Apply Migrations](#5-apply-migrations)
- [6. Run the Django Server](#6-run-the-django-server)
- [7. Node.js / Express Setup (Legacy)](#7-nodejs--express-setup-legacy)
- [8. Frontend Setup](#8-frontend-setup)
- [9. Verify Everything Works](#9-verify-everything-works)

---

## Prerequisites

| Tool       | Minimum Version | Check Command            |
|------------|-----------------|--------------------------|
| Python     | 3.9             | `python --version`       |
| pip        | 22.0            | `pip --version`          |
| PostgreSQL | 13              | `psql --version`         |
| Node.js    | 16              | `node --version`         |
| npm        | 8               | `npm --version`          |
| Git        | 2.30            | `git --version`          |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Brijuval/students_performce.git
cd students_performce
```

---

## 2. Python / Django Setup

### Create a Virtual Environment

```bash
# Create the virtual environment
python -m venv venv

# Activate it
# macOS / Linux:
source venv/bin/activate

# Windows (Command Prompt):
venv\Scripts\activate.bat

# Windows (PowerShell):
venv\Scripts\Activate.ps1
```

Your terminal prompt should now start with `(venv)`.

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**

| Package              | Purpose                                |
|----------------------|----------------------------------------|
| Django               | Web framework                          |
| djangorestframework  | REST API toolkit                       |
| psycopg2-binary      | PostgreSQL adapter                     |
| django-cors-headers  | CORS support for frontend requests     |
| python-decouple      | `.env` file / environment variable mgmt|
| cryptography         | Cryptographic utilities                |

---

## 3. PostgreSQL Setup

### Install PostgreSQL

- **macOS**: `brew install postgresql@15`
- **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`
- **Windows**: Download from https://www.postgresql.org/download/windows/

### Start the PostgreSQL Service

```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux (systemd)
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create the Database and User

```bash
# Connect as the postgres superuser
psql -U postgres

# Inside psql, run:
CREATE DATABASE students_db;
CREATE USER students_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE students_db TO students_user;
\q
```

---

## 4. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the following required variables:

```env
# Django
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
database_name=students_db
database_user=students_user
database_password=your_password
database_host=localhost
database_port=5432

# CORS (origins allowed to call the API)
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
CORS_ALLOW_CREDENTIALS=True
```

### Generating a SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 5. Apply Migrations

The `logs/` directory must exist before starting the server (the logger writes there):

```bash
mkdir -p logs
```

Run Django database migrations:

```bash
python manage.py migrate
```

**Expected output:**

```
Operations to perform:
  Apply all migrations: admin, api, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

### Create a Superuser (for Django Admin)

```bash
python manage.py createsuperuser
```

Follow the prompts to set a username, email, and password.

---

## 6. Run the Django Server

```bash
python manage.py runserver
```

The server starts at `http://localhost:8000`.

| URL                         | Description             |
|-----------------------------|-------------------------|
| `http://localhost:8000/api/`| REST API root           |
| `http://localhost:8000/admin/` | Django admin panel   |

Press `Ctrl+C` to stop.

---

## 7. Node.js / Express Setup (Legacy)

The original backend uses Node.js, Express, and MongoDB.

### Install Node.js Dependencies

```bash
npm install
```

### Configure MongoDB

Set `MONGO_URI` in your `.env` (or system environment):

```env
MONGO_URI=mongodb://localhost:27017/universityDB
PORT=5000
```

### Start the Node.js Server

```bash
npm start         # production
npm run dev       # development with auto-reload (nodemon)
```

The server starts at `http://localhost:5000`.

---

## 8. Frontend Setup

The frontend is plain HTML/JS and does not require a build step.

### Option A: Open Directly in Browser

```bash
open public/index.html          # macOS
xdg-open public/index.html      # Linux
start public/index.html         # Windows
```

### Option B: Serve with Python (Recommended)

```bash
cd public
python -m http.server 5500
```

Open `http://127.0.0.1:5500` in your browser.

### Configure API URL

Each JavaScript file contains a constant for the API base URL, for example:

```js
const API_BASE = "http://localhost:8000/api";  // Django
// or
const API_BASE = "http://localhost:5000/api";  // Node.js
```

Update this constant if your backend runs on a different host or port.

---

## 9. Verify Everything Works

### Django Health Check

```bash
curl http://localhost:8000/api/students/
```

Expected: `{"count": 0, "results": []}`

### Node.js Health Check

```bash
curl http://localhost:5000/api/students/
```

Expected: `{"count": 0, "students": []}`

### Load Sample Data (Optional)

```bash
python manage.py shell
```

```python
from api.models import Student, Subject, Result
from datetime import date

s = Student.objects.create(
    name="Test Student",
    email="test@example.com",
    phone="9876543210",
    enrollment_date=date.today()
)
print(s)
```

---

## Common Issues

| Problem                          | Solution                                                       |
|----------------------------------|----------------------------------------------------------------|
| `psycopg2` install fails         | Install `libpq-dev` (Linux) or Xcode CLI tools (macOS)        |
| `django.db.OperationalError`     | Check DB credentials in `.env`; ensure PostgreSQL is running   |
| `ModuleNotFoundError`            | Activate the virtual environment                               |
| Port 8000 already in use         | Run on a different port: `python manage.py runserver 8080`     |
| CORS error in browser            | Add your frontend origin to `CORS_ALLOWED_ORIGINS` in `.env`  |
| `logs/app.log` missing directory | Run `mkdir -p logs` in the project root                        |
