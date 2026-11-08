from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import MenuItem, Order, OrderItem, CustomerFeedback

SEED_MENU_ITEMS = [
    {
        "name": "Cappuccino",
        "description": "Rich espresso balanced with velvety steamed milk and a dense crown of micro-foam, dusted with artisan cocoa.",
        "category": "Coffee",
        "price": 220.0,
        "image_url": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy",
        "prep_time_minutes": 5,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Americano",
        "description": "Bold double shot of specialty Arabica espresso lengthened with filtered hot water for deep roasted aroma.",
        "category": "Coffee",
        "price": 180.0,
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegan, Gluten-Free",
        "allergens": "None",
        "prep_time_minutes": 4,
        "is_available": True,
        "is_popular": False,
    },
    {
        "name": "Cold Coffee",
        "description": "Classic slow-blended chilled brew with condensed milk, vanilla pods, and crushed ice.",
        "category": "Coffee",
        "price": 240.0,
        "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy",
        "prep_time_minutes": 6,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Iced Mocha",
        "description": "Espresso poured over artisanal dark chocolate ganache, cold milk, and topped with shaved chocolate.",
        "category": "Coffee",
        "price": 260.0,
        "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy",
        "prep_time_minutes": 6,
        "is_available": True,
        "is_popular": False,
    },
    {
        "name": "Matcha Latte",
        "description": "Ceremonial grade Uji Japanese matcha whisked with warm oat or dairy milk and a touch of agave nectar.",
        "category": "Tea & Beverages",
        "price": 280.0,
        "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian, Gluten-Free",
        "allergens": "Dairy (Oat option available)",
        "prep_time_minutes": 7,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Masala Chai",
        "description": "Handcrafted single-estate Assam black tea slow-simmered with crushed ginger, cardamom, cinnamon, and whole milk.",
        "category": "Tea & Beverages",
        "price": 120.0,
        "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian, Gluten-Free",
        "allergens": "Dairy",
        "prep_time_minutes": 5,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Paneer Sandwich",
        "description": "Spiced grilled cottage cheese marinated in mint-coriander pesto, layered with bell peppers in sourdough toast.",
        "category": "Food & Sandwiches",
        "price": 250.0,
        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy, Gluten",
        "prep_time_minutes": 10,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Avocado Toast",
        "description": "Hass avocado smashed with lime, Himalayan pink salt, microgreens, and chili flakes on toasted multigrain sourdough.",
        "category": "Food & Sandwiches",
        "price": 320.0,
        "image_url": "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegan",
        "allergens": "Gluten",
        "prep_time_minutes": 8,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Veg Burger",
        "description": "Crispy herb potato and quinoa patty with house-made smoked tomato relish, pickled onions, and crisp lettuce.",
        "category": "Food & Sandwiches",
        "price": 220.0,
        "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Gluten",
        "prep_time_minutes": 12,
        "is_available": True,
        "is_popular": False,
    },
    {
        "name": "Chocolate Brownie",
        "description": "Warm Belgian dark chocolate fudge brownie with a crackly crust and gooey molten centre.",
        "category": "Bakery & Desserts",
        "price": 180.0,
        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy, Gluten",
        "prep_time_minutes": 4,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Blueberry Cheesecake",
        "description": "New York style baked cream cheese over a buttery graham cracker crust, topped with wild blueberry compote.",
        "category": "Bakery & Desserts",
        "price": 290.0,
        "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy, Gluten",
        "prep_time_minutes": 5,
        "is_available": True,
        "is_popular": True,
    },
    {
        "name": "Croissant",
        "description": "Classic French golden flaky pastry laminated with pure butter, freshly baked every morning.",
        "category": "Bakery & Desserts",
        "price": 190.0,
        "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy, Gluten",
        "prep_time_minutes": 3,
        "is_available": True,
        "is_popular": False,
    },
    {
        "name": "Vegan Sandwich",
        "description": "Grilled Mediterranean vegetables, hummus, sun-dried tomatoes, and wild rocket on seeded rye bread.",
        "category": "Food & Sandwiches",
        "price": 260.0,
        "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegan, Dairy-Free",
        "allergens": "Gluten, Sesame",
        "prep_time_minutes": 9,
        "is_available": True,
        "is_popular": False,
    },
    {
        "name": "Iced Vanilla Latte",
        "description": "Smooth espresso and cold whole milk infused with natural Madagascar vanilla bean syrup over artisanal ice.",
        "category": "Coffee",
        "price": 270.0,
        "image_url": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian",
        "allergens": "Dairy",
        "prep_time_minutes": 6,
        "is_available": True,
        "is_popular": False,
    },
    {
        "name": "Filter Coffee",
        "description": "Traditional South Indian Kumbakonam degree filter coffee frothed to perfection in a brass davarah.",
        "category": "Coffee",
        "price": 140.0,
        "image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
        "dietary_tags": "Vegetarian, Gluten-Free",
        "allergens": "Dairy",
        "prep_time_minutes": 4,
        "is_available": True,
        "is_popular": True,
    }
]

