# Kopa360 Backend - Deployment Guide

Complete production deployment checklist and instructions.

## Pre-Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run build` (0 errors)
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring/logging configured
- [ ] Team reviewed changes
- [ ] Release notes prepared

## Environment Variables (Production)

Create `.env` file with these variables. **Never commit to git.**

```env
# CRITICAL: Change these for production
NODE_ENV=production
JWT_SECRET=<generate-cryptographically-random-32-char-string>
DATABASE_URL=postgresql://user:password@prod-db-host:5432/Kopa360
FRONTEND_URL=https://app.Kopa360.com

# Optional
PORT=3000
ADMIN_DEFAULT_PASSWORD=<change-after-deployment>
```

### Generating JWT_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE Kopa360;
CREATE USER Kopa360_user WITH PASSWORD 'strong-password-here';
ALTER ROLE Kopa360_user WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE Kopa360 TO Kopa360_user;
```

### 2. Run Migrations

```bash
DATABASE_URL="postgresql://Kopa360_user:password@localhost:5432/Kopa360" \
  npx prisma migrate deploy
```

### 3. Seed Data (Optional)

```bash
npm run prisma:seed
```

This creates:

- 1 Super Admin
- 1 Manager
- 1 Front Desk staff
- 3 sample tutors
- 3 sample gigs

**Change admin passwords immediately after deployment!**

## Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create Kopa360-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 --app Kopa360-api

# Set environment variables
heroku config:set JWT_SECRET=<value> --app Kopa360-api
heroku config:set NODE_ENV=production --app Kopa360-api
heroku config:set FRONTEND_URL=https://your-frontend.com --app Kopa360-api

# Push code
git push heroku main

# Run migrations
heroku run npm run prisma:migrate --app Kopa360-api

# Seed data
heroku run npm run prisma:seed --app Kopa360-api

# View logs
heroku logs --tail --app Kopa360-api
```

### Option 2: AWS (EC2 + RDS)

#### 1. Setup RDS PostgreSQL

```bash
# Via AWS Console:
# 1. Create RDS instance (PostgreSQL 12+)
# 2. Multi-AZ enabled
# 3. Automated backups: 30 days
# 4. Enhanced monitoring enabled
# 5. Store endpoint URL
```

#### 2. Create EC2 Instance

```bash
# Instance type: t3.medium or larger
# OS: Ubuntu 22.04 LTS
# Storage: 20GB SSD
# Security group: Allow port 3000 inbound
```

#### 3. Deploy Code

```bash
# SSH into instance
ssh -i key.pem ubuntu@ec2-instance-url

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone code
git clone https://github.com/Kopa360/backend.git
cd backend

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env
nano .env  # Edit with RDS endpoint, JWT_SECRET, etc

# Build
npm run build

# Run migrations
npm run prisma:migrate

# Seed
npm run prisma:seed

# Install PM2 (process manager)
sudo npm install -g pm2

# Start app
pm2 start dist/server.js --name Kopa360-api

# Logs
pm2 logs Kopa360-api

# Restart on reboot
pm2 startup
pm2 save
```

### Option 3: Docker

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Remove source maps in production
RUN find dist -name "*.map" -delete

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run
CMD ["node", "dist/server.js"]
```

#### 2. Create Docker Compose (for local testing)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: Kopa360_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: Kopa360
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://Kopa360_user:password@db:5432/Kopa360
      JWT_SECRET: dev-secret-change-in-prod
      NODE_ENV: production
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - db
    command: sh -c "npm run prisma:migrate && npm run prisma:seed && npm start"

volumes:
  postgres_data:
```

#### 3. Deploy

```bash
# Build image
docker build -t Kopa360-api:latest .

# Push to registry (AWS ECR, Docker Hub, etc)
docker tag Kopa360-api:latest myregistry/Kopa360-api:latest
docker push myregistry/Kopa360-api:latest

# Run container
docker run -d \
  --name Kopa360-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e NODE_ENV="production" \
  -e FRONTEND_URL="https://app.Kopa360.com" \
  myregistry/Kopa360-api:latest
```

### Option 4: DigitalOcean App Platform

```bash
# Create app.yaml
app_name: Kopa360-api
services:
- name: api
  github:
    repo: your-org/Kopa360-backend
    branch: main
  build_command: npm ci && npm run build
  run_command: npm start
  http_port: 3000
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    scope: RUN_AND_BUILD_TIME
    value: ${JWT_SECRET}
  - key: DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    value: ${DATABASE_URL}
  - key: FRONTEND_URL
    value: https://app.Kopa360.com
databases:
- name: db
  engine: PG
  version: "15"
```

```bash
# Deploy
doctl apps create --spec app.yaml
```

## Post-Deployment

### 1. Verify Health

```bash
curl https://api.Kopa360.com/health
# Expected: {"status":"ok","timestamp":"...","environment":"production"}
```

### 2. Change Default Passwords

```bash
# Use admin endpoints to reset passwords
curl -X POST https://api.Kopa360.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@Kopa360.com","password":"admin123456"}'
```

### 3. Setup Monitoring

#### Sentry (Error Tracking)

