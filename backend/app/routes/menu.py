from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MenuItem
from app.schemas import MenuItemResponse

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("", response_model=List[MenuItemResponse])
def get_menu(
    category: Optional[str] = Query(None, description="Filter by category"),
    dietary: Optional[str] = Query(None, description="Filter by dietary tag e.g. Vegan, Gluten-Free"),
    search: Optional[str] = Query(None, description="Search term for name or description"),
    available_only: bool = Query(True, description="Only show available items"),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem)
    if available_only:
        query = query.filter(MenuItem.is_available == True)
    if category and category != "All":
        query = query.filter(MenuItem.category.ilike(f"%{category}%"))
    if dietary and dietary != "All":
        query = query.filter(MenuItem.dietary_tags.ilike(f"%{dietary}%"))
    if search:
        term = f"%{search.strip()}%"
        query = query.filter((MenuItem.name.ilike(term)) | (MenuItem.description.ilike(term)))
    
    return query.order_by(MenuItem.category, MenuItem.name).all()

@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item
