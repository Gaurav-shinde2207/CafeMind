import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("cafemind.gemini")

def get_gemini_client():
    """Initializes Google GenAI client if API key is present."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Failed to initialize google-genai client: {e}")
        return None

def generate_chat_recommendations(
    user_message: str,
    conversation_history: List[Dict[str, str]],
    available_menu_items: List[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Conversational ordering and personalized recommendations using Gemini.
    Strictly recommends ONLY items existing in available_menu_items.
    """
    client = get_gemini_client()

    menu_summary = [
        {
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "price": item["price"],
            "dietary": item["dietary_tags"],
            "allergens": item["allergens"],
            "prep_time": item["prep_time_minutes"],
            "description": item["description"]
        }
        for item in available_menu_items
    ]

    valid_ids = {item["id"] for item in available_menu_items}

    # If Gemini is configured and client initialized, call genuine Gemini API
    if client:
        try:
            from google.genai import types

            system_instruction = (
                "You are 'CafeMind AI', an intelligent, warm, and highly courteous café concierge for a modern artisanal Indian café.\n"
                "Your role is to understand customer preferences (dietary restrictions, cravings, budget in INR, flavor profile) and assist them in discovering or ordering food and drinks.\n"
                "CRITICAL RULES:\n"
                "1. You MUST recommend ONLY items that exist in the provided MENU ITEMS database below. Never hallucinate dishes not in this list.\n"
                "2. When suggesting dishes or drinks, you MUST return their numeric menu IDs in the 'recommended_item_ids' field.\n"
                "3. If the user expresses an intent to order specific items (e.g., 'I want a cappuccino and brownie' or 'give me 2 masala chais'), "
                "populate the 'draft_order' list with valid 'menu_item_id', 'item_name', and 'quantity'.\n"
                "4. Note that you NEVER commit orders to the database yourself; the customer must review and explicitly confirm the draft order.\n"
                "5. Always respond in valid JSON matching the exact schema:\n"
                "{\n"
                '  "reply": "string (warm, conversational café assistant response)",\n'
                '  "recommended_item_ids": [integer IDs from the menu],\n'
                '  "extracted_preferences": {"dietary": "string or null", "budget_max": float or null, "flavor_preference": "string or null", "allergens": "string or null"},\n'
                '  "draft_order": [{"menu_item_id": int, "item_name": "string", "quantity": int, "customization": "string or null"}] or null\n'
                "}\n\n"
                f"AVAILABLE MENU ITEMS (DATABASE):\n{json.dumps(menu_summary, indent=2)}\n"
            )

            prompt = f"User Preferences: {json.dumps(user_preferences or {})}\n"
            prompt += f"Recent History: {json.dumps(conversation_history[-4:] if conversation_history else [])}\n"
            prompt += f"Customer: {user_message}\n"

            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )

            raw_text = response.text or "{}"
            parsed = json.loads(raw_text)

            # Strict backend validation of recommended item IDs
            rec_ids = [i for i in parsed.get("recommended_item_ids", []) if isinstance(i, int) and i in valid_ids]
            
            # Strict backend validation of draft order items
            draft_order = None
            if parsed.get("draft_order") and isinstance(parsed["draft_order"], list):
                valid_draft = []
                for draft_item in parsed["draft_order"]:
                    m_id = draft_item.get("menu_item_id")
                    if m_id in valid_ids:
                        matching_item = next(m for m in available_menu_items if m["id"] == m_id)
                        valid_draft.append({
                            "menu_item_id": m_id,
                            "item_name": matching_item["name"],
                            "quantity": max(1, int(draft_item.get("quantity", 1))),
                            "customization": draft_item.get("customization")
                        })
                if valid_draft:
                    draft_order = valid_draft

            return {
                "reply": parsed.get("reply", "Here are delicious recommendations tailored for you!"),
                "recommended_item_ids": rec_ids,
                "extracted_preferences": parsed.get("extracted_preferences"),
                "draft_order": draft_order,
                "is_mock": False
            }

        except Exception as e:
            logger.error(f"Gemini API execution error: {e}. Falling back to intelligent mock engine.")

    # Intelligent Mock Fallback Engine (Runs when GEMINI_API_KEY is not set or network fails)
    lower_msg = user_message.lower()
    rec_ids = []
    reply = ""
    draft_order = None
    extracted = {"dietary": None, "budget_max": None, "flavor_preference": None, "allergens": None}

    # Detect diet
    if "vegan" in lower_msg:
        extracted["dietary"] = "Vegan"
        rec_ids = [m["id"] for m in available_menu_items if "vegan" in m["dietary_tags"].lower()][:3]
        reply = "I've picked out our signature vegan creations for you, like the fresh Avocado Toast and Mediterranean Vegan Sandwich."
    elif "cold" in lower_msg or "iced" in lower_msg or "summer" in lower_msg:
        extracted["flavor_preference"] = "Chilled / Iced"
        rec_ids = [m["id"] for m in available_menu_items if "cold" in m["name"].lower() or "iced" in m["name"].lower()][:3]
        reply = "Here are our most refreshing cold brews and iced lattes to beat the heat!"
    elif "chai" in lower_msg or "tea" in lower_msg:
        extracted["flavor_preference"] = "Spiced Tea"
        rec_ids = [m["id"] for m in available_menu_items if m["category"] == "Tea & Beverages"][:2]
        reply = "Our slow-simmered Masala Chai and ceremonial Matcha Latte are made with authentic single-estate teas."
    elif "sweet" in lower_msg or "dessert" in lower_msg or "cake" in lower_msg or "brownie" in lower_msg:
        extracted["flavor_preference"] = "Sweet / Bakery"
        rec_ids = [m["id"] for m in available_menu_items if m["category"] == "Bakery & Desserts"][:3]
        reply = "You will love our warm Belgian Chocolate Brownie and artisanal Blueberry Cheesecake."
    elif "snack" in lower_msg or "hungry" in lower_msg or "sandwich" in lower_msg or "food" in lower_msg:
        extracted["flavor_preference"] = "Savory"
        rec_ids = [m["id"] for m in available_menu_items if m["category"] == "Food & Sandwiches"][:3]
        reply = "For something savory and satisfying, try our Paneer Sourdough Sandwich or fresh Avocado Toast."
    else:
        # Default popular recommendations
        popular = [m["id"] for m in available_menu_items if m.get("is_popular")]
        rec_ids = popular[:3] if popular else [m["id"] for m in available_menu_items[:3]]
        reply = "Welcome to CafeMind! Here are our handcrafted guest favorites today. How can I customize your cup or plate?"

    # Check order intent in mock mode
    matched_draft = []
    for item in available_menu_items:
        if item["name"].lower() in lower_msg:
            matched_draft.append({
                "menu_item_id": item["id"],
                "item_name": item["name"],
                "quantity": 1,
                "customization": None
            })
    if matched_draft:
        draft_order = matched_draft
        reply += f" I noticed you'd like to order {', '.join(i['item_name'] for i in matched_draft)}. Please review and confirm your order."

    return {
        "reply": reply,
        "recommended_item_ids": rec_ids,
        "extracted_preferences": extracted,
        "draft_order": draft_order,
        "is_mock": True
    }

