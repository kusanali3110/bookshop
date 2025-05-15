from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

app = FastAPI(title="BookShop API Gateway")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add OPTIONS handler for preflight requests
@app.options("/{full_path:path}")
async def options_handler():
    return {}

# Include router
app.include_router(router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "api-gateway"}