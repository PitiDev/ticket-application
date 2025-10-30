# Environment Configuration Guide

This guide explains how to configure environment variables for the Ticket Management System.

## Environment Files Structure

```
ticket-application/
├── .env                      # Docker Compose configuration (production/staging)
├── .env.example             # Docker Compose example template
├── backend/
│   ├── .env                 # Backend development configuration
│   └── .env.example         # Backend example template
└── frontend/
    ├── .env                 # Frontend development configuration
    └── .env.example         # Frontend example template
```

## When to Use Which .env File

### Local Development
- **`backend/.env`** - Used when running backend locally with `npm start` or `npm run dev`
- **`frontend/.env`** - Used when running frontend locally with `npm run dev`

### Docker Deployment (Production/Staging)
- **Root `.env`** - Used by `docker-compose.prod.yml` and `docker-compose.staging.yml`

## Configuration Details

### 1. Backend Configuration (`backend/.env`)

This file contains all backend-specific settings:

```bash
# Server Configuration
NODE_ENV=development              # development | production | staging
PORT=9000                        # Backend server port
BASE_URL=https://ticket.laobullionbank.com # Backend base URL

# Database Configuration
DB_HOST=172.16.4.62              # Database host (use 'db' for Docker)
DB_USER=appuser                  # Database username
DB_PASSWORD=apppassword          # Database password
DB_NAME=ticket_system            # Database name
DB_PORT=3306                     # Database port

# Security
JWT_SECRET=your_jwt_secret       # Secret key for JWT tokens

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://ticket.laobullionbank.com

# Email Configuration
MAIL_HOST=smtp.gmail.com         # SMTP server
MAIL_PORT=587                    # SMTP port
MAIL_SECURE=false                # Use TLS (true/false)
MAIL_USER=lbbticket@gmail.com    # Email username
MAIL_PASS=your_app_password      # Email password or app password
MAIL_FROM_NAME=LBB Ticket System # Sender name
MAIL_FROM_ADDRESS=lbbticket@gmail.com # Sender email

# Google Generative AI (Optional)
GEMINI_API_KEY=your_api_key      # Gemini API key for AI features

# File Upload
MAX_FILE_SIZE=10485760           # Max file size in bytes (10MB)
UPLOAD_PATH=./uploads            # Upload directory

# Session
SESSION_SECRET=your_session_secret # Session secret key
```

### 2. Frontend Configuration (`frontend/.env`)

This file contains frontend-specific settings for Nuxt 3:

```bash
# API Configuration
NUXT_PUBLIC_API_BASE=https://ticket.laobullionbank.com/api # Backend API URL

# Application URL
NUXT_PUBLIC_APP_URL=http://ticket.laobullionbank.com

# Environment
NODE_ENV=development
```

**Important**: In Nuxt 3, variables prefixed with `NUXT_PUBLIC_` are exposed to the client-side code.

### 3. Docker Compose Configuration (Root `.env`)

This file is used for Docker deployment:

```bash
# Docker Images
BACKEND_IMAGE=devops.laobullionbank.com/ticket-app/backend:latest
FRONTEND_IMAGE=devops.laobullionbank.com/ticket-app/frontend:latest

# Database Configuration
DB_HOST=172.16.4.62              # Use 'db' for containerized database
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=ticket_system
DB_ROOT_PASSWORD=root_password   # MySQL root password

# Application Configuration
NODE_ENV=production
PORT=9000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://ticket.laobullionbank.com

# API Configuration
NUXT_PUBLIC_API_BASE=https://ticket.laobullionbank.com/api

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=lbbticket@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM_NAME=LBB Ticket System
MAIL_FROM_ADDRESS=lbbticket@gmail.com

# AI Configuration
GEMINI_API_KEY=your_api_key
```

## Current Configuration Summary

### Your Current Setup

**Database Server**: `172.16.4.62:3306`
- Database: `ticket_system`
- User: `appuser`

**Backend Server**: `https://ticket.laobullionbank.com`
- API Endpoint: `/api`
- Socket.IO: Real-time notifications

**Frontend Application**: `http://ticket.laobullionbank.com`
- Nuxt 3 SSR application

