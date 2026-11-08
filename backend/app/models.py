from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # Coffee, Tea & Beverages, Food, Desserts
    price = Column(Float, nullable=False)  # in INR
    image_url = Column(String(255), nullable=True)
    dietary_tags = Column(String(200), default="Vegetarian")  # Comma-separated: Vegan, Gluten-Free, Vegetarian, Dairy-Free
    allergens = Column(String(200), default="None")
    prep_time_minutes = Column(Integer, default=7)
    is_available = Column(Boolean, default=True)
    is_popular = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order_items = relationship("OrderItem", back_populates="menu_item")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=True)
    status = Column(String(30), default="pending", index=True)  # pending, preparing, ready, completed, cancelled
    total_amount = Column(Float, nullable=False)
    estimated_wait_minutes = Column(Integer, default=10)
    special_instructions = Column(Text, nullable=True)
    dietary_notes = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    feedbacks = relationship("CustomerFeedback", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    item_name = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    item_total = Column(Float, nullable=False)
    customization = Column(String(200), nullable=True)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")

class CustomerFeedback(Base):
    __tablename__ = "customer_feedback"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=False)
    sentiment = Column(String(30), nullable=True)  # positive, neutral, negative
    sentiment_score = Column(Float, nullable=True)  # 0.0 to 1.0
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="feedbacks")

class TastePreference(Base):
    __tablename__ = "taste_preferences"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(100), unique=True, index=True, nullable=False)
    dietary = Column(String(100), default="All")  # Vegetarian, Vegan, Gluten-Free, All
    coffee_preference = Column(String(100), default="Mild & creamy")
    sweetness_level = Column(String(50), default="Normal")
    budget_max = Column(Float, nullable=True)
    allergies = Column(String(200), default="None")
    favorite_flavors = Column(String(200), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
