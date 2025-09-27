import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { ContentRenderer } from './ContentRenderer';
import { callGemini } from '../utils/api';

interface NotesViewProps {
  setLoading: (loading: boolean) => void;
  showPdfPreview: (url: string) => void;
}

export function NotesView({ setLoading, showPdfPreview }: NotesViewProps) {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState<{ data?: string; error?: string } | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setContent({ error: "Please enter a topic." });
      return;
    }
    
    setContent(null);
    const prompt = `Act as an expert tutor for the topic '${topic}'. 1. Search the web for top-rated, public tutorial PDFs and educational web pages. 2. List 3-5 direct links under "## Related Resources". Format each link as: "- [PDF]: Title of Document https://...url..." or "- [Web Page]: Title of Page https://...url...". 3. Write a detailed summary under "## Topic Summary".`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ "google_search": {} }]
    };
    
    const result = await callGemini(payload, setLoading);
    setContent({ data: result });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Find Tutorials & Notes</h2>
            <p className="text-gray-600 mt-1">Get curated content and PDF resources for any topic</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            type="text"
            placeholder="e.g., 'Quantum Physics', 'Machine Learning', 'React Hooks'..."
            className="flex-grow p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 min-h-[500px]"
      >
        {content?.error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200"
          >
            {content.error}
          </motion.div>
        )}
        
        {content?.data && (
          <ContentRenderer content={content.data} onPreviewPdf={showPdfPreview} />
        )}
        
        {!content && (
          <div className="text-center text-gray-400 pt-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Your curated content will appear here...</p>
            <p className="text-sm mt-2">Enter a topic and click Generate to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}