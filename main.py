"""
EduGenie – AI-Powered Personalized Learning Assistant
FastAPI entrypoint for local execution:
    uvicorn main:app --reload
Open at:
    http://127.0.0.1:8000
"""

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