**Email Service**: Gmail SMTP
- Account: `lbbticket@gmail.com`
- Uses Gmail App Password for authentication

**Docker Registry**: `devops.laobullionbank.com`
- Backend Image: `devops.laobullionbank.com/ticket-app/backend`
- Frontend Image: `devops.laobullionbank.com/ticket-app/frontend`

## Setup Instructions

### For Local Development

1. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   nano .env  # Edit with your configuration
   npm install
   npm start
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   nano .env  # Edit with your configuration
   npm install
   npm run dev
   ```

### For Docker Deployment

1. **Prepare Environment File**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your production configuration
   ```

2. **Login to Docker Registry**
   ```bash
   docker login devops.laobullionbank.com
   ```

3. **Deploy with Docker Compose**
   ```bash
   # Production
   docker-compose -f docker-compose.prod.yml up -d

   # Staging
   docker-compose -f docker-compose.staging.yml up -d
   ```

## Important Notes

### Security Best Practices

1. **Never commit real credentials** to version control
2. **Use strong passwords** for JWT_SECRET and SESSION_SECRET
3. **Use app passwords** for Gmail (not your actual password)
4. **Protect sensitive variables** in GitLab CI/CD (mark as Protected & Masked)
5. **Use different secrets** for development, staging, and production

### Gmail App Password

To get a Gmail app password:
1. Go to Google Account settings
2. Security > 2-Step Verification
3. App passwords
4. Generate a new app password for "Mail"
5. Use this password in `MAIL_PASS`

### Database Connection

- **Local Development**: Use direct IP or `localhost`
- **Docker Compose**: Use service name `db` as DB_HOST
- **External Database**: Use actual IP address (like `172.16.4.62`)

### API Base URL Configuration

The frontend needs to know where the backend API is:

**Development**:
```bash
NUXT_PUBLIC_API_BASE=http://localhost:9000/api
```

**Production (same server)**:
```bash
NUXT_PUBLIC_API_BASE=https://ticket.laobullionbank.com/api
```

**Production (different servers)**:
```bash
NUXT_PUBLIC_API_BASE=http://api.yourapp.com/api
```

## Troubleshooting

### Backend can't connect to database
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Verify database server is running and accessible
- Check firewall rules for port 3306

### Frontend can't reach backend API
- Verify `NUXT_PUBLIC_API_BASE` points to correct backend URL
- Check CORS settings in backend
- Ensure backend is running and accessible

### Email sending fails
- Verify SMTP credentials are correct
- Check if using Gmail App Password (not regular password)
- Test SMTP connection manually
- Check firewall rules for SMTP port (587)

### Socket.IO connection issues
- Ensure backend and frontend are using same Socket.IO version
- Check CORS settings in backend
- Verify WebSocket connections are not blocked by firewall/proxy

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment mode |
| PORT | Yes | 9000 | Server port |
| DB_HOST | Yes | - | Database host |
| DB_USER | Yes | - | Database user |
| DB_PASSWORD | Yes | - | Database password |
| DB_NAME | Yes | - | Database name |
| JWT_SECRET | Yes | - | JWT secret key |
| FRONTEND_URL | Yes | - | Frontend URL for CORS |
| MAIL_HOST | No | - | SMTP host |
| MAIL_PORT | No | 587 | SMTP port |
| MAIL_USER | No | - | Email username |
| MAIL_PASS | No | - | Email password |
| GEMINI_API_KEY | No | - | Google AI API key |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NUXT_PUBLIC_API_BASE | Yes | - | Backend API URL |
| NUXT_PUBLIC_APP_URL | No | - | App URL |
| NODE_ENV | No | development | Environment mode |

## Next Steps

1. Configure all environment variables for your environment
2. Test local development setup
3. Configure GitLab CI/CD variables (see GITLAB_CI_SETUP.md)
4. Deploy to staging and test
5. Deploy to production when ready

## Support

For more information:
- **GitLab CI/CD Setup**: See `GITLAB_CI_SETUP.md`
- **Quick Start**: See `QUICK_START.md`
- **Deployment Info**: See `DEPLOYMENT_SUMMARY.md`
