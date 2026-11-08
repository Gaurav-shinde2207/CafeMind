import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal, check_database_health
from app.routes.health import get_health_status
from app.routes.menu import get_menu
from app.routes.gemini import chat_with_gemini, get_feedback_analysis, get_operational_insights_summary
from app.routes.orders import create_confirmed_order, update_order_status, get_orders
from app.routes.feedback import submit_feedback
from app.routes.stats import get_cafe_statistics
from app.schemas import (
    GeminiChatRequest,
    OrderCreate,
    OrderItemCreate,
    OrderStatusUpdate,
    CustomerFeedbackCreate
)

def run_all_tests():
    db = SessionLocal()
    try:
        print("========================================")
        print(" CAFEMIND BACKEND VALIDATION TEST SUITE ")
        print("========================================")

        # 1. Health check
        print("\n[1] Health Check & Database Connectivity:")
        health = get_health_status()
        print(f"  Status: {health['status']}")
        print(f"  Database Engine: {health['database']['engine']}")
        print(f"  Database Type: {health['database']['database_type']}")
        print(f"  Gemini Mode: {health['gemini']['mode']}")
        assert health["status"] == "healthy"
        assert health["database"]["status"] == "connected"

        # 2. Menu retrieval
        print("\n[2] Menu Seed & Retrieval Check:")
        menu = get_menu(category="All", dietary="All", search=None, available_only=True, db=db)
        print(f"  Total Active Items Seeded: {len(menu)}")
        assert len(menu) >= 15
        for item in menu[:3]:
            print(f"   * [{item.id}] {item.name} - INR {item.price} | {item.category} | {item.dietary_tags}")

        # 3. Gemini / AI Chat & Recommendation logic
        print("\n[3] AI Conversational Ordering & Recommendations:")
        chat_req = GeminiChatRequest(
            message="Hi! I want a cold coffee and a fresh sandwich for lunch",
            conversation_history=[]
        )
        ai_resp = chat_with_gemini(chat_req, db=db)
        print(f"  AI Reply: {ai_resp['reply']}")
        print(f"  Recommended Item IDs: {ai_resp['recommended_item_ids']}")
        print(f"  Draft Order Detected: {ai_resp['draft_order']}")
        print(f"  Is Mock Engine: {ai_resp['is_mock']}")
        assert len(ai_resp["recommended_item_ids"]) > 0

        # 4. Confirmed Order Creation
        print("\n[4] Confirmed Order Creation (Server Validation):")
        first_item = menu[0]
        second_item = menu[1]
        order_req = OrderCreate(
            customer_name="Aarav Verma",
            customer_phone="+91 98765 12345",
            confirmed=True,
            items=[
                OrderItemCreate(menu_item_id=first_item.id, quantity=2, customization="Less sweet"),
                OrderItemCreate(menu_item_id=second_item.id, quantity=1, customization=None)
            ],
            special_instructions="Corner table by window"
        )
        created_order = create_confirmed_order(order_req, db=db)
        print(f"  Created Order Number: {created_order.order_number}")
        print(f"  Customer: {created_order.customer_name}")
        print(f"  Calculated Total: INR {created_order.total_amount}")
        print(f"  Estimated Wait Time: {created_order.estimated_wait_minutes} mins")
        print(f"  Status: {created_order.status}")
        assert created_order.total_amount == round((first_item.price * 2) + second_item.price, 2)
        assert created_order.status == "pending"

        # 5. Order Status Update (Staff action)
        print("\n[5] Staff Order Workflow (Status Updates):")
        status_update = OrderStatusUpdate(status="preparing")
        updated = update_order_status(created_order.id, status_update, db=db)
        print(f"  Updated Order {updated.order_number} -> {updated.status}")
        assert updated.status == "preparing"

        status_update_ready = OrderStatusUpdate(status="ready")
        updated_ready = update_order_status(created_order.id, status_update_ready, db=db)
        print(f"  Updated Order {updated_ready.order_number} -> {updated_ready.status} (Wait: {updated_ready.estimated_wait_minutes} mins)")
        assert updated_ready.status == "ready"
        assert updated_ready.estimated_wait_minutes == 0

        # 6. Café Statistics & Wait Times
        print("\n[6] Live Café Statistics & Queue Metrics:")
        stats = get_cafe_statistics(db=db)
        print(f"  Active Orders in Queue: {stats['active_orders_count']}")
        print(f"  Average Wait Time: {stats['average_wait_minutes']} mins")
        print(f"  Top Selling Items: {[p['name'] for p in stats['popular_items']]}")
        assert stats["total_orders"] >= 1

        # 7. Customer Feedback & Gemini Insights
        print("\n[7] Customer Feedback & Gemini Operational Insights:")
        fb_in = CustomerFeedbackCreate(
            customer_name="Pooja Sharma",
            rating=5,
            comment="The Cold Coffee and Avocado Toast were amazing! Outstanding service."
        )
        fb_created = submit_feedback(fb_in, db=db)
        print(f"  Feedback Persisted: {fb_created.customer_name} ({fb_created.rating}/5) Sentiment: {fb_created.sentiment}")

        fb_summary = get_feedback_analysis(db=db)
        print(f"  Total Reviews Analyzed: {fb_summary['total_reviews']}")
        print(f"  Average Customer Rating: {fb_summary['average_rating']} / 5")
        print(f"  Key Themes: {fb_summary['key_themes']}")

        op_insights = get_operational_insights_summary(db=db)
        print(f"  Operational Bottleneck: {op_insights['bottleneck_analysis']}")
        print(f"  Gemini Staff Actions: {op_insights['gemini_recommendations']}")

        print("\n=======================================================")
        print(" ALL 7 BACKEND & AI MODULE CHECKS PASSED FLAWLESSLY!   ")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_all_tests()
