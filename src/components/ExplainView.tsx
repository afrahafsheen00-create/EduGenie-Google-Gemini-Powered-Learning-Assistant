import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Loader2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  CheckCircle2,
  Globe,
  Sparkles,
  Layers,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { ExplainResult } from '../types';
import { EduGenieAPI } from '../services/api';

interface ExplainViewProps {
  onSaveNote: (title: string, type: 'explain', content: string) => void;
  isSaved: (title: string) => boolean;
  demoMode: boolean;
}

export const ExplainView: React.FC<ExplainViewProps> = ({ onSaveNote, isSaved, demoMode }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('college');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleTopics = [
    'Convolutional Neural Networks (CNNs)',
    'Keynesian vs. Classical Economics',
    'CRISPR-Cas9 Gene Editing',
    'The Byzantine Generals Problem',
    'Heisenberg Uncertainty Principle',
  ];

  const handleExplain = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    if (customTopic) {
      setTopic(customTopic);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await EduGenieAPI.explainTopic(t, level);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to explain topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Topic: ${result.topic}\n\n1. Simple Definition:\n${result.simpleDefinition}\n\n2. Detailed Explanation:\n${result.detailedExplanation}\n\n3. Important Points:\n${result.importantPoints.map((p) => `- ${p}`).join('\n')}\n\n4. Example:\n${result.example}\n\n5. Real-World Application:\n${result.realWorldApplication}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    const content = `### Topic: ${result.topic}\n\n#### 1. Simple Definition\n${result.simpleDefinition}\n\n#### 2. Detailed Explanation\n${result.detailedExplanation}\n\n#### 3. Important Points\n${result.importantPoints.map((p) => `- ${p}`).join('\n')}\n\n#### 4. Illustrative Example\n${result.example}\n\n#### 5. Real-World Application\n${result.realWorldApplication}`;
    onSaveNote(result.topic, 'explain', content);
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
              Module 2: Pedagogical Decomposition Engine
            </span>
            <p className="text-purple-900/90 leading-relaxed">
              Structures college-level knowledge into 5 rigorous academic dimensions:
              <strong> Definition</strong> &rarr; <strong>Detailed Mechanics</strong> &rarr; <strong>Important Points</strong> &rarr; <strong>Conceptual Example</strong> &rarr; <strong>Real-World Application</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Enter Academic Topic</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Depth level:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="college">College Undergraduate (Recommended)</option>
              <option value="advanced">Graduate / Research</option>
              <option value="introductory">High School / Introductory</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
            placeholder="e.g. Backpropagation, Cellular Mitosis, Black-Scholes Formula, Deadlock Prevention"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-hidden transition text-slate-800 placeholder:text-slate-400"
          />

          <button
            type="button"
            disabled={loading || !topic.trim()}
            onClick={() => handleExplain()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deconstructing...</span>
              </>
            ) : (
              <>
                <span>Explain Topic</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Preset Topic Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Popular topics:</span>
          {sampleTopics.map((st, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleExplain(st)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-900">Failed to explain topic</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-28"></div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-44"></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-32"></div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-32"></div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Action Strip */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">Topic Overview:</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{result.topic}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
              >
                {isSaved(result.topic) ? (
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

          {/* 1. Simple Definition */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>1. Simple Definition</span>
            </div>
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed">
              {result.simpleDefinition}
            </p>
          </div>

          {/* 2. Detailed Explanation */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>2. Detailed College-Level Explanation</span>
            </div>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {result.detailedExplanation}
            </div>
          </div>

          {/* 3. Important Points */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Important Points &amp; Core Principles</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.importantPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-snug">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4 & 5: Example and Real-World Application Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* 4. Example */}
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>4. Illustrative Example</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed italic">
                {result.example}
              </p>
            </div>

            {/* 5. Real-World Application */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>5. Real-World Application</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                {result.realWorldApplication}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
