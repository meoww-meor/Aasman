import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { ContentRenderer } from './ContentRenderer';
import { callGemini } from '../utils/api';

interface QPaperViewProps {
  setLoading: (loading: boolean) => void;
}

export function QPaperView({ setLoading }: QPaperViewProps) {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Multiple Choice Questions (MCQ)');
  const [content, setContent] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim() || !numQuestions || parseInt(numQuestions) < 1) return;

    const prompt = `Create a question paper for a high school level on the topic: "${topic}". It should contain exactly ${numQuestions} questions. The difficulty level should be ${difficulty}. The question types should be: ${questionType}. Format the paper clearly with numbered questions. If generating MCQs, provide 4 distinct options labeled A, B, C, D and indicate the correct answer separately at the end of the entire paper in an answer key.`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    
    const result = await callGemini(payload, setLoading);
    setContent(result);
  };

  const downloadPaper = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_Question_Paper.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Build Question Paper</h2>
            <p className="text-gray-600 mt-1">Create professional exam papers instantly</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject/Topic *
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              type="text"
              placeholder="e.g., 'Algebra', 'World War II', 'Cell Biology'"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val) > 0 && parseInt(val) <= 50)) {
                    setNumQuestions(val);
                  }
                }}
                placeholder="5"
                min="1"
                max="50"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              >
                <option>Multiple Choice Questions (MCQ)</option>
                <option>Short Answer Questions</option>
                <option>A mix of all types</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Question Paper
          </motion.button>
        </div>
      </motion.div>

      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Generated Question Paper</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadPaper}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          </div>
          
          <div className="p-8">
            <ContentRenderer content={content} />
          </div>
        </motion.div>
      )}

      {!content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 min-h-[300px] flex items-center justify-center"
        >
          <div className="text-center text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Your question paper will appear here...</p>
            <p className="text-sm mt-2">Fill in the details above and click Generate</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}