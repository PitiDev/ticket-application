# GitLab CI/CD Deployment Summary

## Configuration Overview

This document summarizes the GitLab CI/CD setup for your Ticket Management System.

## Docker Registry

**Registry Domain**: `devops.laobullionbank.com`

**Docker Images**:
- Backend: `devops.laobullionbank.com/ticket-app/backend`
- Frontend: `devops.laobullionbank.com/ticket-app/frontend`

## Architecture

### Services
1. **Backend** (Node.js/Express)
   - Port: 9000 (Production), 9001 (Staging)
   - Socket.IO for real-time notifications
   - REST API

2. **Frontend** (Nuxt 3)
   - Port: 3000 (Production), 3001 (Staging)
   - Server-side rendering

3. **Database** (MySQL 8.0)
   - Port: 3306 (Production), 3307 (Staging)
   - Persistent volume for data storage

**Note**: Nginx has been removed. Services are accessed directly via their ports.

## Required GitLab CI/CD Variables

Configure these in **Settings > CI/CD > Variables**:

### Docker Registry
- `DOCKER_REGISTRY_USER` - Your registry username
- `DOCKER_REGISTRY_PASSWORD` - Your registry password (Protected & Masked)

### Database
- `DB_HOST` - Database host (default: `db`)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (Protected & Masked)
- `DB_NAME` - Database name
- `DB_ROOT_PASSWORD` - MySQL root password (Protected & Masked)

### Application
- `JWT_SECRET` - JWT secret key (Protected & Masked)
- `FRONTEND_URL` - Frontend URL
- `NUXT_PUBLIC_API_BASE` - Backend API URL

### Email (SMTP)
- `MAIL_HOST` - SMTP server
- `MAIL_PORT` - SMTP port
- `MAIL_SECURE` - Use TLS (true/false)
- `MAIL_USER` - Email username
- `MAIL_PASS` - Email password (Protected & Masked)
- `MAIL_FROM_NAME` - Sender name
- `MAIL_FROM_ADDRESS` - Sender email

### SSH Deployment
- `SSH_PRIVATE_KEY` - SSH private key (Protected & Masked)
- `STAGING_SERVER` - Staging server hostname/IP
- `STAGING_USER` - SSH username for staging
- `PRODUCTION_SERVER` - Production server hostname/IP
- `PRODUCTION_USER` - SSH username for production

## Pipeline Stages

### 1. Build Stage
- `build:backend` - Install dependencies and prepare backend
- `build:frontend` - Install dependencies and build Nuxt 3 app
- `docker:backend` - Build and push backend Docker image
- `docker:frontend` - Build and push frontend Docker image

### 2. Test Stage
- `test:backend` - Run backend tests
- `test:frontend` - Run frontend tests

### 3. Deploy Stage
- `deploy:staging` - Deploy to staging environment (manual, develop branch)
- `deploy:production` - Deploy to production environment (manual, main branch)

## Accessing Services

### Production
- Frontend: `http://your-server:3000`
- Backend API: `http://your-server:9000/api`
- Socket.IO: `http://your-server:9000`
- Database: `your-server:3306`

### Staging
- Frontend: `http://staging-server:3001`
- Backend API: `http://staging-server:9001/api`
- Socket.IO: `http://staging-server:9001`
- Database: `staging-server:3307`

## Quick Start

### 1. Set up GitLab Variables
Add all required variables listed above in GitLab Settings.

### 2. Login to Docker Registry
```bash
docker login devops.laobullionbank.com
```

### 3. Server Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
cd /var/www/ticket-application
git clone <your-repo-url> .

# Copy and configure .env
cp .env.example .env
nano .env
```

### 4. Deploy
```bash
# For production
docker-compose -f docker-compose.prod.yml up -d

# For staging
docker-compose -f docker-compose.staging.yml up -d
```

## Useful Commands

### View logs
```bash
docker logs ticket-backend -f
docker logs ticket-frontend -f
docker logs ticket-db -f
```

### Restart services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Pull latest images
```bash
docker-compose -f docker-compose.prod.yml pull
```

## Monitoring

### Check container status
```bash
docker ps
```

### Check resource usage
```bash
docker stats
```

### Test connectivity
```bash
# Test backend
curl http://localhost:9000/api/health

# Test frontend
curl http://localhost:3000
```

## Files Structure

```
ticket-application/
├── .gitlab-ci.yml                 # CI/CD pipeline configuration
├── docker-compose.prod.yml        # Production deployment
├── docker-compose.staging.yml     # Staging deployment
├── .env.example                   # Environment variables template
├── GITLAB_CI_SETUP.md            # Detailed setup guide
├── QUICK_START.md                # Quick reference
├── DEPLOYMENT_SUMMARY.md         # This file
│
├── backend/
│   ├── Dockerfile                # Backend container config
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── Dockerfile                # Frontend container config
    ├── package.json
    └── nuxt.config.ts
```

## Next Steps

1. Configure all GitLab CI/CD variables
2. Set up your deployment servers
3. Test the pipeline with a push to `develop` branch
4. Deploy to staging and verify
5. Deploy to production when ready

## Support

For detailed information, see:
- **GITLAB_CI_SETUP.md** - Complete setup guide
- **QUICK_START.md** - Quick reference
- **README.md** - Project documentation
