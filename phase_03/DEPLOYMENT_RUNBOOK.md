# Deployment Runbook: Plannior Phase III

**Last Updated**: 2026-02-07
**Version**: 1.0
**Status**: Production Ready

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Migrations](#database-migrations)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Health Checks](#health-checks)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

- [ ] Code changes merged to main branch
- [ ] All tests passing (contract, E2E, performance)
- [ ] Security scan completed (SECURITY_SCAN.md)
- [ ] Quickstart validation passed (QUICKSTART_VALIDATION.md)
- [ ] Database backups enabled (Neon)
- [ ] Environment variables prepared
- [ ] SSL/TLS certificates configured
- [ ] API keys rotated (OPENROUTER_API_KEY)
- [ ] JWT_SECRET changed from default
- [ ] CORS origins narrowed for production domain
- [ ] Rate limiting configured (API gateway)
- [ ] Monitoring and alerting set up

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/plannior_prod

# API Keys
OPENROUTER_API_KEY=sk-or-v1-your-prod-key-here
JWT_SECRET=your-long-random-secret-key-min-32-chars

# Application
DEBUG=False
APP_NAME=Plannior Phase III
APP_VERSION=1.0.0
LOG_LEVEL=INFO

# CORS (production)
ALLOWED_ORIGINS=https://plannior.example.com,https://www.plannior.example.com
```

### Frontend Environment Variables

Create `.env.production.local` in `frontend/` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.plannior.example.com/api

# Authentication
NEXT_PUBLIC_AUTH_URL=https://plannior.example.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Environment Validation

```bash
# Backend validation
cd backend
python -c "from app.config import settings; print('✓ Config loaded'); print(f'App: {settings.app_name} v{settings.app_version}')"

# Frontend validation
cd frontend
npm run build
```

---

## Database Migrations

### Initial Setup

```bash
# Create tables and relationships
cd backend
python reset_database.py

# Verify tables created
# Tables: conversation, message, user (if applicable), task (if applicable)
```

### Schema Management

**Current Schema** (Phase 3):

```sql
-- Conversations table
CREATE TABLE conversation (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE message (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    tool_call_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at)
);
```

### Backup Before Migration

```bash
# Neon PostgreSQL backup
# Configured in Neon dashboard: automatic daily backups

# Manual backup (if needed)
pg_dump -h neon-host -U user -d plannior_prod -F c > backup_2026-02-07.dump

# Restore from backup
pg_restore -h neon-host -U user -d plannior_prod backup_2026-02-07.dump
```

---

## Backend Deployment

### Option 1: Docker Deployment

```bash
# Build Docker image
cd backend
docker build -t plannior-backend:1.0.0 .

# Push to registry
docker tag plannior-backend:1.0.0 registry.example.com/plannior-backend:1.0.0
docker push registry.example.com/plannior-backend:1.0.0

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Verify running
docker ps | grep plannior-backend
```

### Option 2: Traditional Server Deployment

```bash
# Connect to server
ssh user@api.plannior.example.com

# Pull latest code
cd /opt/plannior/backend
git pull origin main

# Install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file (see Environment Configuration)
nano .env

# Initialize database
python reset_database.py

# Start service with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app

# Or with systemd (recommended)
sudo systemctl start plannior-backend
sudo systemctl enable plannior-backend
```

### Option 3: Managed Service (Vercel/Render/Railway)

```bash
# Deploy to Render/Railway/etc via git
git push origin main

# Service automatically:
# 1. Detects Python app
# 2. Installs requirements
# 3. Runs Gunicorn on port 8000
# 4. Scales automatically

# Verify deployment
curl https://api.plannior.example.com/health
```

### Health Check

```bash
# Verify backend is responding
curl -X GET https://api.plannior.example.com/health

# Expected response
{
  "status": "healthy",
  "service": "Plannior Phase III",
  "version": "1.0.0"
}

# Status should be 200 OK
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Environment variables automatically set from .env.production.local
# Custom domain configured in Vercel dashboard
```

### Option 2: Docker Deployment

```bash
# Build Docker image
cd frontend
docker build -t plannior-frontend:1.0.0 .

# Push to registry
docker tag plannior-frontend:1.0.0 registry.example.com/plannior-frontend:1.0.0
docker push registry.example.com/plannior-frontend:1.0.0

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Static Hosting (S3 + CloudFront)

```bash
# Build production bundle
cd frontend
npm run build

# Upload to S3
aws s3 sync .next/static s3://plannior-frontend/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

### Verify Deployment

```bash
# Frontend loads at https://plannior.example.com
curl -I https://plannior.example.com

# API integration verified by health check
curl -X GET https://api.plannior.example.com/health
```

---

## Health Checks

### Endpoint Health Verification

```bash
# Backend health
curl https://api.plannior.example.com/health

# Response format
{
  "status": "healthy",
  "service": "Plannior Phase III",
  "version": "1.0.0"
}

# Status codes
# 200: Healthy and ready
# 503: Temporarily unavailable
# 500: Critical error
```

### Component Health Matrix

| Component | Endpoint | Check | Status |
|-----------|----------|-------|--------|
| Backend | /health | GET | ✓ 200 |
| Database | PostgreSQL | Connection | ✓ Connected |
| Frontend | / | GET | ✓ 200 |
| API | /api/docs | GET | ✓ Available |
| JWT | Authorization | Signature | ✓ Valid |

### Automated Health Checks

```bash
# Configure in monitoring system (DataDog, New Relic, etc.)
- URL: https://api.plannior.example.com/health
- Interval: Every 60 seconds
- Timeout: 10 seconds
- Alert if failing for > 5 minutes
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Request Latency**
   - Target: p95 < 5s (from spec)
   - Alert if: p95 > 7s for 10 min

2. **Error Rate**
   - Target: < 1%
   - Alert if: > 5% for 5 min

3. **Database Connections**
   - Target: Pool size 5-20
   - Alert if: Exhausted (> 20 active)

4. **Disk Usage**
   - Target: < 70%
   - Alert if: > 80%

5. **Memory Usage**
   - Target: < 70%
   - Alert if: > 80% for 10 min

### Log Aggregation

```bash
# Configure CloudWatch / ELK / Datadog
- Forward logs to: CloudWatch Logs
- Group name: /plannior/backend
- Stream name: production
- Retention: 30 days

# Search for errors
aws logs filter-log-events \
  --log-group-name /plannior/backend \
  --log-stream-names production \
  --filter-pattern "ERROR"

# Search for latency
aws logs filter-log-events \
  --log-group-name /plannior/backend \
  --log-stream-names production \
  --filter-pattern "[..., latency > 5000, ...]"
```

### Alert Configuration

```
Alert Rules:
1. Health check failure (2 consecutive failures)
   -> Page on-call engineer
   -> Severity: P1

2. Error rate spike (> 5% for 5 min)
   -> Notify team in Slack
   -> Severity: P2

3. Database connection exhaustion
   -> Page on-call engineer
   -> Severity: P1

4. High latency (p95 > 7s)
   -> Notify team in Slack
   -> Severity: P3
```

---

## Rollback Procedures

### Automated Rollback

```bash
# If deployment fails health checks
- Health check endpoint (/health) fails 3x in a row
- Automatically revert to previous version
- Alert engineering team
```

### Manual Rollback

#### For Docker Deployment

```bash
# Stop current version
docker stop plannior-backend:1.0.0

# Run previous version
docker run -d plannior-backend:0.9.0

# Verify health
curl https://api.plannior.example.com/health
```

#### For Git-based Deployment

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Service automatically redeploys
# Verify health in 2-3 minutes
```

#### For Database Rollback

```bash
# Restore from backup
pg_restore -h neon-host -U user -d plannior_prod backup_2026-02-06.dump

# Verify restore
psql -h neon-host -U user -d plannior_prod -c "SELECT COUNT(*) FROM conversation;"
```

---

## Troubleshooting

### Backend Won't Start

```
Symptom: 502 Bad Gateway
Cause: Backend process not running

Solution:
1. Check backend logs: docker logs plannior-backend
2. Verify environment variables: env | grep DATABASE_URL
3. Verify database connection: python -c "import psycopg2; psycopg2.connect(DATABASE_URL)"
4. Restart service: systemctl restart plannior-backend
```

### High Latency

```
Symptom: p95 latency > 7s
Cause: Database connection pooling exhaustion or query slowness

Solution:
1. Check active connections: SELECT COUNT(*) FROM pg_stat_activity;
2. Identify slow queries: SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;
3. Check API logs for TRACE_ID and latency metrics
4. Increase pool size in config.py if consistently exhausted
```

### 401 Unauthorized Errors

```
Symptom: All API requests return 401
Cause: JWT_SECRET mismatch or JWT token invalid

Solution:
1. Verify JWT_SECRET in .env matches token generation
2. Regenerate test JWT token with current SECRET
3. Check Authorization header format: "Bearer <token>"
4. Verify JWT signature with: jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```

### Database Connection Errors

```
Symptom: "Connection refused" or "Connection pool exhausted"
Cause: Database unreachable or connection limit exceeded

Solution:
1. Verify DATABASE_URL is correct
2. Test connection: psql postgresql://user:pass@host:5432/db
3. Check Neon status: https://status.neon.tech
4. Increase pool size: pool_size=10, max_overflow=20 in config.py
```

### 403 Forbidden Errors

```
Symptom: User cannot access their own data
Cause: User_id mismatch between JWT and URL

Solution:
1. Verify user_id in JWT matches URL parameter
2. Example: If JWT has user_id=abc, URL must be /api/abc/chat
3. Check auth context is retrieving correct user_id
```

---

## Post-Deployment Tasks

- [ ] Verify all endpoints responding
- [ ] Run smoke tests (Quickstart validation)
- [ ] Monitor error rates for 30 min
- [ ] Confirm database backups running
- [ ] Update DNS if domain changed
- [ ] Notify stakeholders of deployment
- [ ] Schedule post-incident review if issues found

---

## Maintenance Schedule

- **Daily**: Monitor health checks and error rates
- **Weekly**: Review logs for patterns, test backup restoration
- **Monthly**: Performance analysis, security scan, dependency updates
- **Quarterly**: Database optimization, capacity planning

---

## Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **DevOps Lead**: [Contact Info]
- **Security Team**: [Contact Info]
- **Database Admin**: [Contact Info]

---

**Version History**:
- v1.0.0 (2026-02-07): Initial runbook for Phase III MVP

