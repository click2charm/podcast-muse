from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App settings
    app_name: str = "AI Podcast Generator"
    environment: str = "development"
    secret_key: str = "your-secret-key-change-in-production"

    # Database
    database_url: str = "postgresql://postgres:password@localhost:5432/podcast_muse"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # External APIs
    openai_base_url: str = "https://api.openai.com/v1"
    kie_base_url: str = "https://api.kie.ai"

    # Security
    encryption_key: str = "your-encryption-key-32-chars-long"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30 * 24 * 60  # 30 days

    # Credit system
    platform_fee_per_generation: int = 3
    script_generation_cost: int = 3
    tts_generation_cost: int = 3
    image_generation_cost: int = 3
    video_generation_cost: int = 3

    # File storage
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_bucket_name: Optional[str] = None

    # Features
    enable_video_generation: bool = True
    max_projects_per_user: int = 50

    class Config:
        env_file = ".env"

settings = Settings()