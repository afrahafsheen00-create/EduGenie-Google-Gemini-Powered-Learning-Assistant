import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.routers import qa, explain, quiz, summarize, learning_path

app = FastAPI(
    title="EduGenie API",
    description="AI-Powered Personalized Learning Assistant Backend",
    version="1.0.0",
)

# Enable CORS for frontend clients (local Vite dev or standard ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include feature routers
app.include_router(qa.router)
app.include_router(explain.router)
app.include_router(quiz.router)
app.include_router(summarize.router)
app.include_router(learning_path.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EduGenie FastAPI Backend",
        "has_api_key": bool(os.getenv("GEMINI_API_KEY")),
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    }

# Serve static frontend if dist exists (for production single-port deploy)
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return None
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "EduGenie API is running. Build frontend with 'npm run build' to serve UI."}
