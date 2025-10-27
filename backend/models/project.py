from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String)
    language = Column(String(10), default="en")
    target_duration_minutes = Column(Integer)
    voice_gender = Column(String(10))
    voice_tone = Column(String(50))
    script_template = Column(String(50))
    status = Column(String(20), default="draft")  # draft, generating, completed, failed
    script_content = Column(String)
    script_tokens = Column(Integer)
    audio_url = Column(String(500))
    audio_duration_seconds = Column(Integer)
    image_url = Column(String(500))
    video_url = Column(String(500))
    seo_metadata = Column(JSON)
    generation_log = Column(JSON, default=[])
    total_credits_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="projects")