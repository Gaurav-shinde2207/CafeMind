from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

# --- Menu Item Schemas ---
class MenuItemBase(BaseModel):
    name: str
    description: str
    category: str
    price: float = Field(..., gt=0, description="Price in INR")
    image_url: Optional[str] = None
    dietary_tags: str = "Vegetarian"
    allergens: str = "None"
    prep_time_minutes: int = Field(default=7, gt=0)
    is_available: bool = True
    is_popular: bool = False

class MenuItemResponse(MenuItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Order Item Schemas ---
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(default=1, gt=0)
    customization: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    item_name: str
    unit_price: float
    quantity: int
    item_total: float
    customization: Optional[str] = None

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: Optional[str] = None
    items: List[OrderItemCreate] = Field(..., min_length=1)
    special_instructions: Optional[str] = None
    dietary_notes: Optional[str] = None
    confirmed: bool = Field(..., description="Customer must explicitly confirm the order")

    @field_validator("confirmed")
    def must_be_confirmed(cls, v):
        if not v:
            raise ValueError("Customer confirmation is required to commit the order.")
        return v

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="pending, preparing, ready, completed, cancelled")

    @field_validator("status")
    def validate_status(cls, v):
        valid = {"pending", "preparing", "ready", "completed", "cancelled"}
        if v.lower() not in valid:
            raise ValueError(f"Invalid status. Must be one of {valid}")
        return v.lower()

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: Optional[str] = None
    status: str
    total_amount: float
    estimated_wait_minutes: int
    special_instructions: Optional[str] = None
    dietary_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

# --- Taste Preferences Schemas ---
class TastePreferenceBase(BaseModel):
    dietary: str = "All"
    coffee_preference: str = "Mild & creamy"
    sweetness_level: str = "Normal"
    budget_max: Optional[float] = None
    allergies: str = "None"
    favorite_flavors: Optional[str] = None

class TastePreferenceCreate(TastePreferenceBase):
    customer_id: str

class TastePreferenceResponse(TastePreferenceBase):
    id: int
    customer_id: str
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Feedback Schemas ---
class CustomerFeedbackCreate(BaseModel):
    customer_name: str
    order_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=2)

class CustomerFeedbackResponse(BaseModel):
    id: int
    order_id: Optional[int] = None
    customer_name: str
    rating: int
    comment: str
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Gemini Structured Schemas ---
class ExtractedPreferences(BaseModel):
    dietary: Optional[str] = None
    budget_max: Optional[float] = None
    flavor_preference: Optional[str] = None
    allergens: Optional[str] = None

class OrderDraftItem(BaseModel):
    menu_item_id: int
    item_name: str
    quantity: int = 1
    customization: Optional[str] = None

class GeminiChatRequest(BaseModel):
    message: str
    conversation_history: List[dict] = []
    user_preferences: Optional[TastePreferenceBase] = None

class GeminiChatResponse(BaseModel):
    reply: str
    recommended_item_ids: List[int] = []
    extracted_preferences: Optional[ExtractedPreferences] = None
    draft_order: Optional[List[OrderDraftItem]] = None
    is_mock: bool = False

class FeedbackAnalysisSummary(BaseModel):
    total_reviews: int
    average_rating: float
    positive_count: int
    neutral_count: int
    negative_count: int
    sentiment_breakdown: str
    key_themes: List[str]
    suggested_actions: List[str]
    is_mock: bool = False

class OperationalInsightsSummary(BaseModel):
    active_queue_count: int
    average_wait_minutes: int
    top_selling_items: List[str]
    bottleneck_analysis: str
    gemini_recommendations: List[str]
    is_mock: bool = False
