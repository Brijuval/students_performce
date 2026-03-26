# Contributing Guide

Thank you for your interest in contributing to the Students Performance Management System!  
This guide explains how to set up the project, the coding standards we follow, and the pull-request workflow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Coding Standards](#coding-standards)
  - [Python / Django](#python--django)
  - [JavaScript / Node.js](#javascript--nodejs)
  - [HTML / CSS](#html--css)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/students_performce.git
   cd students_performce
   ```
3. **Follow SETUP.md** to configure your local environment.
4. Create a feature branch (see [Branch Naming](#branch-naming)).
5. Make your changes.
6. Run the test suite and linter before pushing.
7. Open a pull request against `main`.

---

## Branch Naming

| Change Type    | Pattern                           | Example                           |
|----------------|-----------------------------------|-----------------------------------|
| New feature    | `feature/<short-description>`     | `feature/add-csv-export`          |
| Bug fix        | `fix/<short-description>`         | `fix/result-percentage-rounding`  |
| Documentation  | `docs/<short-description>`        | `docs/update-api-reference`       |
| Refactor       | `refactor/<short-description>`    | `refactor/extract-grade-helper`   |
| Chore / config | `chore/<short-description>`       | `chore/update-requirements`       |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(api): add CSV export endpoint for results
fix(models): prevent division by zero in calculate_percentage
docs(readme): add troubleshooting section
test(api): add unit tests for StudentViewSet
```

Keep the summary line under **72 characters**.

---

## Coding Standards

### Python / Django

- Follow **PEP 8** (use `flake8` or `ruff` to lint).
- Maximum line length: **88 characters** (Black-compatible).
- Use **type hints** for all new function signatures.
- Write **docstrings** for all public classes, methods, and functions.
  - Use Google-style docstrings:
    ```python
    def calculate_grade(percentage: float) -> str:
        """Calculate the letter grade from a percentage score.

        Args:
            percentage: A float between 0 and 100.

        Returns:
            A single letter grade string: 'A', 'B', 'C', 'D', or 'F'.
        """
    ```
- Do **not** leave `print()` statements in production code; use the `logging` module.
- All new models must include `__str__`, `Meta.ordering`, and meaningful field `help_text`.
- All new API views must handle expected exceptions and return structured error responses.

**Run linter:**

```bash
pip install flake8
flake8 api/ core/ utils/ --max-line-length=88
```

### JavaScript / Node.js

- Use **ES6+** syntax (`const`, `let`, arrow functions, template literals).
- Add **JSDoc** comments to all exported functions:
  ```js
  /**
   * Fetch all students from the API.
   * @returns {Promise<Object[]>} Array of student objects.
   */
  async function fetchStudents() { ... }
  ```
- Use `async/await` instead of callbacks or raw Promises where possible.
- Handle all `async` errors with `try/catch`.
- Do not commit `console.log` debug statements to main branches.

### HTML / CSS

- Use semantic HTML5 elements (`<main>`, `<nav>`, `<section>`, `<article>`).
- Class names use `kebab-case`.
- Keep CSS variables in `:root` for colours and spacing.

---

## Pull Request Process

1. Ensure the code lints cleanly (see above).
2. Write or update tests for any changed behaviour.
3. Update the relevant documentation files (README, API_DOCUMENTATION, etc.).
4. Add an entry to [CHANGELOG.md](CHANGELOG.md) under **Unreleased**.
5. Open a pull request with:
   - A clear title following Conventional Commits format.
   - A description explaining **what** changed and **why**.
   - Reference any related issues (e.g., `Closes #42`).
6. Address all review comments.
7. A maintainer will merge once all checks pass.

---

## Reporting Bugs

Open a GitHub Issue and include:

- **Environment**: OS, Python version, Node version, browser (if frontend bug).
- **Steps to reproduce** (minimal, numbered).
- **Expected behaviour**.
- **Actual behaviour** (include error messages and stack traces).
- Relevant log output from `logs/app.log`.

---

## Requesting Features

Open a GitHub Issue with the label `enhancement` and describe:

- The problem you are trying to solve.
- Your proposed solution or the behaviour you expect.
- Any alternatives you have considered.
