from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    credits = Column(Integer, default=0)
    api_keys = Column(JSON)  # Will store encrypted API keys
    preferences = Column(JSON, default={})
    subscription_tier = Column(String(50), default="free")
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))