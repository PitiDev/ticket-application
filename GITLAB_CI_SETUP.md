# GitLab CI/CD Setup Guide

This guide will help you set up GitLab CI/CD for your Ticket Management System.

## Overview

The CI/CD pipeline includes:
- **Build Stage**: Build and compile frontend and backend applications
- **Test Stage**: Run tests for both applications
- **Deploy Stage**: Deploy to staging and production environments

## Prerequisites

1. GitLab account with a repository
2. GitLab Runner configured (or use shared runners)
3. Docker registry access (GitLab Container Registry is used by default)
4. SSH access to your deployment servers (for traditional deployment)
5. Environment variables configured in GitLab

## GitLab CI/CD Variables Setup

Go to your GitLab project: **Settings > CI/CD > Variables** and add the following variables:

### Required Variables

#### Docker Registry (devops.laobullionbank.com)
- `DOCKER_REGISTRY_USER` - Docker registry username
- `DOCKER_REGISTRY_PASSWORD` - Docker registry password (mark as Protected & Masked)
- Registry URL: `devops.laobullionbank.com`
- Backend Image: `devops.laobullionbank.com/ticket-app/backend`
- Frontend Image: `devops.laobullionbank.com/ticket-app/frontend`

#### Database Configuration
- `DB_HOST` - Database host (e.g., `db` or `mysql.example.com`)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (mark as Protected & Masked)
- `DB_NAME` - Database name
- `DB_ROOT_PASSWORD` - MySQL root password (mark as Protected & Masked)

#### Application Configuration
- `JWT_SECRET` - Secret key for JWT tokens (mark as Protected & Masked)
- `FRONTEND_URL` - Frontend URL for production (e.g., `https://app.example.com`)
- `NUXT_PUBLIC_API_BASE` - Backend API URL (e.g., `https://api.example.com/api`)

#### Email Configuration
- `MAIL_HOST` - SMTP host (e.g., `smtp.gmail.com`)
- `MAIL_PORT` - SMTP port (e.g., `587`)
- `MAIL_SECURE` - Use TLS (e.g., `false` or `true`)
- `MAIL_USER` - Email username
- `MAIL_PASS` - Email password (mark as Protected & Masked)
- `MAIL_FROM_NAME` - Sender name (e.g., `Ticket System`)
- `MAIL_FROM_ADDRESS` - Sender email (e.g., `no-reply@example.com`)

#### Deployment Configuration (SSH Method)

##### Staging Environment
- `STAGING_SERVER` - Staging server IP or hostname
- `STAGING_USER` - SSH username for staging
- `SSH_PRIVATE_KEY` - SSH private key for authentication (mark as Protected & Masked)

##### Production Environment
- `PRODUCTION_SERVER` - Production server IP or hostname
- `PRODUCTION_USER` - SSH username for production
- `SSH_PRIVATE_KEY` - SSH private key for authentication (same as staging or separate)

## Pipeline Stages Explained

### 1. Build Stage

#### `build:backend`
- Installs backend dependencies
- Runs on changes to `backend/**/*`
- Caches `node_modules` for faster builds

#### `build:frontend`
- Installs frontend dependencies
- Builds the Nuxt 3 application
- Creates production-ready artifacts
- Runs on changes to `frontend/**/*`

#### `docker:backend` & `docker:frontend`
- Builds Docker images
- Tags images with commit SHA and `latest`
- Pushes to GitLab Container Registry
- Runs only on `main`, `develop`, or tags

### 2. Test Stage

#### `test:backend`
- Runs backend tests (currently placeholder)
- Add your test commands in `backend/package.json`

#### `test:frontend`
- Runs frontend tests (currently placeholder)
- Add your test commands in `frontend/package.json`

### 3. Deploy Stage

#### `deploy:staging`
- Deploys to staging environment
- Triggered manually on `develop` branch
- Uses SSH to connect to staging server
- Pulls latest Docker images and restarts services

#### `deploy:production`
- Deploys to production environment
- Triggered manually on `main` branch or tags
- Uses SSH to connect to production server
- Pulls latest Docker images and restarts services

## Setting Up SSH Access

### 1. Generate SSH Key Pair

On your local machine:

```bash
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@yourproject"
```

### 2. Add Public Key to Servers

