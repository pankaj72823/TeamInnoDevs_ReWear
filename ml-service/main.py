# ml-service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.estimator.router import router as estimator_router
from app.moderation.router import router as moderation_router

# Create the main FastAPI application instance
app = FastAPI(
    title="ReWear API",
    version="1.0.0",
    description="Backend services for the ReWear fashion swapping platform."
)

# Add global middleware
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5500" 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(estimator_router)
app.include_router(moderation_router)

@app.get("/", tags=["Health Check"])
def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "Welcome to the ReWear API"}