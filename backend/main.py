from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import database

app = FastAPI(
    title="PostgreSQL Dashboard API",
    description="API for PostgreSQL database exploration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(database.router)

@app.get("/")
async def root():
    return {"message": "PostgreSQL Dashboard API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
