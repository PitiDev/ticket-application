# GitLab CI/CD Quick Start

## 1. Initial Setup (One-time)

### Configure GitLab Variables

Go to **Settings > CI/CD > Variables** and add:

**Docker Registry:**
```
DOCKER_REGISTRY_USER=your_registry_username
DOCKER_REGISTRY_PASSWORD=your_registry_password (Protected & Masked)
```

**Essential Variables:**
```
DB_HOST=db
DB_USER=ticketuser
DB_PASSWORD=your_db_password (Protected & Masked)
DB_NAME=ticket_db
DB_ROOT_PASSWORD=your_root_password (Protected & Masked)
JWT_SECRET=your_jwt_secret (Protected & Masked)
```

**For SSH Deployment:**
```
SSH_PRIVATE_KEY=<your-private-key> (Protected & Masked)
STAGING_SERVER=staging.yourapp.com
STAGING_USER=deploy
PRODUCTION_SERVER=yourapp.com
PRODUCTION_USER=deploy
```

## 2. First Run

### Push to Repository

```bash
git add .
git commit -m "Add GitLab CI/CD configuration"
git push origin develop
```

The pipeline will automatically start!

## 3. Check Pipeline Status

1. Go to **CI/CD > Pipelines**
2. Click on the running pipeline
3. Monitor the jobs in each stage

## 4. Deploy

### To Staging (from develop branch)

1. Ensure pipeline passes all stages
2. Go to the **Deploy** stage
3. Click play button on `deploy:staging`
4. Verify at https://staging.yourapp.com

### To Production (from main branch)

1. Merge develop to main:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```
2. Go to the **Deploy** stage
3. Click play button on `deploy:production`
4. Verify at https://yourapp.com

## 5. Common Commands

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# Backend logs
docker logs ticket-backend -f

# Frontend logs
docker logs ticket-frontend -f

# Database logs
docker logs ticket-db -f
```

### Restart Services
```bash
cd /var/www/ticket-application
docker-compose -f docker-compose.prod.yml restart
```

### Stop All Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Start All Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 6. Troubleshooting

### Pipeline Fails at Build Stage
- Check if dependencies in package.json are correct
- Verify Node.js version compatibility

### Pipeline Fails at Docker Build
- Ensure GitLab Container Registry is enabled
- Check Dockerfile syntax

### Deployment Fails
- Verify SSH connection: `ssh user@server`
- Check if Docker is installed on server
- Verify environment variables are set

### Application Not Accessible
- Check if containers are running: `docker ps`
- Verify ports are not blocked by firewall
- Check Nginx configuration if using reverse proxy

## 7. Monitoring

### Check Application Health

**Backend:**
```bash
curl http://localhost:9000/api/health
```

**Frontend:**
```bash
curl http://localhost:3000
```

**Database:**
```bash
docker exec -it ticket-db mysql -u root -p -e "SHOW DATABASES;"
```

## 8. Rollback

If something goes wrong:

```bash
# SSH into server
ssh user@server

# Go to app directory
cd /var/www/ticket-application

# Checkout previous version
git log --oneline -10  # Find previous commit
git checkout <commit-hash>

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## Need More Help?

See **GITLAB_CI_SETUP.md** for detailed documentation.
