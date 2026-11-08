import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderItem, MenuItem
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])

def calculate_dynamic_wait_time(db: Session, order_items_prep_times: List[int]) -> int:
    """Calculate wait time dynamically based on active queue and prep time."""
    active_orders = db.query(Order).filter(Order.status.in_(["pending", "preparing"])).all()
    queue_count = len(active_orders)
    
    # Base prep time for this specific order
    max_item_prep = max(order_items_prep_times) if order_items_prep_times else 5
    
    # Pacing: each pending/preparing order ahead adds approximately 2.5 minutes of kitchen queue buffer
    queue_delay = int(queue_count * 2.5)
    
    estimated_wait = max_item_prep + queue_delay
    return max(4, estimated_wait)

@router.post("", response_model=OrderResponse, status_code=201)
def create_confirmed_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    if not order_data.confirmed:
        raise HTTPException(
            status_code=400,
            detail="Order must be explicitly confirmed by the customer before creation."
        )

    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    # Validate all items from actual database
    total_amount = 0.0
    item_prep_times = []
    prepared_items = []

    for item_input in order_data.items:
        db_item = db.query(MenuItem).filter(MenuItem.id == item_input.menu_item_id).first()
        if not db_item:
            raise HTTPException(
                status_code=404,
                detail=f"Menu item with ID {item_input.menu_item_id} does not exist."
            )
        if not db_item.is_available:
            raise HTTPException(
                status_code=400,
                detail=f"'{db_item.name}' is currently unavailable."
            )

        item_total = round(db_item.price * item_input.quantity, 2)
        total_amount += item_total
        item_prep_times.append(db_item.prep_time_minutes)

        prepared_items.append({
            "menu_item_id": db_item.id,
            "item_name": db_item.name,
            "unit_price": db_item.price,
            "quantity": item_input.quantity,
            "item_total": item_total,
            "customization": item_input.customization
        })

    # Generate unique order number
    rand_suffix = random.randint(1000, 9999)
    order_number = f"CM-{rand_suffix}"
    # Verify uniqueness
    while db.query(Order).filter(Order.order_number == order_number).first():
        order_number = f"CM-{random.randint(1000, 9999)}"

    estimated_wait = calculate_dynamic_wait_time(db, item_prep_times)

    new_order = Order(
        order_number=order_number,
        customer_name=order_data.customer_name.strip(),
        customer_phone=order_data.customer_phone.strip() if order_data.customer_phone else None,
        status="pending",
        total_amount=round(total_amount, 2),
        estimated_wait_minutes=estimated_wait,
        special_instructions=order_data.special_instructions,
        dietary_notes=order_data.dietary_notes,
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.flush()

    for p_item in prepared_items:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=p_item["menu_item_id"],
            item_name=p_item["item_name"],
            unit_price=p_item["unit_price"],
            quantity=p_item["quantity"],
            item_total=p_item["item_total"],
            customization=p_item["customization"]
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("", response_model=List[OrderResponse])
def get_orders(
    status: Optional[str] = Query(None, description="Filter by status: pending, preparing, ready, completed, cancelled"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status and status != "all":
        query = query.filter(Order.status == status.lower())
    return query.order_by(Order.created_at.desc()).limit(limit).all()

@router.get("/{identifier}", response_model=OrderResponse)
def get_order_by_id_or_number(identifier: str, db: Session = Depends(get_db)):
    if identifier.isdigit():
        order = db.query(Order).filter(Order.id == int(identifier)).first()
    else:
        order = db.query(Order).filter(Order.order_number.ilike(identifier.strip())).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = status_update.status.lower()
    order.status = new_status
    if new_status in ["ready", "completed", "cancelled"]:
        order.estimated_wait_minutes = 0
    order.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order