def analyze_customer_feedback(feedbacks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Summarize feedback sentiments, themes, and staff recommendations using Gemini.
    """
    if not feedbacks:
        return {
            "total_reviews": 0,
            "average_rating": 0.0,
            "positive_count": 0,
            "neutral_count": 0,
            "negative_count": 0,
            "sentiment_breakdown": "No feedback recorded yet.",
            "key_themes": ["Awaiting initial reviews"],
            "suggested_actions": ["Promote QR code feedback on tables."],
            "is_mock": False
        }

    total = len(feedbacks)
    avg_rating = round(sum(f["rating"] for f in feedbacks) / total, 2)
    pos = sum(1 for f in feedbacks if f["rating"] >= 4)
    neu = sum(1 for f in feedbacks if f["rating"] == 3)
    neg = sum(1 for f in feedbacks if f["rating"] <= 2)

    client = get_gemini_client()
    if client:
        try:
            from google.genai import types
            reviews_text = "\n".join([f"- Rating: {f['rating']}/5 | Comment: {f['comment']}" for f in feedbacks])
            system_prompt = (
                "You are an expert hospitality operations analyst. Analyze these café customer reviews and return a JSON object with:\n"
                '{"sentiment_breakdown": "concise 2-sentence summary", "key_themes": ["theme 1", "theme 2", "theme 3"], "suggested_actions": ["action 1", "action 2"]}'
            )
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=f"Customer Reviews:\n{reviews_text}",
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            data = json.loads(response.text or "{}")
            return {
                "total_reviews": total,
                "average_rating": avg_rating,
                "positive_count": pos,
                "neutral_count": neu,
                "negative_count": neg,
                "sentiment_breakdown": data.get("sentiment_breakdown", f"{pos} out of {total} reviews are positive."),
                "key_themes": data.get("key_themes", ["Coffee quality praised", "Beverage variety"]),
                "suggested_actions": data.get("suggested_actions", ["Maintain espresso calibration", "Monitor peak prep times"]),
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Gemini feedback analysis error: {e}")

    # Fallback mock analysis
    return {
        "total_reviews": total,
        "average_rating": avg_rating,
        "positive_count": pos,
        "neutral_count": neu,
        "negative_count": neg,
        "sentiment_breakdown": f"Strong customer satisfaction with {pos}/{total} positive sentiment rating.",
        "key_themes": ["Authentic Filter Coffee & Masala Chai highly rated", "Artisanal bakery freshness praised", "Sunday peak wait time flagged"],
        "suggested_actions": [
            "Maintain high-quality bean sourcing for espresso beverages",
            "Pre-prep sandwich stations prior to rush hours to lower ticket wait times",
            "Consider introducing seasonal vegan baked pastries"
        ],
        "is_mock": True
    }

def generate_operational_insights(stats: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate proactive managerial recommendations based on live queue and order stats.
    """
    client = get_gemini_client()
    if client:
        try:
            from google.genai import types
            system_prompt = (
                "You are an AI Café Operations Manager. Based on the real-time café metrics provided, "
                "return JSON with 'bottleneck_analysis' (string) and 'gemini_recommendations' (list of strings)."
            )
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=f"Café Live Metrics: {json.dumps(stats)}",
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            data = json.loads(response.text or "{}")
            return {
                "active_queue_count": stats.get("active_orders_count", 0),
                "average_wait_minutes": stats.get("average_wait_minutes", 10),
                "top_selling_items": stats.get("top_selling_items", []),
                "bottleneck_analysis": data.get("bottleneck_analysis", "Queue flow is optimal with stable ticket pacing."),
                "gemini_recommendations": data.get("gemini_recommendations", ["Keep hot beverage station supplied", "Review upcoming prep tickets"]),
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Gemini operational insights error: {e}")

    # Fallback
    wait = stats.get("average_wait_minutes", 8)
    queue = stats.get("active_orders_count", 0)
    bottleneck = "Station throughput is healthy." if wait <= 10 else f"Peak queue load ({queue} orders) may delay kitchen items."
    return {
        "active_queue_count": queue,
        "average_wait_minutes": wait,
        "top_selling_items": stats.get("top_selling_items", ["Cappuccino", "Masala Chai", "Paneer Sandwich"]),
        "bottleneck_analysis": bottleneck,
        "gemini_recommendations": [
            f"Current estimated wait time is {wait} mins. Queue has {queue} pending/preparing orders.",
            "Cappuccino and Paneer Sandwich are driving volume; keep grill and espresso machine prepped.",
            "Notify front-of-house to proactively update customers as orders shift to 'Ready'."
        ],
        "is_mock": True
    }
