import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Search,
  X,
  Plus,
  Settings2,
  Mic,
  AudioLines
} from 'lucide-react';
import { NotesView } from './components/NotesView';
import { QuizView } from './components/QuizView';
import { QPaperView } from './components/QPaperView';
import { AskView } from './components/AskView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RightPane } from './components/RightPane';
import { Dock } from './components/Dock';
import './App.css';

function App() {
  const [view, setView] = useState('ask');
  const [loading, setLoading] = useState(false);
  const [rightPane, setRightPane] = useState<{ type: 'search' | 'pdf'; url?: string } | null>(null);

  const dockItems = [
    {
      id: 'ask',
      label: 'Ask AI',
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      onClick: () => setView('ask'),
      className: view === 'ask' ? 'bg-indigo-600 border-indigo-400' : ''
    },
    {
      id: 'notes',
      label: 'Tutorials',
      icon: <BookOpen className="w-6 h-6 text-white" />,
      onClick: () => setView('notes'),
      className: view === 'notes' ? 'bg-indigo-600 border-indigo-400' : ''
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: <HelpCircle className="w-6 h-6 text-white" />,
      onClick: () => setView('quiz'),
      className: view === 'quiz' ? 'bg-indigo-600 border-indigo-400' : ''
    },
    {
      id: 'qpaper',
      label: 'Question Paper',
      icon: <FileText className="w-6 h-6 text-white" />,
      onClick: () => setView('qpaper'),
      className: view === 'qpaper' ? 'bg-indigo-600 border-indigo-400' : ''
    }
  ];

  const renderView = () => {
    switch (view) {
      case 'notes': 
        return <NotesView setLoading={setLoading} showPdfPreview={(url) => setRightPane({ type: 'pdf', url })} />;
      case 'quiz': 
        return <QuizView setLoading={setLoading} />;
      case 'qpaper': 
        return <QPaperView setLoading={setLoading} />;
      case 'ask': 
        return <AskView setLoading={setLoading} />;
      default: 
        return <AskView setLoading={setLoading} />;
    }
  };

  const toggleSearchPane = () => {
    if (rightPane?.type === 'search') {
      setRightPane(null);
    } else {
      setRightPane({ type: 'search' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {loading && <LoadingSpinner />}
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4 flex justify-between items-center flex-shrink-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Tutor Pro
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSearchPane}
              className={`p-2 rounded-full transition-all duration-200 ${
                rightPane?.type === 'search' 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-6 overflow-y-auto">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </main>
          
          <AnimatePresence>
            {rightPane && (
              <RightPane 
                content={rightPane} 
                closePane={() => setRightPane(null)} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* Dock Navigation */}
        <div className="relative">
          <Dock items={dockItems} />
        </div>
      </div>
    </div>
  );
}

export default App;