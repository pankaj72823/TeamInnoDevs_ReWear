import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

# Load the trained model
model = joblib.load("model.pkl")

# Create FastAPI app
app = FastAPI()

# Define request body structure
class InputData(BaseModel):
    features: list

# Prediction endpoint
@app.post("/predict/")
def predict(data: InputData):
    prediction = model.predict([np.array(data.features)])
    return {"prediction": int(prediction[0])}

@app.get("/predict/")
def predict_get(feature1: float, feature2: float, feature3: float, feature4: float):
    features = [feature1, feature2, feature3, feature4]
    prediction = model.predict([np.array(features)])
    return {"prediction": int(prediction[0])}

@app.get("/")
def get():
    return {"ML": "😊"}