import os
import json
from dotenv import load_dotenv

load_dotenv()

PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-flash-latest", "gemini-3.1-flash-lite"]

_client = None

def get_gemini_client():
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please add it to your .env file.")

    try:
        from google import genai
        _client = genai.Client(api_key=api_key)
        return _client
    except ImportError:
        # Fallback to google-generativeai if installed
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=api_key)
            _client = legacy_genai
            return _client
        except ImportError:
            raise ImportError(
                "Neither 'google-genai' nor 'google-generativeai' is installed. "
                "Please run: pip install google-genai"
            )

def generate_json_content(prompt: str) -> dict:
    """
    Sends a prompt to Gemini requesting a JSON output with multi-model fallback and parses the response safely.
    """
    client = get_gemini_client()
    last_error = None

    for model_name in FALLBACK_MODELS:
        try:
            # Modern google-genai SDK
            if hasattr(client, "models"):
                from google.genai import types
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7,
                    ),
                )
                text = response.text or "{}"
            else:
                # Legacy google.generativeai fallback
                model = client.GenerativeModel(
                    model_name,
                    generation_config={"response_mime_type": "application/json", "temperature": 0.7}
                )
                response = model.generate_content(prompt)
                text = response.text or "{}"

            # Strip markdown code fences if present
            cleaned = text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            return json.loads(cleaned)
        except Exception as e:
            last_error = e
            print(f"[EduGenie] Model {model_name} failed: {e}. Trying next fallback...")
            continue

    if last_error:
        raise last_error
    return {}
