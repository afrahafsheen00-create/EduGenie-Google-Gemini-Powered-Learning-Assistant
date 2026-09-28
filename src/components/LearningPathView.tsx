import React, { useState } from 'react';
import {
  Compass,
  Send,
  Loader2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Code,
  Target,
  Layers,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { LearningPathResult } from '../types';
import { EduGenieAPI } from '../services/api';

interface LearningPathViewProps {
  onSaveNote: (title: string, type: 'learning-path', content: string) => void;
  isSaved: (title: string) => boolean;
  demoMode: boolean;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  onSaveNote,
  isSaved,
  demoMode,
}) => {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('College Course Mastery & Project Readiness');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LearningPathResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleSubjects = [
    'Machine Learning & Deep Learning',
    'Full-Stack Web Development',
    'Data Structures & Algorithms',
    'Cloud Computing & DevOps',
    'Bioinformatics & Computational Biology',
  ];

  const handleGenerate = async (customSubject?: string) => {
    const t = (customSubject || topic).trim();
    if (!t) return;

    if (customSubject) {
      setTopic(customSubject);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await EduGenieAPI.generateLearningPath(t, '1 Semester', goal);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Learning Roadmap: ${result.topic}\n\nOverview:\n${result.overview}\n\nBeginner Concepts:\n${result.beginnerConcepts.map((c) => `- ${c}`).join('\n')}\n\nIntermediate Concepts:\n${result.intermediateConcepts.map((c) => `- ${c}`).join('\n')}\n\nAdvanced Concepts:\n${result.advancedConcepts.map((c) => `- ${c}`).join('\n')}\n\nRecommended Order:\n${result.recommendedOrder.map((s) => `Step ${s.step}: [${s.phase}] ${s.title} (${s.duration}) - ${s.description}`).join('\n')}\n\nPractice Suggestions:\n${result.practiceSuggestions.map((p) => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    const content = `### Learning Roadmap: ${result.topic}\n\n${result.overview}\n\n#### Beginner Concepts\n${result.beginnerConcepts.map((c) => `- ${c}`).join('\n')}\n\n#### Intermediate Concepts\n${result.intermediateConcepts.map((c) => `- ${c}`).join('\n')}\n\n#### Advanced Concepts\n${result.advancedConcepts.map((c) => `- ${c}`).join('\n')}\n\n#### Recommended Sequence\n${result.recommendedOrder.map((s) => `${s.step}. **${s.title}** (${s.duration})\n   ${s.description}`).join('\n\n')}\n\n#### Practice Suggestions\n${result.practiceSuggestions.map((p) => `- ${p}`).join('\n')}`;
    onSaveNote(`Path: ${result.topic}`, 'learning-path', content);
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
              Module 5: Adaptive Curriculum &amp; Scaffolding Engine
            </span>
            <p className="text-purple-900/90 leading-relaxed">
              Constructs progressive academic curricula split across <strong>Beginner</strong>, <strong>Intermediate</strong>, and <strong>Advanced</strong> stages with chronologically sequenced milestone objectives, duration pacing, and practical project checkpoints.
            </p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <Compass className="w-4 h-4" />
            <span>Generate Structured Learning Path</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Learning Goal:</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="College Course Mastery & Project Readiness">
                College Course Mastery &amp; Projects
              </option>
              <option value="Exam Preparation & Rapid Revision">Exam Prep &amp; Revision</option>
              <option value="Interview & Industry Ready Skills">Job &amp; Interview Ready</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Distributed Systems, Molecular Genetics, Macroeconomics, React & TypeScript"
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
                <span>Mapping Roadmap...</span>
              </>
            ) : (
              <>
                <span>Generate Path</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Preset Subjects */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Popular roadmaps:</span>
          {sampleSubjects.map((ss, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleGenerate(ss)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
            >
              {ss}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-900">Failed to map learning path</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-28"></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-44"></div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-44"></div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-44"></div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 h-48"></div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Action Strip */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">Curriculum:</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{result.topic}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
              >
                {isSaved(`Path: ${result.topic}`) ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Overview Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              Curriculum Overview &amp; Strategy
            </span>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              {result.overview}
            </p>
          </div>

          {/* 3 Skill Level Pillars (Beginner, Intermediate, Advanced) */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Beginner */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Beginner Concepts</span>
              </div>
              <ul className="space-y-2">
                {result.beginnerConcepts.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intermediate */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Intermediate Concepts</span>
              </div>
              <ul className="space-y-2">
                {result.intermediateConcepts.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advanced */}
            <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Advanced Concepts</span>
              </div>
              <ul className="space-y-2">
                {result.advancedConcepts.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Learning Order (Chronological Milestones) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Recommended Learning Order &amp; Milestone Phases</span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
              {result.recommendedOrder.map((stepItem, idx) => (
                <div key={idx} className="relative group">
                  {/* Step Bubble */}
                  <div className="absolute -left-6 sm:-left-8 top-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white text-xs font-bold ring-4 ring-white shadow-xs">
                    {stepItem.step || idx + 1}
                  </div>

                  <div className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200/70 transition-colors space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                          {stepItem.phase}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{stepItem.title}</h4>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stepItem.duration}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {stepItem.description}
                    </p>

                    {stepItem.milestoneProject && (
                      <div className="pt-2 text-xs flex items-center gap-1.5 text-indigo-700 font-medium">
                        <Target className="w-3.5 h-3.5" />
                        <span>Checkpoint Project: {stepItem.milestoneProject}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Suggestions */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider">
              <Code className="w-4 h-4 text-emerald-600" />
              <span>Recommended Hands-On Practice Suggestions</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {result.practiceSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs sm:text-sm text-slate-800"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
