from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.gemini_client import generate_json_content

router = APIRouter(prefix="/api/summarize", tags=["Summarization"])

class SummarizeRequest(BaseModel):
    text: str
    focus: Optional[str] = "general"

class SummarizeResponse(BaseModel):
    tldr: str
    summary: str
    keyPoints: List[str]
    originalWordCount: int
    summaryWordCount: int
    reductionPercentage: int
    readingTimeMinutes: int

@router.post("", response_model=SummarizeResponse)
async def summarize_text(request: SummarizeRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    trimmed = request.text.strip()
    words = trimmed.split()
    word_count = len(words)

    prompt = f"""You are EduGenie, an expert research assistant.
Summarize the following text while strictly preserving its original meaning and academic integrity.
Extract the most critical key points.

Input text:
\"\"\"
{trimmed}
\"\"\"

Requirements:
- Provide a clear, concise executive summary paragraph.
- Extract 4-7 key bullet points capturing essential findings or arguments.
- Include a 1-sentence "TL;DR" quick takeaway.

Return a valid JSON object matching this schema:
{{
  "tldr": "one-sentence concise takeaway",
  "summary": "comprehensive yet concise summary paragraph",
  "keyPoints": ["bullet point 1", "bullet point 2", "bullet point 3"]
}}"""

    try:
        data = generate_json_content(prompt)
        summary_text = data.get("summary", "")
        summary_words = len(summary_text.split())
        reduction = round(((word_count - summary_words) / word_count) * 100) if word_count > 0 else 0
        reading_time = max(1, round(word_count / 200))

        return SummarizeResponse(
            tldr=data.get("tldr", ""),
            summary=summary_text,
            keyPoints=data.get("keyPoints", []),
            originalWordCount=word_count,
            summaryWordCount=summary_words,
            reductionPercentage=reduction,
            readingTimeMinutes=reading_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
