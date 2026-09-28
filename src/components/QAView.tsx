import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  ArrowRight,
  ListChecks,
  Volume2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';
import { QAResult } from '../types';
import { EduGenieAPI } from '../services/api';

interface QAViewProps {
  onSaveNote: (title: string, type: 'qa', content: string) => void;
  isSaved: (title: string) => boolean;
  demoMode: boolean;
}

export const QAView: React.FC<QAViewProps> = ({ onSaveNote, isSaved, demoMode }) => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QAResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const sampleQuestions = [
    'How does the binary search algorithm achieve O(log n) time complexity?',
    'What is the difference between aerobic and anaerobic cellular respiration?',
    'Explain the Law of Diminishing Marginal Utility with a simple example.',
    'Why is the sky blue during the day but orange at sunset?',
  ];

  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk || question).trim();
    if (!q) return;

    if (queryToAsk) {
      setQuestion(queryToAsk);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await EduGenieAPI.askQuestion(q, context);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get an answer. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Question: ${result.question}\n\nAnswer: ${result.answer}\n\nIn Simple Words: ${result.simpleExplanation}\n\nExample: ${result.example}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    const content = `### Question\n${result.question}\n\n### Answer\n${result.answer}\n\n### Simple Explanation\n${result.simpleExplanation}\n\n### Illustrative Example\n${result.example}\n\n### Key Takeaways\n${result.keyTakeaways.map((t) => `- ${t}`).join('\n')}`;
    onSaveNote(result.question, 'qa', content);
  };

  const handleSpeak = () => {
    if (!result || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${result.answer}. In simple terms: ${result.simpleExplanation}`);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* College Presentation Breakdown Header */}
      {demoMode && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-purple-200/80 text-purple-800 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-purple-700 block mb-0.5">
              Module 1: Question Answering Architecture
            </span>
            <p className="text-purple-900/90 leading-relaxed">
              Accepts academic inquiries and invokes <strong>Google Gemini Flash</strong> via server-side schema constraints. Enforces a dual-layer response: deep technical accuracy alongside an intuitive layman analogy to support differentiated student learning levels.
            </p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Academic Question Input</span>
          </div>
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {showContext ? '- Hide Context' : '+ Add Subject/Context'}
          </button>
        </div>

        <div>
          <label htmlFor="qa-input" className="sr-only">
            Ask any academic question
          </label>
          <div className="relative">
            <textarea
              id="qa-input"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAsk();
                }
              }}
              placeholder="e.g. What is the fundamental difference between supervised and unsupervised machine learning? How does photosynthesis convert sunlight to glucose?"
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-hidden transition resize-y text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {showContext && (
          <div className="transition-all animate-fadeIn">
            <label htmlFor="context-input" className="block text-xs font-medium text-slate-600 mb-1">
              Optional Context / Subject (e.g., "Computer Science - Data Structures", "AP Chemistry"):
            </label>
            <input
              id="context-input"
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Specify course, syllabus, or sub-field for tailored depth"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Try asking:</span>
            {sampleQuestions.slice(0, 2).map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAsk(sq)}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors truncate max-w-[200px]"
                title={sq}
              >
                {sq}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={loading || !question.trim()}
            onClick={() => handleAsk()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>EduGenie Thinking...</span>
              </>
            ) : (
              <>
                <span>Get Answer</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-900">Unable to generate answer</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 animate-pulse">
          <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded-md w-full"></div>
            <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
            <div className="h-4 bg-slate-100 rounded-md w-4/6"></div>
          </div>
          <div className="h-20 bg-indigo-50/50 rounded-xl w-full"></div>
        </div>
      )}

      {/* Answer Result Display */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Main Answer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header bar */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Academic Answer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    speaking ? 'bg-amber-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={speaking ? 'Stop speech' : 'Listen to answer'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  {isSaved(result.question) ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Question Echo */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original Question</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{result.question}</h3>
              </div>

              {/* Comprehensive Answer */}
              <div className="prose prose-slate max-w-none">
                <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  {result.answer}
                </div>
              </div>

              {/* Simple Language Card (Requirement 1: Explain in simple language) */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950">
                <div className="flex items-center gap-2 mb-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>In Simple Words (Beginner Friendly)</span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">{result.simpleExplanation}</p>
              </div>

              {/* Illustrative Example (Requirement 1: Use examples where useful) */}
              {result.example && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/70 text-indigo-950">
                  <div className="flex items-center gap-2 mb-2 text-indigo-800 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Illustrative Example &amp; Analogy</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed italic">{result.example}</p>
                </div>
              )}

              {/* Key Takeaways */}
              {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <ListChecks className="w-4 h-4 text-emerald-600" />
                    <span>Key Takeaways for Review</span>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {result.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Questions */}
              {result.followUpQuestions && result.followUpQuestions.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                    <FileQuestion className="w-4 h-4 text-indigo-500" />
                    <span>Explore Further (Click to Ask Next)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.followUpQuestions.map((fq, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAsk(fq)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-medium text-slate-700 transition-colors border border-slate-200/80 group"
                      >
                        <span>{fq}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
