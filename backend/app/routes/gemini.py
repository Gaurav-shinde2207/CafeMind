from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import MenuItem, CustomerFeedback, Order, OrderItem
from app.schemas import (
    GeminiChatRequest,
    GeminiChatResponse,
    FeedbackAnalysisSummary,
    OperationalInsightsSummary
)
from app.gemini_service import (
    generate_chat_recommendations,
    analyze_customer_feedback,
    generate_operational_insights
)

router = APIRouter(prefix="/ai", tags=["AI & Gemini"])

@router.post("/chat", response_model=GeminiChatResponse)
def chat_with_gemini(request: GeminiChatRequest, db: Session = Depends(get_db)):
    # Query all available menu items strictly from the database
    db_items = db.query(MenuItem).filter(MenuItem.is_available == True).all()
    menu_items_data = [
        {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "category": item.category,
            "price": item.price,
            "dietary_tags": item.dietary_tags,
            "allergens": item.allergens,
            "prep_time_minutes": item.prep_time_minutes,
            "is_popular": item.is_popular
        }
        for item in db_items
    ]

    preferences_dict = request.user_preferences.model_dump() if request.user_preferences else None

    result = generate_chat_recommendations(
        user_message=request.message,
        conversation_history=request.conversation_history,
        available_menu_items=menu_items_data,
        user_preferences=preferences_dict
    )

    return result

@router.post("/feedback-summary", response_model=FeedbackAnalysisSummary)
def get_feedback_analysis(db: Session = Depends(get_db)):
    feedbacks = db.query(CustomerFeedback).order_by(CustomerFeedback.created_at.desc()).limit(30).all()
    feedbacks_data = [
        {
            "id": fb.id,
            "customer_name": fb.customer_name,
            "rating": fb.rating,
            "comment": fb.comment,
            "sentiment": fb.sentiment
        }
        for fb in feedbacks
    ]
    return analyze_customer_feedback(feedbacks_data)

@router.post("/operational-insights", response_model=OperationalInsightsSummary)
def get_operational_insights_summary(db: Session = Depends(get_db)):
    # Calculate live queue stats
    active_orders = db.query(Order).filter(Order.status.in_(["pending", "preparing"])).all()
    active_count = len(active_orders)
    avg_wait = int(sum(o.estimated_wait_minutes for o in active_orders) / active_count) if active_count > 0 else 5

    # Top items by volume in order items
    top_items_query = (
        db.query(OrderItem.item_name, func.sum(OrderItem.quantity).label("total_qty"))
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_selling = [item[0] for item in top_items_query] if top_items_query else ["Cappuccino", "Masala Chai", "Paneer Sandwich"]

    stats = {
        "active_orders_count": active_count,
        "average_wait_minutes": avg_wait,
        "top_selling_items": top_selling
    }

    return generate_operational_insights(stats)
