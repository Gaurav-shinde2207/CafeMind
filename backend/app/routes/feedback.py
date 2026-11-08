from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CustomerFeedback
from app.schemas import CustomerFeedbackCreate, CustomerFeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=CustomerFeedbackResponse, status_code=201)
def submit_feedback(data: CustomerFeedbackCreate, db: Session = Depends(get_db)):
    # Simple rule-based sentiment calculation for immediate persistence
    lower = data.comment.lower()
    positive_words = {"great", "good", "best", "delicious", "amazing", "loved", "fresh", "cozy", "quick", "excellent", "perfect"}
    negative_words = {"slow", "bad", "cold", "late", "poor", "worst", "terrible", "stale", "delay", "expensive"}
    
    pos_score = sum(1 for w in positive_words if w in lower)
    neg_score = sum(1 for w in negative_words if w in lower)
    
    if data.rating >= 4 or pos_score > neg_score:
        sentiment = "positive"
        score = 0.85
    elif data.rating <= 2 or neg_score > pos_score:
        sentiment = "negative"
        score = 0.25
    else:
        sentiment = "neutral"
        score = 0.50

    new_fb = CustomerFeedback(
        order_id=data.order_id,
        customer_name=data.customer_name.strip(),
        rating=data.rating,
        comment=data.comment.strip(),
        sentiment=sentiment,
        sentiment_score=score
    )
    db.add(new_fb)
    db.commit()
    db.refresh(new_fb)
    return new_fb

@router.get("", response_model=List[CustomerFeedbackResponse])
def get_feedback_list(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(CustomerFeedback).order_by(CustomerFeedback.created_at.desc()).limit(limit).all()
