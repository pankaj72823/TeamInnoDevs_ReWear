import pickle
from fastapi import APIRouter
from pydantic import BaseModel, Field
from .service import ResearchBasedSustainabilityEstimator

router = APIRouter(
    prefix="/estimator",
    tags=["Sustainability Estimator"]
)

class SwapItem(BaseModel):
    item_type: str = Field(..., example="T-shirt")
    material: str = Field(..., example="Cotton")
    brand: str = Field(..., example="H&M")
    condition: str = Field(..., example="Good")

try:
    with open('sustainability_estimator.pkl', 'rb') as file:
        estimator: ResearchBasedSustainabilityEstimator = pickle.load(file)
    print("✅ Estimator model loaded successfully.")
except FileNotFoundError:
    print("❌ Error: 'sustainability_estimator.pkl' not found. Estimator endpoints will not work.")
    estimator = None

@router.post("/estimate/")
def get_sustainability_estimate(item: SwapItem):
    """
    Takes garment details as input and returns the estimated environmental savings.
    """
    if estimator is None:
        return {"error": "Estimator model not loaded. Please check server logs."}
    
    savings = estimator.get_ml_estimate(**item.dict())
    
    return savings