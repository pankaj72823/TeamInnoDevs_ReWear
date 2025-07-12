from fastapi import APIRouter, HTTPException, UploadFile, File, Form

# Import the service class and data model from our service file
from .service import ModerationService, ItemListing

# Create the router instance
router = APIRouter(
    prefix="/moderation",
    tags=["Content Moderation"]
)

# Initialize the service that will do the work
moderation_service = ModerationService()

# Define the API endpoint
@router.post("/moderate-item/")
async def moderate_item_endpoint(
    user_id: str = Form(...),
    title: str = Form(...),
    type: str = Form(...),
    size: str = Form(...),
    condition: str = Form(...),
    material: str = Form(None),
    brand: str = Form(None),
    tags: str = Form(None),
    description: str = Form(None),
    image: UploadFile = File(...)
):
    """
    Main endpoint for submitting items for moderation.
    This handles the web request and calls the service to perform the logic.
    """
    
    # Validate image
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read image data from the upload
    image_data = await image.read()
    
    # Create the item listing object to pass to the service
    item = ItemListing(
        user_id=user_id,
        title=title,
        type=type,
        size=size,
        condition=condition,
        material=material,
        brand=brand,
        tags=tags,
        description=description,
        image_data=image_data,
        image_filename=image.filename
    )
    
    # Call the service to get the moderation result
    result = await moderation_service.moderate_item(item)
    
    # Format and return the final JSON response
    return {
        "decision": result.decision.value,
        "reason": result.reason,
        "confidence_score": result.confidence_score,
        "raw_response": result.raw_response,
        "item_details": {
            "user_id": item.user_id,
            "title": item.title,
            "type": item.type,
            "size": item.size,
            "condition": item.condition,
            "material": item.material,
            "brand": item.brand,
            "tags": item.tags,
            "description": item.description
        }
    }