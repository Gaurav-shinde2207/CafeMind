from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TastePreference
from app.schemas import TastePreferenceCreate, TastePreferenceResponse

router = APIRouter(prefix="/preferences", tags=["Taste Preferences"])

@router.get("/{customer_id}", response_model=TastePreferenceResponse)
def get_preferences(customer_id: str, db: Session = Depends(get_db)):
    pref = db.query(TastePreference).filter(TastePreference.customer_id == customer_id).first()
    if not pref:
        # Return default preferences if not yet saved
        return TastePreferenceResponse(
            id=0,
            customer_id=customer_id,
            dietary="All",
            coffee_preference="Mild & creamy",
            sweetness_level="Normal",
            budget_max=500.0,
            allergies="None",
            favorite_flavors="Caramel, Vanilla, Cardamom",
            updated_at=datetime.utcnow()
        )
    return pref

from datetime import datetime

@router.post("", response_model=TastePreferenceResponse)
def save_preferences(pref_in: TastePreferenceCreate, db: Session = Depends(get_db)):
    pref = db.query(TastePreference).filter(TastePreference.customer_id == pref_in.customer_id).first()
    if pref:
        pref.dietary = pref_in.dietary
        pref.coffee_preference = pref_in.coffee_preference
        pref.sweetness_level = pref_in.sweetness_level
        pref.budget_max = pref_in.budget_max
        pref.allergies = pref_in.allergies
        pref.favorite_flavors = pref_in.favorite_flavors
        pref.updated_at = datetime.utcnow()
    else:
        pref = TastePreference(
            customer_id=pref_in.customer_id,
            dietary=pref_in.dietary,
            coffee_preference=pref_in.coffee_preference,
            sweetness_level=pref_in.sweetness_level,
            budget_max=pref_in.budget_max,
            allergies=pref_in.allergies,
            favorite_flavors=pref_in.favorite_flavors
        )
        db.add(pref)
    
    db.commit()
    db.refresh(pref)
    return pref
