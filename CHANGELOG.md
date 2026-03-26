# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project loosely follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [0.6.0] – 2026-03-26

### Added
- **README.md** – Comprehensive project overview, quick-start guide, API summary, and troubleshooting section.
- **API_DOCUMENTATION.md** – Complete REST API reference with request/response examples for all endpoints.
- **SETUP.md** – Step-by-step local development setup guide for both Django and Node.js backends.
- **DATABASE_SCHEMA.md** – Full documentation of Django/PostgreSQL models and MongoDB/Mongoose schemas, including relationships and grading rules.
- **DEPLOYMENT.md** – Production deployment guide covering Gunicorn, Nginx, systemd, HTTPS (Let's Encrypt), and a security checklist.
- **CONTRIBUTING.md** – Contribution guidelines including branch naming, commit message conventions, coding standards (Python/JS/HTML), and the PR process.
- **CHANGELOG.md** – This file; tracks all project changes.
- Docstrings added to `api/models.py` (Student, Subject, Result, custom managers).
- Docstrings and inline comments added to `utils/helpers.py`, `utils/exceptions.py`, `utils/middleware.py`, `utils/response.py`, `utils/validators.py`, `utils/decorators.py`, and `utils/logger.py`.

---

## [0.5.0] – 2026-03-25

### Added
- **Phase 5 – Testing & Validation**: Unit, integration, and API test suite for the Django backend.

---

## [0.4.0] – 2026-03-24

### Added
- **Phase 4 – Frontend Integration**: Updated frontend HTML/JS pages to consume the Django REST API.

---

## [0.3.0] – 2026-03-23

### Added
- **Phase 3 – Utilities & Middleware**:
  - `utils/exceptions.py` – Custom exception hierarchy (`ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `ServerError`).
  - `utils/middleware.py` – `ErrorHandlingMiddleware` and `RequestLoggingMiddleware`.
  - `utils/response.py` – `APIResponse` helper for consistent JSON response format.
  - `utils/validators.py` – Input validators for email, phone, marks, percentage, and enrollment date.
  - `utils/decorators.py` – `require_permission`, `validate_request`, and `handle_exceptions` decorators.
  - `utils/logger.py` – Rotating file logger setup.
  - `utils/helpers.py` – `calculate_grade`, `calculate_percentage`, `get_pass_status`, `format_date`, `format_datetime`.

---

## [0.2.0] – 2026-03-22

### Added
- **Phase 2 – Django Models, Serializers & API Views**:
  - `api/models.py` – `Student`, `Subject`, `Result` Django models with automatic grade/percentage/status calculation on save.
  - Django REST Framework serializers with nested relationships and validation.
  - ViewSets with filtering, search, and pagination for Students, Subjects, Results, and Analytics.
  - Django admin configuration for all models.
  - URL routing for all API endpoints.

---

## [0.1.0] – 2026-03-21

### Added
- **Phase 1 – Foundation & Setup**:
  - `.gitignore` – Python/Django/Node.js exclusions.
  - `requirements.txt` – Python dependencies (Django, DRF, psycopg2, corsheaders, python-decouple).
  - `.env.example` – Template for all environment variables.
  - `manage.py` – Django project management script.
  - `core/settings.py` – Django project settings with decouple-based configuration.
  - `package.json` – Node.js dependency manifest.
  - Original Node.js/Express/MongoDB backend (`server/`, `config/`).
  - Original frontend (`public/` – HTML/CSS/JS pages).

---

[Unreleased]: https://github.com/Brijuval/students_performce/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/Brijuval/students_performce/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/Brijuval/students_performce/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/Brijuval/students_performce/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Brijuval/students_performce/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Brijuval/students_performce/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Brijuval/students_performce/releases/tag/v0.1.0
