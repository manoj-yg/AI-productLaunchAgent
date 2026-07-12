import logging
from typing import Optional, List
from app.agents.base.agent import BaseAgent
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.recommendation.schemas import RecommendationResponse
from app.domain.entities import ProductRecommendation

logger = logging.getLogger("app.agents.recommendation.agent")

# Static seed list of 20 KiddyPi sample products
SEED_PRODUCTS = [
    # Programming
    {"product_id": "seed-prog-1", "title": "KiddyPi Python Programming Masterclass", "category": "Programming", "price": 49.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80"},
    {"product_id": "seed-prog-2", "title": "KiddyPi Scratch Game Design Studio", "category": "Programming", "price": 29.99, "age_group": "5-7 years", "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80"},
    {"product_id": "seed-prog-3", "title": "KiddyPi Web Programming for Beginners", "category": "Programming", "price": 59.99, "age_group": "10-14 years", "image_url": "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80"},
    {"product_id": "seed-prog-4", "title": "KiddyPi Game Development with Unity", "category": "Programming", "price": 89.99, "age_group": "13-17 years", "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80"},
    {"product_id": "seed-prog-5", "title": "KiddyPi AI & Machine Learning Basics", "category": "Programming", "price": 79.99, "age_group": "10-14 years", "image_url": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=400&q=80"},
    {"product_id": "seed-prog-6", "title": "KiddyPi Javascript Interactive Animations", "category": "Programming", "price": 45.00, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&q=80"},
    {"product_id": "seed-prog-7", "title": "KiddyPi Mobile App Explorer", "category": "Programming", "price": 49.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80"},
    {"product_id": "seed-prog-8", "title": "KiddyPi Cyber Security Kids Kit", "category": "Programming", "price": 39.99, "age_group": "10-14 years", "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80"},
    {"product_id": "seed-prog-9", "title": "KiddyPi SQL Database Adventures", "category": "Programming", "price": 34.99, "age_group": "13-17 years", "image_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80"},
    {"product_id": "seed-prog-10", "title": "KiddyPi Algorithms & Logic Workshop", "category": "Programming", "price": 29.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&q=80"},
    # Electronics
    {"product_id": "seed-elec-1", "title": "KiddyPi Arduino Starter Robotics Kit", "category": "Electronics", "price": 89.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80"},
    {"product_id": "seed-elec-2", "title": "KiddyPi Raspberry Pi Smart Home Creator", "category": "Electronics", "price": 129.99, "age_group": "13-17 years", "image_url": "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=400&q=80"},
    {"product_id": "seed-elec-3", "title": "KiddyPi Micro:bit Coding Board", "category": "Electronics", "price": 39.99, "age_group": "5-7 years", "image_url": "https://images.unsplash.com/photo-1608564697071-ddf911d837e5?w=400&q=80"},
    {"product_id": "seed-elec-4", "title": "KiddyPi Smart Sensors Electronics Explorer", "category": "Electronics", "price": 49.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&q=80"},
    {"product_id": "seed-elec-5", "title": "KiddyPi Breadboard & Circuits Lab", "category": "Electronics", "price": 34.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&q=80"},
    {"product_id": "seed-elec-6", "title": "KiddyPi Solar Powered Robots", "category": "Electronics", "price": 59.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=400&q=80"},
    {"product_id": "seed-elec-7", "title": "KiddyPi Internet of Things (IoT) Kit", "category": "Electronics", "price": 99.99, "age_group": "13-17 years", "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80"},
    {"product_id": "seed-elec-8", "title": "KiddyPi Digital Logic Gates Board", "category": "Electronics", "price": 44.99, "age_group": "10-14 years", "image_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80"},
    {"product_id": "seed-elec-9", "title": "KiddyPi Wearable E-Textiles Kit", "category": "Electronics", "price": 54.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&q=80"},
    {"product_id": "seed-elec-10", "title": "KiddyPi RC Car Mech Kit", "category": "Electronics", "price": 79.99, "age_group": "8-12 years", "image_url": "https://images.unsplash.com/photo-1531693251400-38df35776dc7?w=400&q=80"}
]


class RecommendationAgent(BaseAgent):
    """
    Recommendation Agent.
    Recommends KiddyPi products matching category rules:
    Programming Courses -> Recommend Python, Scratch, Web, Game Dev
    Electronics Courses -> Recommend Arduino, Raspberry Pi, Micro:bit, Sensors Kit
    """
    def __init__(
        self,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="RecommendationAgent")
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> RecommendationResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Map search tag category
            cat_name = canonical_context.category.lower()
            target_category = "Programming"
            if "elect" in cat_name or "robotic" in cat_name or "arduino" in cat_name or "pi" in cat_name or "stem" in cat_name:
                target_category = "Electronics"

            recommended = []

            # Attempt to query from Firestore sample_products collection
            db = self.firebase_mcp.db
            if db:
                try:
                    docs = db.collection("sample_products").where("category", "==", target_category).limit(4).stream()
                    for doc in docs:
                        d = doc.to_dict()
                        recommended.append(
                            ProductRecommendation(
                                product_id=d.get("product_id", doc.id),
                                title=d.get("title", ""),
                                category=d.get("category", ""),
                                price=d.get("price", 0.0),
                                age_group=d.get("age_group", ""),
                                image_url=d.get("image_url", "")
                            )
                        )
                except Exception as db_err:
                    logger.warning(f"Error querying sample_products from firestore, using local fallback: {db_err}")

            # Fallback to local filtering if firestore query yielded nothing
            if not recommended:
                filtered = [p for p in SEED_PRODUCTS if p["category"] == target_category]
                # Slice first 4
                for p in filtered[:4]:
                    recommended.append(ProductRecommendation(**p))

            # Merge recommendations back to products Firestore document
            update_payload = {
                "recommendations": [r.model_dump() for r in recommended],
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[RecommendationAgent] Selected {len(recommended)} KiddyPi related products under category '{target_category}'. Duration: {duration:.3f}s"
            )

            return RecommendationResponse(status="success", recommendations=recommended)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[RecommendationAgent] FAILED: {str(e)}")
            return RecommendationResponse(status="failed", errors=[f"Recommendations error: {str(e)}"])
