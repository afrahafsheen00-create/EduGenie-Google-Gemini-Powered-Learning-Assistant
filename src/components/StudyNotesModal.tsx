import React from 'react';
import { X, Bookmark, Trash2, Download, Copy, FileText, Check } from 'lucide-react';
import { SavedItem } from '../types';

interface StudyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const StudyNotesModal: React.FC<StudyNotesModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onDeleteItem,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyItem = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportMarkdown = () => {
    if (savedItems.length === 0) return;
    const header = `# EduGenie – Study Notes Export\n*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    const body = savedItems
      .map(
        (item) =>
          `## [${item.type.toUpperCase()}] ${item.title}\n*Saved: ${item.date}*\n\n${item.content}\n\n---\n`
      )
      .join('\n');
    const fullText = header + body;

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduGenie-Study-Notes-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Study Deck &amp; Saved Notes</h3>
              <p className="text-xs text-slate-400">
                {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved this session
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Local notes available for revision &amp; export</span>
          <div className="flex items-center gap-2">
            {savedItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export (.md)</span>
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <FileText className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-sm font-medium text-slate-600">No saved notes yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Click the &quot;Save Note&quot; button inside any Q&amp;A, explanation, quiz, summary, or learning path to collect study revision materials here.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1">
                      {item.type}
                    </span>
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyItem(item.id, item.content)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Copy note"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-line line-clamp-4 font-mono">
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
          >
            Close Notes
          </button>
        </div>
      </div>
    </div>
  );
};
