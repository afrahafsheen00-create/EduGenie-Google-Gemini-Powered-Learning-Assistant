from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.gemini_client import generate_json_content

router = APIRouter(prefix="/api/explain", tags=["Topic Explanation"])

class ExplainRequest(BaseModel):
    topic: str
    level: Optional[str] = "college"

class ExplainResponse(BaseModel):
    topic: str
    simpleDefinition: str
    detailedExplanation: str
    importantPoints: List[str]
    example: str
    realWorldApplication: str

@router.post("", response_model=ExplainResponse)
async def explain_topic(request: ExplainRequest):
    if not request.topic or not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    prompt = f"""You are EduGenie, an expert college-level educator.
Explain the topic "{request.topic.strip()}" tailored for {request.level} students.

You MUST provide:
1. A concise, simple definition.
2. A thorough, detailed explanation explaining the underlying concepts and mechanisms.
3. 4-6 crucial important points as bullet items.
4. A concrete, relatable example or conceptual scenario.
5. Real-world industry or academic applications.

Return a valid JSON object matching this schema:
{{
  "topic": "{request.topic.strip()}",
  "simpleDefinition": "concise plain-language definition",
  "detailedExplanation": "in-depth breakdown covering principles, operation, and nuances",
  "importantPoints": ["point 1", "point 2", "point 3", "point 4"],
  "example": "clear real-life or conceptual example",
  "realWorldApplication": "practical real-world application in modern industry/science/tech"
}}"""

    try:
        data = generate_json_content(prompt)
        return ExplainResponse(
            topic=data.get("topic", request.topic),
            simpleDefinition=data.get("simpleDefinition", ""),
            detailedExplanation=data.get("detailedExplanation", ""),
            importantPoints=data.get("importantPoints", []),
            example=data.get("example", ""),
            realWorldApplication=data.get("realWorldApplication", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
