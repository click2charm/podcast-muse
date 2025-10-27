from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    language: str = "en"
    target_duration_minutes: Optional[int] = None
    voice_gender: Optional[str] = None
    voice_tone: Optional[str] = None
    script_template: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    script_content: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    status: str
    script_content: Optional[str] = None
    script_tokens: Optional[int] = None
    audio_url: Optional[str] = None
    audio_duration_seconds: Optional[int] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    seo_metadata: Optional[Dict[str, Any]] = None
    generation_log: Optional[List[Dict[str, Any]]] = None
    total_credits_used: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PodcastGenerationRequest(BaseModel):
    title: str
    description: Optional[str] = None
    language: str = "en"
    target_duration_minutes: int = 10
    voice_gender: str = "female"
    voice_tone: str = "professional"
    script_template: str = "storytelling"
    image_style: str = "studio_mic"
    video_motion: str = "subtle"