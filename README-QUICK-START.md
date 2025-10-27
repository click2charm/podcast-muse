# 🚀 Quick Start Guide

## Option 1: Docker (Recommended - After Docker Desktop is running)

```bash
# 1. Open Docker Desktop first!
# 2. Start containers
docker-compose up --build -d

# 3. Wait 30 seconds, then setup database
docker-compose exec backend python -c "
from database import engine
from models import *
Base.metadata.create_all(bind=engine)
print('✅ Database ready!')
"

# 4. Check status
docker-compose ps
```

## Option 2: Manual Development (Without Docker)

### 1. Start PostgreSQL & Redis locally
```bash
# If you have Homebrew:
brew install postgresql redis
brew services start postgresql
brew services start redis

# Create database
createdb podcast_muse
```

### 2. Setup Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://localhost/podcast_muse"
export SECRET_KEY="dev-secret-key"
export ENCRYPTION_KEY="dev-encryption-key-32-chars-long"

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Setup Frontend (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

## Access URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Test Everything
1. Go to http://localhost:3000
2. Click "Get Started Free"
3. Register new account
4. Check dashboard at http://localhost:3000/dashboard
5. Try API at http://localhost:8000/docs

## Troubleshooting
- **Docker not running**: Open Docker Desktop app
- **Port 3000/8000 in use**: Kill processes using `lsof -ti:3000 | xargs kill`
- **Database connection**: Make sure PostgreSQL is running
- **Permission errors**: On Mac: `chmod +x start-dev.sh`

## First Steps
1. Register for account (100 free credits!)
2. Navigate to Settings → API Keys
3. Add your OpenAI API key
4. Create first podcast project

Need help? Check the full guide in `DEPLOYMENT.md` 📚