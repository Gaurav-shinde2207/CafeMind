from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Order, OrderItem

router = APIRouter(prefix="/stats", tags=["Café Stats"])

@router.get("")
def get_cafe_statistics(db: Session = Depends(get_db)):
    active_orders = db.query(Order).filter(Order.status.in_(["pending", "preparing"])).all()
    active_count = len(active_orders)
    
    # Calculate live wait time
    if active_count > 0:
        avg_wait = int(sum(o.estimated_wait_minutes for o in active_orders) / active_count)
    else:
        avg_wait = 5  # Standard base wait when queue is clear

    total_orders_today = db.query(Order).count()
    completed_orders = db.query(Order).filter(Order.status == "completed").count()
    ready_orders = db.query(Order).filter(Order.status == "ready").count()

    # Top selling items
    top_items = (
        db.query(OrderItem.item_name, func.sum(OrderItem.quantity).label("total_sold"))
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    popular_breakdown = [{"name": item[0], "sold": int(item[1])} for item in top_items]

    return {
        "active_orders_count": active_count,
        "average_wait_minutes": avg_wait,
        "total_orders": total_orders_today,
        "completed_orders": completed_orders,
        "ready_orders": ready_orders,
        "popular_items": popular_breakdown
    }
