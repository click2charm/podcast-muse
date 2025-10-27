# 🚀 Deployment Guide

## Local Development

### Prerequisites
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone <your-repo-url>
cd podcast-muse

# Start development environment
./start-dev.sh
```

### Manual Setup
```bash
# Copy environment variables
cp .env.example .env

# Build and start containers
docker-compose up --build

# Create database tables
docker-compose exec backend python -c "
from database import engine
from models import *
Base.metadata.create_all(bind=engine)
"
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

---

## Railway Deployment

### Prerequisites
- Railway account
- GitHub repository

### Step 1: Connect Repository
1. Push code to GitHub
2. Connect repo to Railway
3. Railway will auto-detect services from `railway.toml`

### Step 2: Configure Services
Railway will create 3 services:
1. **Backend** (FastAPI)
2. **Frontend** (Next.js)
3. **Database** (PostgreSQL)

### Step 3: Set Environment Variables

#### Backend Service Variables:
```
DATABASE_URL=postgresql://username:password@host.railway.app:5432/railway
REDIS_URL=redis://host.railway.app:6379
SECRET_KEY=your-production-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENVIRONMENT=production
```

#### Frontend Service Variables:
```
NEXT_PUBLIC_API_URL=${{services.backend.url}}
ENVIRONMENT=production
```

### Step 4: Add Redis Service
1. In Railway dashboard, click "New Service"
2. Choose "Redis" from template
3. Once provisioned, copy REDIS_URL to backend variables

### Step 5: Deploy
- Push to GitHub → Railway auto-deploys
- Or click "Deploy" in Railway dashboard

### Monitor Deployment
- Check logs in Railway dashboard
- Monitor health at `/health` endpoint
- API docs at `/docs`

---

## Environment Variables

### Development (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/podcast_muse

# Cache & Queue
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=dev-secret-key
ENCRYPTION_KEY=dev-encryption-key-32-chars

# External APIs
OPENAI_BASE_URL=https://api.openai.com/v1
KIE_BASE_URL=https://api.kie.ai

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (Railway)
```bash
# Database (auto-provided by Railway)
DATABASE_URL=postgresql://username:password@host.railway.app:5432/railway

# Redis (add Redis service)
REDIS_URL=redis://host.railway.app:6379

# Security (CHANGE THESE!)
SECRET_KEY=your-super-secure-production-secret-key
ENCRYPTION_KEY=your-32-character-production-encryption-key

# Environment
ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_API_URL=${{services.backend.url}}
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database connection
docker-compose exec backend python -c "
from database import engine
try:
    engine.connect()
    print('✅ Database connected successfully!')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
```

#### 2. Redis Connection Errors
```bash
# Check Redis connection
docker-compose exec redis redis-cli ping
```

#### 3. Frontend API Connection
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running on correct port
- Check CORS settings in backend

#### 4. Railway Deployment Issues
- Check service logs in Railway dashboard
- Verify all environment variables are set
- Ensure DATABASE_URL format is correct
- Check if Redis service is added

### Health Checks
```bash
# Local
curl http://localhost:8000/health

# Railway
curl https://your-app-url.railway.app/health
```

### View Logs
```bash
# Local
docker-compose logs -f backend
docker-compose logs -f frontend

# Railway
# Use Railway dashboard logs viewer
```

---

## Production Best Practices

### Security
- Change default SECRET_KEY and ENCRYPTION_KEY
- Use strong, unique keys
- Enable HTTPS (Railway auto-provides)
- Regularly rotate secrets

### Monitoring
- Set up error monitoring (Sentry)
- Monitor API usage and costs
- Set up alerts for failures
- Regular database backups

### Scaling
- Monitor resource usage
- Add Redis caching
- Implement rate limiting
- Consider CDN for static assets

---

## Next Steps

After deployment:

1. **Test Core Flow**
   - Register new user
   - Add API keys
   - Create simple podcast project

2. **Configure External APIs**
   - Get OpenAI API key
   - Get KIE API key
   - Test integrations

3. **Set Up Monitoring**
   - Configure error tracking
   - Set up usage analytics
   - Monitor credit system

4. **Customize Branding**
   - Update logo and colors
   - Customize landing page
   - Add custom domains

For any issues, check the logs or contact support! 🚀