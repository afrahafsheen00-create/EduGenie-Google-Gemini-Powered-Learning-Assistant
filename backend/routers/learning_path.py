from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.gemini_client import generate_json_content

router = APIRouter(prefix="/api/learning-path", tags=["Learning Path"])

class LearningPathRequest(BaseModel):
    topic: str
    timeframe: Optional[str] = "flexible"
    goal: Optional[str] = "mastery"

class LearningStep(BaseModel):
    step: int
    phase: str
    title: str
    description: str
    duration: str
    milestoneProject: Optional[str] = None

class LearningPathResponse(BaseModel):
    topic: str
    overview: str
    beginnerConcepts: List[str]
    intermediateConcepts: List[str]
    advancedConcepts: List[str]
    recommendedOrder: List[LearningStep]
    practiceSuggestions: List[str]

@router.post("", response_model=LearningPathResponse)
async def generate_learning_path(request: LearningPathRequest):
    if not request.topic or not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    prompt = f"""You are EduGenie, an academic curriculum advisor.
Design a comprehensive, structured learning path for mastering: "{request.topic.strip()}".
Target goal: {request.goal}, timeframe: {request.timeframe}.

Requirements:
- Beginner concepts (prerequisites & core fundamentals)
- Intermediate concepts (applied techniques, algorithms, or theories)
- Advanced concepts (specialized topics, optimizations, cutting-edge areas)
- Recommended learning order (step-by-step sequential phases with title, description, and suggested duration)
- Practice suggestions (concrete hands-on projects, exercises, and self-checks)

Return a valid JSON object matching this schema:
{{
  "topic": "{request.topic.strip()}",
  "overview": "short high-level summary of this learning journey",
  "beginnerConcepts": ["fundamental 1", "fundamental 2"],
  "intermediateConcepts": ["intermediate 1", "intermediate 2"],
  "advancedConcepts": ["advanced 1", "advanced 2"],
  "recommendedOrder": [
    {{
      "step": 1,
      "phase": "Foundation",
      "title": "Phase title",
      "description": "What to learn in this phase",
      "duration": "1-2 Weeks",
      "milestoneProject": "Hands-on project for this phase"
    }}
  ],
  "practiceSuggestions": ["suggestion 1", "suggestion 2"]
}}"""

    try:
        data = generate_json_content(prompt)
        raw_order = data.get("recommendedOrder", [])
        order = []
        for idx, item in enumerate(raw_order):
            order.append(
                LearningStep(
                    step=item.get("step", idx + 1),
                    phase=item.get("phase", "Core"),
                    title=item.get("title", f"Step {idx+1}"),
                    description=item.get("description", ""),
                    duration=item.get("duration", "1-2 weeks"),
                    milestoneProject=item.get("milestoneProject"),
                )
            )

        return LearningPathResponse(
            topic=data.get("topic", request.topic),
            overview=data.get("overview", "Structured roadmap to master the subject."),
            beginnerConcepts=data.get("beginnerConcepts", []),
            intermediateConcepts=data.get("intermediateConcepts", []),
            advancedConcepts=data.get("advancedConcepts", []),
            recommendedOrder=order,
            practiceSuggestions=data.get("practiceSuggestions", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
