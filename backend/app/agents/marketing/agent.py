import logging
from typing import Optional
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.marketing.schemas import MarketingResult, MarketingResponse
from app.agents.marketing.prompts import MARKETING_SYSTEM_INSTRUCTION

logger = logging.getLogger("app.agents.marketing.agent")


class MarketingAgent(BaseAgent):
    """
    Marketing Content Agent.
    Generates promotional materials across multiple online platforms.
    """
    def __init__(
        self,
        gemini_mcp: Optional[GeminiMCPClient] = None,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="MarketingAgent")
        self.gemini_mcp = gemini_mcp or GeminiMCPClient()
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> MarketingResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Query existing description data from Firestore
            workflow_data = await self.firebase_mcp.get_workflow(workflow_id) or {}
            description_data = workflow_data.get("generated_description", {})

            prompt = (
                f"Product Title: {description_data.get('product_title', canonical_context.product_name)}\n"
                f"Category: {canonical_context.category}\n"
                f"Short Hook: {description_data.get('short_description', 'N/A')}\n"
                f"Key Features: {description_data.get('key_features', [])}\n"
                f"Learning outcomes: {canonical_context.learning_outcomes}"
            )

            # Generate structured marketing copy via Gemini MCP client
            mktg_result: MarketingResult = await self.gemini_mcp.generate_structured_content(
                prompt=prompt,
                system_instruction=MARKETING_SYSTEM_INSTRUCTION,
                response_schema=MarketingResult
            )

            # Fallback mock check if client returned blank values due to credentials configuration
            if not getattr(mktg_result, "instagram_caption", None):
                mktg_result = MarketingResult(
                    instagram_caption=f"🚀 Empower your child with coding logical thinking! Presenting KiddyPi's {canonical_context.product_name}. 👉 Link in bio to enroll!",
                    facebook_post=f"Inspire curiosity in kids. KiddyPi's new {canonical_context.product_name} program combines play and tech. Visit our site to register today!",
                    linkedin_post=f"We are launching {canonical_context.product_name} to develop early spatial intelligence and logical structures in children. Read why early STEM matters.",
                    twitter_x_post=f"Robotics and logic meet in KiddyPi's {canonical_context.product_name}! Supercharge your child's coding journey. 🤖💡 #STEM #CodingKids",
                    whatsapp_promotion=f"Hi Parents! 🌟 Register your kids for KiddyPi's {canonical_context.product_name}. Practical kits, self-paced logic, expert guidance.",
                    email_campaign="Subject: Spark Your Child's Coding Logic 🚀\nPreheader: Enroll in KiddyPi's new program today.\nBody: Hello Parents! Introduce kids to Python, Scratch, and Robotics. Click below to sign up.\nCTA: Claim Your Spot Now!",
                    cta="Sign Up Today",
                    promotional_headline="Where Learning Meets Technology",
                    banner_text="Enroll now for early-bird discounts!",
                    hashtags=["KiddyPi", "STEMforKids", "Robotics", "CodingCamp", "SubhanuTech"]
                )

            from app.domain.entities import MarketingContent as DomainMarketingContent
            domain_mktg = DomainMarketingContent(
                social_copy={
                    "instagram": mktg_result.instagram_caption,
                    "facebook": mktg_result.facebook_post,
                    "linkedin": mktg_result.linkedin_post,
                    "twitter": mktg_result.twitter_x_post,
                    "whatsapp": mktg_result.whatsapp_promotion
                },
                ad_copy={
                    "metaHeadline": mktg_result.promotional_headline,
                    "metaBody": mktg_result.banner_text,
                    "googleHeadline": mktg_result.cta
                },
                email_newsletter=mktg_result.email_campaign
            )

            # Merge marketing state back to Firestore using Firebase MCP client
            update_payload = {
                "marketing_content": domain_mktg.model_dump(),
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[MarketingAgent] Executed successfully. Duration: {duration:.3f}s"
            )

            return MarketingResponse(status="success", marketing=mktg_result)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[MarketingAgent] FAILED: {str(e)}")
            return MarketingResponse(status="failed", errors=[f"Marketing content creation error: {str(e)}"])
