from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class CreditTransactionResponse(BaseModel):
    id: str
    transaction_type: str
    amount: int
    balance_after: int
    step_name: Optional[str] = None
    status: str
    external_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CreditBalanceResponse(BaseModel):
    user_id: str
    current_balance: int
    total_earned: int
    total_spent: int
    transactions_count: int