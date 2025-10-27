# 🎧 AI Podcast Generator

BYOK SaaS platform for creating podcasts from idea to downloadable resources.

## 🚀 Quick Start

### Local Development
```bash
# Clone and start all services
docker-compose up --build

# Access apps
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Railway Deployment
1. Connect this repo to Railway
2. Railway will auto-deploy based on `railway.toml` config
3. Set environment variables in Railway dashboard

## 📁 Project Structure

```
podcast-muse/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── docs/             # Documentation
├── docker-compose.yml
└── railway.toml      # Railway deployment config
```

## 🛠 Tech Stack

- **Backend**: FastAPI + PostgreSQL + Redis
- **Frontend**: Next.js + Tailwind CSS
- **Deployment**: Railway + Docker
- **External APIs**: OpenAI, ElevenLabs (KIE), Flux, Hailao

## 🎯 Features

- ✅ User authentication
- ✅ API key management (BYOK)
- ✅ Script generation (OpenAI)
- ✅ Text-to-speech (ElevenLabs)
- ✅ Image generation (Flux)
- ✅ Video generation (Hailao)
- ✅ Credit system
- ✅ Download resources as ZIP

## 📖 Documentation

- [PRD](./docs/prd.md)
- [Architecture](./docs/architecture.md)

## 🚀 Deploy on Railway

1. Push to GitHub
2. Connect repo to Railway
3. Set environment variables:
   - `DATABASE_URL` (auto-provided by Railway)
   - `SECRET_KEY`
   - `REDIS_URL` (add Redis service)

## 🧪 Development

```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend development
cd frontend
npm install
npm run dev
```