```bash
npm install @sentry/node

# In src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### CloudWatch (AWS Logs)

```bash
npm install aws-sdk winston-cloudwatch

# Configure Winston logger
```

#### DataDog (APM)

```bash
npm install dd-trace

# Enable at app start
require('dd-trace').init()
```

### 4. Setup Database Backups

**AWS RDS:**

```
Automated backups: 30 days
Multi-AZ: Enabled
Backup window: 03:00 UTC (off-peak)
Copy snapshots to another region
```

**Manual backup:**

```bash
pg_dump -U Kopa360_user -h prod-db.rds.amazonaws.com Kopa360 > backup.sql
```

### 5. Configure Auto-Scaling

**AWS ELB + Auto Scaling Group:**

```
Min instances: 2
Max instances: 10
Target CPU: 70%
Health check: /health
```

### 6. Setup Firewall/DDoS

- CloudFlare or AWS Shield for DDoS protection
- WAF rules for rate limiting
- IP whitelisting for admin endpoints (optional)

## Rollback Procedure

### Rollback Last Deployment

```bash
# Heroku
heroku releases --app Kopa360-api
heroku rollback v42 --app Kopa360-api

# AWS EC2
git revert <commit-hash>
npm run build
pm2 restart Kopa360-api

# Docker
docker run -d --name Kopa360-api-prev image:old-tag
```

### Database Rollback

```bash
# If migration failed, rollback Prisma
npm run prisma:migrate:resolve -- --rolled-back

# If data corrupted, restore from backup
# AWS: Restore RDS snapshot
# Local: psql < backup.sql
```

## Monitoring & Alerts

### Key Metrics

1. **API Response Time**: Alert if > 500ms p95
2. **Error Rate**: Alert if > 1%
3. **Database Connection Pool**: Alert if > 90% used
4. **CPU Usage**: Alert if > 80%
5. **Memory Usage**: Alert if > 85%
6. **Disk Space**: Alert if < 10% free

### Setup Alerts

**CloudWatch:**

```
API errors > 100/min → Email
Response time p95 > 500ms → PagerDuty
Database CPU > 80% → Slack
```

## Security Checklist

- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] CORS configured for frontend domain only
- [ ] Rate limiting enabled (e.g., 100 req/min per IP)
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (no direct HTML responses)
- [ ] CSRF tokens if needed (check frontend)
- [ ] Database encryption at rest
- [ ] Database encrypted in transit
- [ ] API keys rotated regularly
- [ ] Secrets stored in secure vault (not .env file)
- [ ] SSH key authentication (not passwords)
- [ ] Security group limits port 3000 to ALB only
- [ ] WAF rules enabled
- [ ] Audit logs enabled

## Performance Optimization

### Database Queries

```typescript
// ✅ Good: Only fetch needed fields
await prisma.tutor.findMany({
  select: { id: true, status: true },
});

// ❌ Bad: Fetches everything
await prisma.tutor.findMany();
```

### Connection Pooling

```env
DATABASE_URL="postgresql://user:pass@host:5432/Kopa360?schema=public&connection_limit=20"
```

### Caching (Future)

```typescript
// Add Redis for frequently accessed data
import redis from "redis";
const client = redis.createClient();

// Cache tutor statuses
await client.setEx("tutor:status:" + tutorId, 3600, JSON.stringify(status));
```

### Compression

```typescript
import compression from "compression";
app.use(compression());
```

## Troubleshooting

### Server won't start

```bash
# Check logs
pm2 logs Kopa360-api

# Check port conflict
lsof -i :3000

# Check environment variables
env | grep -E "JWT_SECRET|DATABASE_URL"
```

### Database connection error

```bash
# Test connection
psql -U Kopa360_user -h host -d Kopa360

# Check credentials in .env
cat .env | grep DATABASE_URL
```

### High memory usage

```bash
# Check for memory leaks
pm2 monit

# Restart if necessary
pm2 restart Kopa360-api

# Consider increasing Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Slow queries

```bash
# Enable slow query log in PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

# Check query execution plans
EXPLAIN ANALYZE SELECT ...;
```

## Backup & Recovery

### Daily Backup

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -U Kopa360_user -h db.example.com Kopa360 | \
  gzip > /backups/Kopa360-$DATE.sql.gz

# Upload to S3
aws s3 cp /backups/Kopa360-$DATE.sql.gz s3://backup-bucket/Kopa360/
```

### Restore from Backup

```bash
# Decompress
gunzip Kopa360-20240104.sql.gz

# Restore
psql -U Kopa360_user -h localhost Kopa360 < Kopa360-20240104.sql
```

## Maintenance Windows

Schedule monthly maintenance:

- Database VACUUM FULL
- Index reorg
- Stats update
- Log cleanup

```bash
# Create maintenance job
0 2 * * 0 psql -U Kopa360_user -d Kopa360 -c "VACUUM FULL ANALYZE;"
```

## Support Contacts

- **Database Issues**: DevOps team
- **API Issues**: Backend team
- **Security Issues**: security@Kopa360.com
- **Performance Issues**: DevOps + Backend teams

---

**Last Updated**: 2024-01-04  
**Maintained By**: Backend Team
