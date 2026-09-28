import React from 'react';
import { HelpCircle, BookOpen, CheckSquare, FileText, Compass } from 'lucide-react';
import { FeatureTab } from '../types';

interface NavigationProps {
  activeTab: FeatureTab;
  onSelectTab: (tab: FeatureTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'qa' as FeatureTab,
      label: 'Ask a Question',
      shortLabel: 'Ask Q&A',
      icon: HelpCircle,
      description: 'Instant academic answers & examples',
      badge: 'Core',
    },
    {
      id: 'explain' as FeatureTab,
      label: 'Explain a Topic',
      shortLabel: 'Explain',
      icon: BookOpen,
      description: 'College-level deep dive breakdown',
      badge: 'Detailed',
    },
    {
      id: 'quiz' as FeatureTab,
      label: 'Generate MCQs',
      shortLabel: 'Quiz / MCQs',
      icon: CheckSquare,
      description: '3–5 interactive practice questions',
      badge: 'Interactive',
    },
    {
      id: 'summarize' as FeatureTab,
      label: 'Summarize',
      shortLabel: 'Summarize',
      icon: FileText,
      description: 'Concise key points & TL;DR',
      badge: 'Productivity',
    },
    {
      id: 'learning-path' as FeatureTab,
      label: 'Learning Path',
      shortLabel: 'Roadmap',
      icon: Compass,
      description: 'Beginner to Advanced syllabus',
      badge: 'Curriculum',
    },
  ];

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Feature Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-300/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </div>
                  <div className="text-[10px] font-normal text-slate-400 hidden md:block">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
