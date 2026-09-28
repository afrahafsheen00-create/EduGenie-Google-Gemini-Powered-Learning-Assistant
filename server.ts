import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK as per gemini-api skill instructions
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODELS = [MODEL_NAME, 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateWithFallback(params: {
  contents: string;
  config?: any;
}) {
  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`[EduGenie] Model ${model} failed (${err.message}). Trying fallback model if available...`);
      lastError = err;
      if (err.message?.includes('API_KEY_INVALID')) {
        throw err;
      }
    }
  }
  throw lastError;
}

// Helper to ensure API key is present
const checkApiKey = (res: Response): boolean => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please set it in your environment secrets.',
    });
    return false;
  }
  return true;
};

// 1. ASK A QUESTION
app.post('/api/qa', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;
  try {
    const { question, context } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const prompt = `You are EduGenie, an expert academic tutor.
Answer the following student question accurately, clearly, and in simple language suitable for a student.
Provide an illustrative example where useful.

Student question: "${question.trim()}"
${context ? `Additional context: "${context.trim()}"` : ''}

Return a valid JSON object matching this structure:
{
  "question": "the question asked",
  "answer": "comprehensive, clear and accurate answer in clear language",
  "simpleExplanation": "a simplified summary that makes it intuitive (ELi5 / beginner friendly)",
  "example": "a concrete illustrative example or analogy",
  "keyTakeaways": ["key takeaway 1", "key takeaway 2", "key takeaway 3"],
  "followUpQuestions": ["suggested follow-up question 1", "suggested follow-up question 2"]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            example: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['question', 'answer', 'simpleExplanation', 'example', 'keyTakeaways', 'followUpQuestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/qa:', err);
    res.status(500).json({
      error: err.message || 'Failed to answer question. Please try again.',
    });
  }
});

// 2. EXPLAIN A TOPIC
app.post('/api/explain', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;
  try {
    const { topic, level = 'college' } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const prompt = `You are EduGenie, an expert college-level educator.
Explain the topic "${topic.trim()}" tailored for ${level} students.
You MUST provide:
1. A concise, simple definition.
2. A thorough, detailed explanation explaining the underlying concepts and mechanisms.
3. 4-6 crucial important points as bullet items.
4. A concrete, relatable example or conceptual scenario.
5. Real-world industry or academic applications.

Return a valid JSON object matching the requested schema.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            simpleDefinition: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING },
            importantPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            example: { type: Type.STRING },
            realWorldApplication: { type: Type.STRING },
          },
          required: [
            'topic',
            'simpleDefinition',
            'detailedExplanation',
            'importantPoints',
            'example',
            'realWorldApplication',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/explain:', err);
    res.status(500).json({
      error: err.message || 'Failed to explain topic. Please try again.',
    });
  }
});

// 3. GENERATE MCQS (QUIZ)
app.post('/api/quiz', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;
  try {
    const { topic, count = 4, difficulty = 'medium' } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const questionCount = Math.min(Math.max(parseInt(String(count), 10) || 4, 3), 5);

    const prompt = `You are EduGenie, an academic assessment specialist.
Generate exactly ${questionCount} high-quality, non-repeating multiple-choice questions (MCQs) on the topic: "${topic.trim()}".
Target level/difficulty: ${difficulty} (suitable for college-level study).

Requirements:
- Each question must have exactly 4 options labeled or formatted cleanly.
- One option must be undeniably correct.
- Clearly specify the correct answer option index or letter (e.g. "A", "B", "C", or "D") and the exact text.
- Provide a concise explanation detailing WHY this answer is correct and why other options are incorrect.
- Ensure questions do NOT repeat.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Array of exactly 4 choices',
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: 'Exact text or letter of the correct option',
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: 'Zero-based index (0, 1, 2, or 3) of the correct option in the options array',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Clear educational explanation for why this choice is correct',
                  },
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/quiz:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate quiz. Please try again.',
    });
  }
});

// 4. SUMMARIZE
app.post('/api/summarize', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;
  try {
    const { text, focus = 'general' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text content is required' });
      return;
    }

    const trimmed = text.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

    const prompt = `You are EduGenie, an expert research assistant.
Summarize the following text while strictly preserving its original meaning and academic integrity.
Extract the most critical key points.

Input text:
"""
${trimmed}
"""

Requirements:
- Provide a clear, concise executive summary paragraph.
- Extract 4-7 key bullet points capturing essential findings or arguments.
- Include a 1-sentence "TL;DR" quick takeaway.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tldr: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['tldr', 'summary', 'keyPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const summaryWordCount = (parsed.summary || '').split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

    res.json({
      ...parsed,
      originalWordCount: wordCount,
      summaryWordCount,
      reductionPercentage: wordCount > 0 ? Math.round(((wordCount - summaryWordCount) / wordCount) * 100) : 0,
      readingTimeMinutes,
    });
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);
    res.status(500).json({
      error: err.message || 'Failed to summarize text. Please try again.',
    });
  }
});

// 5. LEARNING PATH
app.post('/api/learning-path', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;
  try {
    const { topic, timeframe = 'flexible', goal = 'mastery' } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const prompt = `You are EduGenie, an academic curriculum advisor.
Design a comprehensive, structured learning path for mastering: "${topic.trim()}".
Target goal: ${goal}, timeframe: ${timeframe}.

Requirements:
- Beginner concepts (prerequisites & core fundamentals)
- Intermediate concepts (applied techniques, algorithms, or theories)
- Advanced concepts (specialized topics, optimizations, cutting-edge areas)
- Recommended learning order (step-by-step sequential phases with title, description, and suggested duration)
- Practice suggestions (concrete hands-on projects, exercises, and self-checks)`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            overview: { type: Type.STRING },
            beginnerConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            intermediateConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            advancedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedOrder: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  phase: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  milestoneProject: { type: Type.STRING },
                },
                required: ['step', 'phase', 'title', 'description', 'duration'],
              },
            },
            practiceSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'topic',
            'overview',
            'beginnerConcepts',
            'intermediateConcepts',
            'advancedConcepts',
            'recommendedOrder',
            'practiceSuggestions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/learning-path:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate learning path. Please try again.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EduGenie Backend',
    model: MODEL_NAME,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
