from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.gemini_client import generate_json_content

router = APIRouter(prefix="/api/quiz", tags=["Quiz Generation"])

class QuizRequest(BaseModel):
    topic: str
    count: Optional[int] = 4
    difficulty: Optional[str] = "medium"

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: str
    correctIndex: int
    explanation: str

class QuizResponse(BaseModel):
    topic: str
    questions: List[QuizQuestion]

@router.post("", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    if not request.topic or not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    count = min(max(request.count or 4, 3), 5)

    prompt = f"""You are EduGenie, an academic assessment specialist.
Generate exactly {count} high-quality, non-repeating multiple-choice questions (MCQs) on the topic: "{request.topic.strip()}".
Target level/difficulty: {request.difficulty} (suitable for college-level study).

Requirements:
- Each question must have exactly 4 options.
- One option must be undeniably correct.
- Clearly specify the correct option index (0, 1, 2, or 3) and correct answer text.
- Provide a concise explanation detailing WHY this answer is correct and why other options are incorrect.
- Ensure questions do NOT repeat.

Return a valid JSON object matching this schema:
{{
  "topic": "{request.topic.strip()}",
  "questions": [
    {{
      "id": 1,
      "question": "question text",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "correctIndex": 0,
      "explanation": "clear explanation"
    }}
  ]
}}"""

    try:
        data = generate_json_content(prompt)
        raw_questions = data.get("questions", [])
        questions = []
        for idx, q in enumerate(raw_questions):
            questions.append(
                QuizQuestion(
                    id=q.get("id", idx + 1),
                    question=q.get("question", f"Question {idx+1}"),
                    options=q.get("options", ["A", "B", "C", "D"]),
                    correctAnswer=str(q.get("correctAnswer", "")),
                    correctIndex=int(q.get("correctIndex", 0)),
                    explanation=q.get("explanation", "Correct answer."),
                )
            )
        return QuizResponse(topic=data.get("topic", request.topic), questions=questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
