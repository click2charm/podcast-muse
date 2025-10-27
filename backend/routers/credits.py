from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from models.user import User
from models.credit_transaction import CreditTransaction
from core.security import get_current_user

router = APIRouter()

@router.get("/balance", response_model=schemas.CreditBalanceResponse)
async def get_credit_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's credit balance and summary"""
    # Calculate total earned and spent
    total_earned = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id,
        CreditTransaction.amount > 0
    ).with_entities(CreditTransaction.amount).all()
    total_earned = sum([t[0] for t in total_earned]) if total_earned else 0

    total_spent = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id,
        CreditTransaction.amount < 0
    ).with_entities(CreditTransaction.amount).all()
    total_spent = abs(sum([t[0] for t in total_spent])) if total_spent else 0

    transactions_count = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    ).count()

    return schemas.CreditBalanceResponse(
        user_id=current_user.id,
        current_balance=current_user.credits,
        total_earned=total_earned,
        total_spent=total_spent,
        transactions_count=transactions_count
    )

@router.get("/transactions", response_model=List[schemas.CreditTransactionResponse])
async def get_credit_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's credit transaction history"""
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    ).order_by(CreditTransaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/purchase")
async def purchase_credits(
    amount: int,
    current_user: User = Depends(get_current_user)
):
    """Purchase credits (placeholder for Stripe integration)"""
    # TODO: Integrate with Stripe
    return {
        "message": "Credit purchase endpoint - to be implemented with Stripe",
        "amount": amount,
        "price": amount * 0.02  # $0.02 per credit
    }