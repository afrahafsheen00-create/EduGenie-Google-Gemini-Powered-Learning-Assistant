import React, { useState } from 'react';
import {
  CheckSquare,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { QuizResult, QuizQuestion } from '../types';
import { EduGenieAPI } from '../services/api';

interface QuizViewProps {
  onSaveNote: (title: string, type: 'quiz', content: string) => void;
  isSaved: (title: string) => boolean;
  demoMode: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({ onSaveNote, isSaved, demoMode }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Student answer state: questionId -> selectedOptionIndex
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  const sampleTopics = [
    'Object-Oriented Programming Principles',
    'Cellular Metabolism and ATP',
    'Microeconomics: Supply, Demand & Elasticity',
    'Database Normalization (1NF to BCNF)',
  ];

  const handleGenerate = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    if (customTopic) {
      setTopic(customTopic);
    }

    setLoading(true);
    setError(null);
    setSelectedAnswers({});
    setShowAllExplanations(false);

    try {
      const data = await EduGenieAPI.generateQuiz(t, count, difficulty);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleResetAnswers = () => {
    setSelectedAnswers({});
    setShowAllExplanations(false);
  };

  const handleSave = () => {
    if (!result) return;
    const questionsText = result.questions
      .map(
        (q, idx) =>
          `#### Question ${idx + 1}: ${q.question}\n` +
          q.options.map((opt, oi) => `  ${String.fromCharCode(65 + oi)}. ${opt}`).join('\n') +
          `\n**Correct Answer:** Option ${String.fromCharCode(65 + q.correctIndex)} (${q.correctAnswer})\n**Explanation:** ${q.explanation}\n`
      )
      .join('\n');

    const content = `### EduGenie MCQ Quiz: ${result.topic}\n\n${questionsText}`;
    onSaveNote(`Quiz: ${result.topic}`, 'quiz', content);
  };

  // Compute live score
  const totalQuestions = result?.questions.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  if (result) {
    result.questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected !== undefined && selected === q.correctIndex) {
        correctCount += 1;
      }
    });
  }

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* College Presentation Badge */}
      {demoMode && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-purple-200/80 text-purple-800 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-purple-700 block mb-0.5">
              Module 3: Formative Assessment Generation
            </span>
            <p className="text-purple-900/90 leading-relaxed">
              Synthesizes 3–5 non-repeating multiple-choice questions with 4 plausible options, algorithmic distractor analysis, verified answer key mapping, and immediate cognitive feedback via pedagogical rationales.
            </p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <CheckSquare className="w-4 h-4" />
            <span>Generate Multiple-Choice Quiz</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Count:</span>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value={3}>3 Questions</option>
                <option value={4}>4 Questions</option>
                <option value={5}>5 Questions</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="easy">Introductory</option>
                <option value="medium">College Standard</option>
                <option value="hard">Challenging / Exam</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Operating System Scheduling Algorithms, Photosynthesis Light Reactions, Organic Chemistry IUPAC"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-hidden transition text-slate-800 placeholder:text-slate-400"
          />

          <button
            type="button"
            disabled={loading || !topic.trim()}
            onClick={() => handleGenerate()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting MCQs...</span>
              </>
            ) : (
              <>
                <span>Generate MCQs</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Preset Sample Topics */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Sample topics:</span>
          {sampleTopics.map((st, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleGenerate(st)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-900">Failed to generate MCQs</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !result && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-8 bg-slate-100 rounded-lg"></div>
                  <div className="h-8 bg-slate-100 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz questions view */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Quiz Score & Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Topic: {result.topic}
                </h3>
                <p className="text-xs text-slate-500">
                  Answered {answeredCount} of {totalQuestions} questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {answeredCount > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                  Score:{' '}
                  <span className={scorePercent >= 75 ? 'text-emerald-600 font-bold' : 'text-slate-900'}>
                    {correctCount}/{totalQuestions} ({scorePercent}%)
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetAnswers}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                title="Clear selected choices"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAllExplanations(!showAllExplanations)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showAllExplanations ? 'Hide Keys' : 'Show All Keys'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
              >
                {isSaved(`Quiz: ${result.topic}`) ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Question Cards */}
          <div className="space-y-4">
            {result.questions.map((q, qIndex) => {
              const selectedIdx = selectedAnswers[q.id];
              const isAnswered = selectedIdx !== undefined;
              const isCorrect = selectedIdx === q.correctIndex;
              const reveal = isAnswered || showAllExplanations;

              return (
                <div
                  key={q.id || qIndex}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    {isAnswered && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((optText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = selectedIdx === optIdx;
                      const isThisCorrect = optIdx === q.correctIndex;

                      let buttonStyle = 'border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 text-slate-800';

                      if (reveal) {
                        if (isThisCorrect) {
                          buttonStyle = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                        } else if (isSelected && !isThisCorrect) {
                          buttonStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-medium';
                        } else {
                          buttonStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                        }
                      } else if (isSelected) {
                        buttonStyle = 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-200';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${buttonStyle}`}
                        >
                          <span
                            className={`flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold shrink-0 mt-0.5 ${
                              reveal && isThisCorrect
                                ? 'bg-emerald-600 text-white'
                                : reveal && isSelected && !isThisCorrect
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-200/80 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{optText}</span>
                          {reveal && isThisCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {reveal && isSelected && !isThisCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Educational Explanation Box */}
                  {reveal && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs leading-relaxed space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          Explanation (Correct Answer: Option {String.fromCharCode(65 + q.correctIndex)})
                        </span>
                      </div>
                      <p className="text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