def seed_database(db: Session):
    # Check if menu already seeded
    existing_count = db.query(MenuItem).count()
    if existing_count == 0:
        for item_data in SEED_MENU_ITEMS:
            menu_item = MenuItem(**item_data)
            db.add(menu_item)
        db.commit()
        print(f"[Seed] Successfully seeded {len(SEED_MENU_ITEMS)} menu items.")
    else:
        print(f"[Seed] Menu already populated with {existing_count} items.")

    # Check and seed sample initial orders if empty
    orders_count = db.query(Order).count()
    if orders_count == 0:
        cappuccino = db.query(MenuItem).filter(MenuItem.name == "Cappuccino").first()
        croissant = db.query(MenuItem).filter(MenuItem.name == "Croissant").first()
        paneer = db.query(MenuItem).filter(MenuItem.name == "Paneer Sandwich").first()
        filter_coffee = db.query(MenuItem).filter(MenuItem.name == "Filter Coffee").first()

        now = datetime.utcnow()

        # Order 1: preparing
        if cappuccino and croissant:
            o1 = Order(
                order_number="CM-1001",
                customer_name="Aarav Sharma",
                customer_phone="+91 98765 43210",
                status="preparing",
                total_amount=cappuccino.price + croissant.price,
                estimated_wait_minutes=8,
                special_instructions="Extra hot milk on cappuccino please",
                created_at=now - timedelta(minutes=7)
            )
            db.add(o1)
            db.flush()
            db.add(OrderItem(order_id=o1.id, menu_item_id=cappuccino.id, item_name=cappuccino.name, unit_price=cappuccino.price, quantity=1, item_total=cappuccino.price))
            db.add(OrderItem(order_id=o1.id, menu_item_id=croissant.id, item_name=croissant.name, unit_price=croissant.price, quantity=1, item_total=croissant.price))

        # Order 2: pending
        if paneer and filter_coffee:
            o2 = Order(
                order_number="CM-1002",
                customer_name="Priya Patel",
                customer_phone="+91 98220 11223",
                status="pending",
                total_amount=paneer.price + filter_coffee.price,
                estimated_wait_minutes=14,
                special_instructions="Sandwich cut into 4 quarters",
                created_at=now - timedelta(minutes=2)
            )
            db.add(o2)
            db.flush()
            db.add(OrderItem(order_id=o2.id, menu_item_id=paneer.id, item_name=paneer.name, unit_price=paneer.price, quantity=1, item_total=paneer.price))
            db.add(OrderItem(order_id=o2.id, menu_item_id=filter_coffee.id, item_name=filter_coffee.name, unit_price=filter_coffee.price, quantity=1, item_total=filter_coffee.price))

        # Order 3: ready
        if cappuccino:
            o3 = Order(
                order_number="CM-1000",
                customer_name="Rohan Mehta",
                customer_phone="+91 99112 33445",
                status="ready",
                total_amount=cappuccino.price,
                estimated_wait_minutes=0,
                special_instructions="Takeaway cup",
                created_at=now - timedelta(minutes=15)
            )
            db.add(o3)
            db.flush()
            db.add(OrderItem(order_id=o3.id, menu_item_id=cappuccino.id, item_name=cappuccino.name, unit_price=cappuccino.price, quantity=1, item_total=cappuccino.price))

        db.commit()
        print("[Seed] Successfully seeded sample active orders.")

    # Check and seed sample feedback if empty
    feedback_count = db.query(CustomerFeedback).count()
    if feedback_count == 0:
        samples = [
            ("Ananya Verma", 5, "The Masala Chai and Paneer Sandwich were exquisite! Cozy atmosphere and quick service.", "positive", 0.95),
            ("Devraj Mukherjee", 5, "Best Filter Coffee in town, authentic degree brew froth. The blueberry cheesecake was fresh.", "positive", 0.92),
            ("Sneha Rao", 4, "Loved the matcha latte with oat milk. Avocado toast was slightly crispier than expected but great flavors.", "positive", 0.78),
            ("Vikram Malhotra", 2, "Took almost 20 minutes for our burger during Sunday rush hour. Food tasted decent though.", "negative", 0.25),
            ("Ishaan Joshi", 4, "Very calm place to work, cappuccino was strong and aromatic. Good Wi-Fi too.", "positive", 0.85)
        ]
        for name, rating, comment, sentiment, score in samples:
            fb = CustomerFeedback(
                customer_name=name,
                rating=rating,
                comment=comment,
                sentiment=sentiment,
                sentiment_score=score,
                created_at=datetime.utcnow() - timedelta(hours=1)
            )
            db.add(fb)
        db.commit()
        print("[Seed] Successfully seeded customer feedback.")
