import {
  QAResult,
  ExplainResult,
  QuizResult,
  SummarizeResult,
  LearningPathResult,
} from '../types';

async function postJSON<T>(url: string, data: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const errData = await res.json();
      if (errData && errData.error) {
        errorMsg = errData.error;
      } else if (errData && errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const EduGenieAPI = {
  async askQuestion(question: string, context?: string): Promise<QAResult> {
    return postJSON<QAResult>('/api/qa', { question, context });
  },

  async explainTopic(topic: string, level = 'college'): Promise<ExplainResult> {
    return postJSON<ExplainResult>('/api/explain', { topic, level });
  },

  async generateQuiz(topic: string, count = 4, difficulty = 'medium'): Promise<QuizResult> {
    return postJSON<QuizResult>('/api/quiz', { topic, count, difficulty });
  },

  async summarizeText(text: string, focus = 'general'): Promise<SummarizeResult> {
    return postJSON<SummarizeResult>('/api/summarize', { text, focus });
  },

  async generateLearningPath(topic: string, timeframe = 'flexible', goal = 'mastery'): Promise<LearningPathResult> {
    return postJSON<LearningPathResult>('/api/learning-path', { topic, timeframe, goal });
  },

  async checkHealth(): Promise<{ status: string; service: string; hasApiKey?: boolean }> {
    const res = await fetch('/api/health');
    return res.json();
  },
};
