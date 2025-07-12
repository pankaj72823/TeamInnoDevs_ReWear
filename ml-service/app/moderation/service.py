import os
import asyncio
from typing import Optional
from enum import Enum
from dataclasses import dataclass
from PIL import Image
import io
import logging
import google.generativeai as genai

# Import the centralized API key from your config file
from app.core.config import GEMINI_API_KEY

# --- Basic Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure and initialize the Gemini model using the key from config
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash') # Using a more recent model name


# --- Business Logic Data Models ---
# These define the objects your service works with.
class ItemCondition(str, Enum):
    NEW = "New"
    LIKE_NEW = "Like New"
    USED = "Used"
    OLD = "Old"

class ItemType(str, Enum):
    SHIRT = "Shirt"
    SAREE = "Saree"
    JACKET = "Jacket"
    KURTA = "Kurta"
    DRESS = "Dress"
    PANTS = "Pants"
    SKIRT = "Skirt"
    BLOUSE = "Blouse"
    OTHER = "Other"

class ModerationDecision(str, Enum):
    APPROVED = "APPROVED"
    FLAGGED = "FLAGGED"

@dataclass
class ItemListing:
    user_id: str
    title: str
    type: str
    size: str
    condition: str
    material: Optional[str] = None
    brand: Optional[str] = None
    tags: Optional[str] = None
    description: Optional[str] = None
    image_data: Optional[bytes] = None
    image_filename: Optional[str] = None

@dataclass
class ModerationResult:
    decision: ModerationDecision
    reason: Optional[str] = None
    confidence_score: Optional[float] = None
    raw_response: Optional[str] = None


# --- The Service Class ---
# This class contains all the "thinking" logic.
class ModerationService:
    """Service class for handling moderation logic"""
    
    def __init__(self):
        self.model = model
    
    def _create_moderation_prompt(self, item: ItemListing) -> str:
        """Create a comprehensive moderation prompt for Gemini"""
        # ... (This method is exactly the same as in your script)
        prompt = f"""
SYSTEM INSTRUCTION: 
You are a quality control assistant for a sustainable fashion swapping platform. Your job is to review item listings and decide if they are appropriate for approval. 

EVALUATION CRITERIA:
1. IMAGE QUALITY: Is the image clear, well-lit, and shows the actual item?
2. CONTENT APPROPRIATENESS: No inappropriate, offensive, or irrelevant content
3. ACCURACY: Does the description match what's shown in the image?
4. CONDITION CONSISTENCY: Does the stated condition match the visual appearance?
5. COMPLETENESS: Is the listing informative and helpful for potential swappers?

ITEM DETAILS:
- Title: {item.title}
- Type: {item.type}
- Size: {item.size}
- Condition: {item.condition}
- Material: {item.material or 'Not specified'}
- Brand: {item.brand or 'Not specified'}
- Tags: {item.tags or 'None'}
- Description: {item.description or 'No description provided'}

RESPONSE FORMAT:
Please respond with EXACTLY one of the following:
- "APPROVED" (if the listing meets all quality standards)
- "FLAGGED: [specific reason]" (if there are issues)

COMMON FLAG REASONS:
- Image is blurry, dark, or unclear
- Image shows inappropriate content
- Title/description doesn't match the image
- Condition rating seems inaccurate based on visible wear
- Spam or abusive language detected
- Image shows damaged items not disclosed in condition
- Multiple unrelated items in single listing
- Image appears to be stock photo or not actual item

Please analyze the attached image along with the provided details and make your decision.
"""
        return prompt
    
    async def moderate_item(self, item: ItemListing) -> ModerationResult:
        """Moderate an item listing using Gemini API"""
        # ... (This method is also exactly the same as in your script)
        try:
            prompt = self._create_moderation_prompt(item)
            image_part = None
            if item.image_data:
                try:
                    pil_image = Image.open(io.BytesIO(item.image_data))
                    if pil_image.mode != 'RGB':
                        pil_image = pil_image.convert('RGB')
                    max_size = (1024, 1024)
                    pil_image.thumbnail(max_size, Image.Resampling.LANCZOS)
                    image_part = pil_image
                except Exception as e:
                    logger.error(f"Error processing image: {e}")
                    return ModerationResult(decision=ModerationDecision.FLAGGED, reason="Invalid or corrupted image file", confidence_score=1.0)
            
            if image_part:
                response = await asyncio.to_thread(self.model.generate_content, [prompt, image_part])
            else:
                response = await asyncio.to_thread(self.model.generate_content, prompt)
            
            response_text = response.text.strip()
            logger.info(f"Gemini response: {response_text}")
            
            if response_text.startswith("APPROVED"):
                return ModerationResult(decision=ModerationDecision.APPROVED, confidence_score=0.9, raw_response=response_text)
            elif response_text.startswith("FLAGGED:"):
                reason = response_text.replace("FLAGGED:", "").strip()
                return ModerationResult(decision=ModerationDecision.FLAGGED, reason=reason, confidence_score=0.9, raw_response=response_text)
            else:
                response_lower = response_text.lower()
                if "approved" in response_lower and "flagged" not in response_lower:
                    return ModerationResult(decision=ModerationDecision.APPROVED, confidence_score=0.7, raw_response=response_text)
                else:
                    return ModerationResult(decision=ModerationDecision.FLAGGED, reason="Unclear response from moderation system", confidence_score=0.5, raw_response=response_text)
        except Exception as e:
            logger.error(f"Error in moderation: {e}")
            return ModerationResult(decision=ModerationDecision.FLAGGED, reason=f"Technical error during moderation: {str(e)}", confidence_score=1.0)