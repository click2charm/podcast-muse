from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from models.user import User
from core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=schemas.UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/", response_model=schemas.UserResponse)
async def update_user_profile(
    user_update: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Update only provided fields
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.preferences is not None:
        current_user.preferences = user_update.preferences

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/api-keys")
async def get_api_keys(current_user: User = Depends(get_current_user)):
    """Get user's API keys (without exposing actual keys)"""
    # This would return key metadata but not the actual encrypted keys
    return {"message": "API keys endpoint - to be implemented"}

@router.post("/api-keys")
async def add_api_key(current_user: User = Depends(get_current_user)):
    """Add or update API keys"""
    return {"message": "Add API keys endpoint - to be implemented"}