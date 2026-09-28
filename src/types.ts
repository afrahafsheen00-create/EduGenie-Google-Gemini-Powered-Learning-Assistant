export interface QAResult {
  question: string;
  answer: string;
  simpleExplanation: string;
  example: string;
  keyTakeaways: string[];
  followUpQuestions: string[];
}

export interface ExplainResult {
  topic: string;
  simpleDefinition: string;
  detailedExplanation: string;
  importantPoints: string[];
  example: string;
  realWorldApplication: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  topic: string;
  questions: QuizQuestion[];
}

export interface SummarizeResult {
  tldr: string;
  summary: string;
  keyPoints: string[];
  originalWordCount: number;
  summaryWordCount: number;
  reductionPercentage: number;
  readingTimeMinutes: number;
}

export interface LearningStep {
  step: number;
  phase: string;
  title: string;
  description: string;
  duration: string;
  milestoneProject?: string;
}

export interface LearningPathResult {
  topic: string;
  overview: string;
  beginnerConcepts: string[];
  intermediateConcepts: string[];
  advancedConcepts: string[];
  recommendedOrder: LearningStep[];
  practiceSuggestions: string[];
}

export type FeatureTab = 'qa' | 'explain' | 'quiz' | 'summarize' | 'learning-path';

export interface SavedItem {
  id: string;
  title: string;
  type: FeatureTab;
  date: string;
  content: string;
}