Copy the public key to your servers:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub user@staging-server
ssh-copy-id -i ~/.ssh/id_rsa.pub user@production-server
```

### 3. Add Private Key to GitLab

1. Copy the private key content:
   ```bash
   cat ~/.ssh/id_rsa
   ```

2. Go to GitLab: **Settings > CI/CD > Variables**
3. Add variable `SSH_PRIVATE_KEY` with the private key content
4. Mark it as **Protected** and **Masked**

## Server Setup

### 1. Install Docker on Servers

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Prepare Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/ticket-application
sudo chown -R $USER:$USER /var/www/ticket-application

# Clone repository
cd /var/www/ticket-application
git clone <your-repo-url> .

# Copy environment files
cp .env.example .env
# Edit .env with your configuration
```

### 3. Create .env File

Create `/var/www/ticket-application/.env`:

```bash
# Docker Images
BACKEND_IMAGE=devops.laobullionbank.com/ticket-app/backend:latest
FRONTEND_IMAGE=devops.laobullionbank.com/ticket-app/frontend:latest

# Database
DB_HOST=db
DB_USER=ticketuser
DB_PASSWORD=your_secure_password
DB_NAME=ticket_db
DB_ROOT_PASSWORD=your_root_password

# Application
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://yourapp.com

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-email-password
MAIL_FROM_NAME=Ticket System
MAIL_FROM_ADDRESS=no-reply@yourapp.com

# API
NUXT_PUBLIC_API_BASE=https://api.yourapp.com/api
```

### 4. Login to Docker Registry

```bash
docker login devops.laobullionbank.com
# Enter your registry username and password
```

## Running the Pipeline

### Automatic Triggers

The pipeline runs automatically when:
- You push to `main` or `develop` branches
- You create a new tag
- You modify files in `backend/**/*` or `frontend/**/*`

### Manual Deployment

1. Go to **CI/CD > Pipelines** in GitLab
2. Find the successful pipeline
3. Click on the stage you want to deploy (staging or production)
4. Click the play button to trigger manual deployment

## Adding Tests

### Backend Tests

Update `backend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration"
  }
}
```

### Frontend Tests

Update `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "lint": "eslint ."
  }
}
```

## Kubernetes Deployment (Optional)

If you're using Kubernetes, uncomment the `deploy:k8s` job in `.gitlab-ci.yml` and:

1. Create Kubernetes manifests in a `k8s/` directory
2. Add `KUBE_CONTEXT` variable in GitLab
3. Configure kubectl access in your cluster

## Monitoring and Debugging

### View Pipeline Logs

1. Go to **CI/CD > Pipelines**
2. Click on the pipeline
3. Click on any job to view logs

### Common Issues

#### Docker Login Fails
- Check if `DOCKER_REGISTRY_PASSWORD` is properly set
- Verify you can login to devops.laobullionbank.com manually
- Ensure `DOCKER_REGISTRY_USER` has push permissions

#### SSH Connection Fails
- Verify SSH key is correctly added to GitLab variables
- Ensure server SSH access is configured
- Check if server is reachable from GitLab Runner

#### Build Fails
- Check if dependencies are correctly specified
- Verify Node.js version compatibility
- Review build logs for specific errors

## Rollback Strategy

### Manual Rollback

If deployment fails, you can manually rollback:

```bash
# SSH into server
ssh user@server

# Go to application directory
cd /var/www/ticket-application

# Pull previous working version
git checkout <previous-commit-sha>

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Using GitLab Environment Rollback

1. Go to **Deployments > Environments**
2. Select the environment
3. Click on the previous successful deployment
4. Click **Rollback**

## Best Practices

1. **Always test in staging first** before deploying to production
2. **Use protected branches** for `main` and `develop`
3. **Enable manual approval** for production deployments
4. **Monitor logs** after each deployment
5. **Keep secrets secure** - always mark sensitive variables as Protected & Masked
6. **Use tags** for production releases (e.g., `v1.0.0`)
7. **Backup database** before major deployments

## Next Steps

1. Configure all required GitLab CI/CD variables
2. Set up SSH access to your servers
3. Test the pipeline with a commit to `develop` branch
4. Review the build and test stages
5. Deploy to staging and verify
6. Deploy to production when ready

## Support

For issues or questions:
- Check GitLab CI/CD documentation: https://docs.gitlab.com/ee/ci/
- Review pipeline logs for error messages
- Contact your DevOps team
