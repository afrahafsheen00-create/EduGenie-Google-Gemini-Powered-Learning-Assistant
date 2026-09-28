import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { QAView } from './components/QAView';
import { ExplainView } from './components/ExplainView';
import { QuizView } from './components/QuizView';
import { SummarizeView } from './components/SummarizeView';
import { LearningPathView } from './components/LearningPathView';
import { StudyNotesModal } from './components/StudyNotesModal';
import { FeatureTab, SavedItem } from './types';
import { EduGenieAPI } from './services/api';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<FeatureTab>('qa');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Persistent notes in localStorage
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem('edugenie_saved_notes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('edugenie_saved_notes', JSON.stringify(savedItems));
    } catch {
      // ignore storage errors
    }
  }, [savedItems]);

  useEffect(() => {
    // Health check on load
    EduGenieAPI.checkHealth()
      .then((data) => {
        setHasApiKey(data.hasApiKey !== false);
      })
      .catch(() => {
        // Fallback assuming true unless server explicitly returns false
        setHasApiKey(true);
      });
  }, []);

  const handleSaveNote = (title: string, type: FeatureTab, content: string) => {
    // Avoid exact duplicate titles
    if (savedItems.some((item) => item.title === title && item.type === type)) {
      return;
    }
    const newItem: SavedItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      type,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      content,
    };
    setSavedItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllNotes = () => {
    setSavedItems([]);
  };

  const isSaved = (title: string): boolean => {
    return savedItems.some((item) => item.title === title);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        savedCount={savedItems.length}
        onOpenNotes={() => setIsNotesOpen(true)}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
        hasApiKey={hasApiKey}
      />

      {/* Main Navigation Tabs */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome & Feature Hero Banner */}
        <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Next-Generation Academic Study Companion</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {activeTab === 'qa' && 'Academic Question Answering'}
                {activeTab === 'explain' && 'College-Level Topic Explanations'}
                {activeTab === 'quiz' && 'Interactive MCQ Practice & Assessment'}
                {activeTab === 'summarize' && 'Academic Paper & Note Summarizer'}
                {activeTab === 'learning-path' && 'Structured Curriculum Roadmap'}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                {activeTab === 'qa' &&
                  'Get accurate answers to complex academic queries with simple layman breakdowns and intuitive analogies.'}
                {activeTab === 'explain' &&
                  'Explore five-dimensional conceptual deconstruction: definition, detailed mechanics, key takeaways, examples, and real-world impact.'}
                {activeTab === 'quiz' &&
                  'Test your comprehension with 3–5 targeted multiple-choice questions, instant scoring, and detailed pedagogical explanations.'}
                {activeTab === 'summarize' &&
                  'Condense research papers, lecture transcripts, and textbook chapters into clear executive summaries and key bullet points.'}
                {activeTab === 'learning-path' &&
                  'Map out your syllabus across Beginner, Intermediate, and Advanced milestones with recommended timelines and projects.'}
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-indigo-200 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
                <span>College Project Ready</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs">
                <Cpu className="w-3.5 h-3.5 text-amber-300" />
                <span>Gemini Flash Powered</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Component Render */}
        <div className="transition-all">
          {activeTab === 'qa' && (
            <QAView onSaveNote={handleSaveNote} isSaved={isSaved} demoMode={demoMode} />
          )}
          {activeTab === 'explain' && (
            <ExplainView onSaveNote={handleSaveNote} isSaved={isSaved} demoMode={demoMode} />
          )}
          {activeTab === 'quiz' && (
            <QuizView onSaveNote={handleSaveNote} isSaved={isSaved} demoMode={demoMode} />
          )}
          {activeTab === 'summarize' && (
            <SummarizeView onSaveNote={handleSaveNote} isSaved={isSaved} demoMode={demoMode} />
          )}
          {activeTab === 'learning-path' && (
            <LearningPathView onSaveNote={handleSaveNote} isSaved={isSaved} demoMode={demoMode} />
          )}
        </div>
      </main>

      {/* College Project Architecture Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">EduGenie</span>
              <span>— AI-Powered Personalized Learning Assistant</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                <Code2 className="w-3 h-3 text-indigo-600" /> FastAPI + React + Gemini
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Zero Mock Responses
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Designed for student coursework demonstration and academic self-study. Powered by Google Gemini Flash.
            </p>
            <p className="font-mono text-slate-400">
              Backend Port: 3000 (Cloud) | 8000 (Local Uvicorn)
            </p>
          </div>
        </div>
      </footer>

      {/* Study Notes Drawer/Modal */}
      <StudyNotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        savedItems={savedItems}
        onDeleteItem={handleDeleteItem}
        onClearAll={handleClearAllNotes}
      />
    </div>
  );
}
