from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from backend.gemini_client import generate_json_content

router = APIRouter(prefix="/api/qa", tags=["Question Answering"])

class QARequest(BaseModel):
    question: str
    context: Optional[str] = None

class QAResponse(BaseModel):
    question: str
    answer: str
    simpleExplanation: str
    example: str
    keyTakeaways: List[str]
    followUpQuestions: List[str]

@router.post("", response_model=QAResponse)
async def ask_question(request: QARequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    prompt = f"""You are EduGenie, an expert academic tutor.
Answer the following student question accurately, clearly, and in simple language suitable for a student.
Provide an illustrative example where useful.

Student question: "{request.question.strip()}"
{f'Additional context: "{request.context.strip()}"' if request.context else ''}

Return a valid JSON object matching this schema:
{{
  "question": "{request.question.strip()}",
  "answer": "comprehensive, clear and accurate answer in clear language",
  "simpleExplanation": "a simplified summary that makes it intuitive (ELi5 / beginner friendly)",
  "example": "a concrete illustrative example or analogy",
  "keyTakeaways": ["key takeaway 1", "key takeaway 2", "key takeaway 3"],
  "followUpQuestions": ["suggested follow-up question 1", "suggested follow-up question 2"]
}}"""

    try:
        data = generate_json_content(prompt)
        return QAResponse(
            question=data.get("question", request.question),
            answer=data.get("answer", "No answer generated."),
            simpleExplanation=data.get("simpleExplanation", ""),
            example=data.get("example", ""),
            keyTakeaways=data.get("keyTakeaways", []),
            followUpQuestions=data.get("followUpQuestions", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
