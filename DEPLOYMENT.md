# Deployment Guide

Instructions for deploying the Students Performance Management System to a production server.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Django Production Setup](#django-production-setup)
- [PostgreSQL in Production](#postgresql-in-production)
- [Serving with Gunicorn + Nginx](#serving-with-gunicorn--nginx)
- [Node.js / Express Deployment](#nodejs--express-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

The production stack is:

```
Browser  ──>  Nginx (port 80/443)
                 │
                 ├──> Gunicorn (Django API, port 8000)
                 │         └──> PostgreSQL
                 │
                 ├──> Node.js/Express (port 5000) [optional legacy]
                 │         └──> MongoDB
                 │
                 └──> Static files (public/)
```

---

## Prerequisites

On the production server:

```bash
# Python 3.9+
sudo apt update && sudo apt install python3 python3-pip python3-venv

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Nginx
sudo apt install nginx

# Node.js 18 (for legacy backend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

---

## Environment Variables

Create `/etc/students_performce.env` (or use your platform's secret management) with **all** of the following:

```env
# Django
SECRET_KEY=<long-random-string>
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
database_name=students_db
database_user=students_user
database_password=<strong-password>
database_host=localhost
database_port=5432

# CORS — list every origin that calls the API
CORS_ALLOWED_ORIGINS=https://your-domain.com
CORS_ALLOW_CREDENTIALS=True

# Node.js / MongoDB (legacy)
MONGO_URI=mongodb://localhost:27017/universityDB
PORT=5000
```

> **Never commit `.env` to version control.** Use `.env.example` as the template.

### Generating a SECRET_KEY

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## Django Production Setup

```bash
# 1. Clone and set up
git clone https://github.com/Brijuval/students_performce.git /var/www/students_performce
cd /var/www/students_performce

# 2. Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# 3. Set environment variables (load from file)
set -a && source /etc/students_performce.env && set +a

# 4. Create logs directory
mkdir -p logs

# 5. Collect static files
python manage.py collectstatic --no-input

# 6. Apply migrations
python manage.py migrate

# 7. Test Gunicorn manually
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Systemd Service for Gunicorn

Create `/etc/systemd/system/students_performce.service`:

```ini
[Unit]
Description=Students Performance Django App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/students_performce
EnvironmentFile=/etc/students_performce.env
ExecStart=/var/www/students_performce/venv/bin/gunicorn \
    core.wsgi:application \
    --bind unix:/run/students_performce.sock \
    --workers 3 \
    --timeout 120
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable students_performce
sudo systemctl start students_performce
sudo systemctl status students_performce
```

---

## PostgreSQL in Production

```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE students_db;
CREATE USER students_user WITH PASSWORD 'strong-password';
ALTER ROLE students_user SET client_encoding TO 'utf8';
ALTER ROLE students_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE students_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE students_db TO students_user;
\q
```

---

## Serving with Gunicorn + Nginx

Create `/etc/nginx/sites-available/students_performce`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Django API
    location /api/ {
        proxy_pass http://unix:/run/students_performce.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://unix:/run/students_performce.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /var/www/students_performce/staticfiles/;
    }

    # Frontend
    location / {
        root /var/www/students_performce/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/students_performce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certificates auto-renew via a cron job installed by Certbot.

---

## Node.js / Express Deployment

### PM2 Process Manager

```bash
npm install -g pm2

# Start the Node.js server
pm2 start server/server.js --name students-node

# Persist across reboots
pm2 save
pm2 startup
```

### Nginx Proxy for Node.js

Add to the Nginx server block (before the `location /` block):

```nginx
location /api/analytics/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Frontend Deployment

The frontend is static HTML/CSS/JS. Simply copy the `public/` directory to your web server root.

**Update API URLs** in each frontend JS file to point to your production domain:

```js
const API_BASE = "https://your-domain.com/api";
```

---

## Security Checklist

Before going live, verify:

- [ ] `DEBUG=False` in `.env`
- [ ] `SECRET_KEY` is long, random, and kept secret
- [ ] `ALLOWED_HOSTS` lists only your actual domain(s)
- [ ] HTTPS enabled (Let's Encrypt or other certificate)
- [ ] PostgreSQL password is strong and not default
- [ ] Database is **not** exposed to the internet (firewall rules)
- [ ] `logs/` directory is not served by Nginx
- [ ] Django admin is protected by a strong password
- [ ] CORS origins restricted to your actual frontend domain(s)
- [ ] `node_modules/` is excluded from the web root
- [ ] `.env` file is not accessible via the web server

---

## Troubleshooting

### `502 Bad Gateway`

- Check Gunicorn is running: `sudo systemctl status students_performce`
- Check the socket file exists: `ls -la /run/students_performce.sock`
- Check Django logs: `tail -f /var/www/students_performce/logs/app.log`

### Static files not loading (`404`)

- Ensure `collectstatic` was run: `python manage.py collectstatic`
- Verify the `alias` path in Nginx matches `STATIC_ROOT` in `settings.py`

### Database migration errors in production

```bash
source venv/bin/activate
python manage.py showmigrations
python manage.py migrate --plan
python manage.py migrate
```

### Permissions errors

```bash
sudo chown -R www-data:www-data /var/www/students_performce
sudo chmod -R 755 /var/www/students_performce
```
