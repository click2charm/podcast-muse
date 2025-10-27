from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"))
    transaction_type = Column(String(20), nullable=False)  # purchase, usage, refund, bonus
    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    step_name = Column(String(50))  # script, tts, image, video, platform_fee
    status = Column(String(20), nullable=False)  # pending, completed, failed, refunded
    external_reference = Column(String(100))  # Payment ID or API call reference
    metadata = Column(String)  # JSON string for additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    project = relationship("Project")