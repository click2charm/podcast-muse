from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import os
import uvicorn

from database import engine, Base
from routers import auth, users, projects, credits
from core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 AI Podcast Generator API starting up...")
    yield
    print("🛑 AI Podcast Generator API shutting down...")

# Create FastAPI app
app = FastAPI(
    title="AI Podcast Generator API",
    description="BYOK SaaS platform for creating podcasts from idea to downloadable resources",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(credits.router, prefix="/api/v1/credits", tags=["Credits"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Podcast Generator API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "docs": "/docs",
        "health": "/health"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": "connected",  # TODO: Add actual database health check
        "redis": "connected"     # TODO: Add actual Redis health check
    }

# API info endpoint
@app.get("/api/v1/info")
async def api_info():
    return {
        "name": "AI Podcast Generator",
        "version": "1.0.0",
        "description": "BYOK SaaS platform for podcast generation",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "projects": "/api/v1/projects",
            "credits": "/api/v1/credits"
        },
        "external_apis": {
            "openai": "Script generation & SEO",
            "kie": "TTS (ElevenLabs) + Images (Flux) + Videos (Hailao)"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )