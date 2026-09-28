import React from 'react';
import { Sparkles, GraduationCap, Bookmark, CheckCircle2, AlertTriangle, Presentation } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenNotes: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenNotes,
  demoMode,
  onToggleDemoMode,
  hasApiKey,
}) => {
  return (
    <header className="bg-white border-b border-indigo-100/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[10px] text-amber-950 font-bold shadow-xs">
                ✨
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span>EduGenie</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  AI Learning Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Academic Q&amp;A • Deep Explanations • MCQ Practice • Summarizer • Learning Paths
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* API Status badge */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {hasApiKey ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Flash Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>API Key Configured</span>
                </>
              )}
            </div>

            {/* College Demo Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                demoMode
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 ring-2 ring-purple-400/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Toggle college presentation breakdown cards"
            >
              <Presentation className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Presentation Mode</span>
              <span className="sm:hidden">Demo</span>
              {demoMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              )}
            </button>

            {/* Study Notes Button */}
            <button
              type="button"
              onClick={onOpenNotes}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Study Notes</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
