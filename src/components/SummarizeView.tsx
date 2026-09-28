import React, { useState } from 'react';
import {
  FileText,
  Send,
  Loader2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent,
  Trash2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { SummarizeResult } from '../types';
import { EduGenieAPI } from '../services/api';

interface SummarizeViewProps {
  onSaveNote: (title: string, type: 'summarize', content: string) => void;
  isSaved: (title: string) => boolean;
  demoMode: boolean;
}

export const SummarizeView: React.FC<SummarizeViewProps> = ({ onSaveNote, isSaved, demoMode }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleAcademicText = `Artificial Intelligence in Higher Education is transitioning from theoretical novelty to fundamental infrastructure. Recent evaluations indicate adaptive learning algorithms personalize instruction according to student cognitive pace, improving retention rates by up to 28% across foundational STEM courses. However, integrating machine learning tools introduces pedagogical questions concerning student autonomy, algorithmic fairness, and data privacy. Academic institutions must establish clear governance frameworks: ensuring AI acts as a scaffold rather than a substitute for foundational critical thinking skills, standardizing accessibility protocols, and training educators to detect automated plagiarism without undermining trust. Ultimately, when configured responsibly, generative AI serves as an indispensable personalized tutor for complex collegiate coursework.`;

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await EduGenieAPI.summarizeText(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertSample = () => {
    setText(sampleAcademicText);
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `TL;DR: ${result.tldr}\n\nSummary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map((p) => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    const title = result.tldr ? `Summary: ${result.tldr.slice(0, 45)}...` : 'Academic Summary';
    const content = `### Executive Summary\n${result.summary}\n\n### TL;DR\n${result.tldr}\n\n### Key Extracted Points\n${result.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n*Word Count Reduced from ${result.originalWordCount} to ${result.summaryWordCount} (${result.reductionPercentage}% reduction)*`;
    onSaveNote(title, 'summarize', content);
  };

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
              Module 4: Semantic Distillation &amp; Compression
            </span>
            <p className="text-purple-900/90 leading-relaxed">
              Preserves authorial intent and factual accuracy while condensing academic research papers, lecture notes, or textbooks into actionable executive summaries with distinct key-point extraction.
            </p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <FileText className="w-4 h-4" />
            <span>Academic Text Input</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Insert Academic Sample
            </button>
            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste research paper abstract, lecture notes, textbook excerpt, or study article here..."
            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-hidden transition resize-y text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>
              Words: <strong>{wordCount}</strong>
            </span>
            {wordCount > 0 && (
              <span>
                Est. Read Time: ~<strong>{Math.max(1, Math.round(wordCount / 200))} min</strong>
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={loading || !text.trim()}
            onClick={handleSummarize}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Distilling Key Insights...</span>
              </>
            ) : (
              <>
                <span>Summarize &amp; Extract Points</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-900">Failed to summarize</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-28"></div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-40"></div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Summary Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block">Original Words</span>
              <span className="text-lg font-bold text-slate-800">{result.originalWordCount}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block">Summary Words</span>
              <span className="text-lg font-bold text-indigo-700">{result.summaryWordCount}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block">Length Reduction</span>
              <span className="text-lg font-bold text-emerald-600">
                {result.reductionPercentage}% saved
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block">Reading Speed</span>
              <span className="text-lg font-bold text-slate-800">
                &lt; 1 min
              </span>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header bar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Concise Academic Summary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  {isSaved(result.tldr ? `Summary: ${result.tldr.slice(0, 45)}...` : 'Academic Summary') ? (
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
              {/* TL;DR Highlight */}
              {result.tldr && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                    ⚡ TL;DR Quick Takeaway
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-indigo-950">
                    {result.tldr}
                  </p>
                </div>
              )}

              {/* Concise Summary Paragraph */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Executive Summary
                </h4>
                <div className="text-sm sm:text-base text-slate-800 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  {result.summary}
                </div>
              </div>

              {/* Key Extracted Points */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Points Extracted</span>
                </div>
                <div className="space-y-2">
                  {result.keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-800"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
