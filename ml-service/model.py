import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris

# Load sample data
iris = load_iris()
X, y = iris.data, iris.target

# Train a simple model
model = RandomForestClassifier()
model.fit(X, y)

# Save the model
joblib.dump(model, "model.pkl")
