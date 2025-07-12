# /ReWear_API/scripts/train_estimator.py

import pickle

import sys
import os

# Add the project root to the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.estimator.service import ResearchBasedSustainabilityEstimator
# This import path MUST be correct for the new pickle file to work.


def train_and_save():
    """
    Initializes the estimator, trains the ML models, and saves the
    entire trained estimator instance to a pickle file for deployment.
    """
    print("--- 1. Initializing the Sustainability Estimator ---")
    estimator = ResearchBasedSustainabilityEstimator()
    
    print("\n--- 2. Training the ML Models ---")
    estimator.train_ml_models()
    
    # Save the file in the project's root directory
    filename = 'sustainability_estimator.pkl'
    
    print(f"\n--- 3. Saving the trained estimator to '{os.path.abspath(filename)}' ---")
    
    with open(filename, 'wb') as file:
        pickle.dump(estimator, file)
        
    print("\n✅ New estimator file created successfully.")
    print("You can now run the FastAPI backend with: uvicorn main:app --reload")

if __name__ == '__main__':
    train_and_save()