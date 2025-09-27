import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Trophy, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { callGemini } from '../utils/api';

interface QuizViewProps {
  setLoading: (loading: boolean) => void;
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export function QuizView({ setLoading }: QuizViewProps) {
  const [topic, setTopic] = useState('');
  const [section, setSection] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('Medium');
  const [quizData, setQuizData] = useState<Question[] | { error: string } | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!topic.trim() || !numQuestions || parseInt(numQuestions) < 1) return;
    
    setQuizData(null);
    setSubmitted(false);
    setUserAnswers({});

    let prompt = `Generate a ${numQuestions}-question multiple-choice quiz about "${topic}".`;
    if (section.trim()) {
      prompt += ` Focus specifically on the section: "${section}".`;
    }
    prompt += ` The difficulty level should be '${difficulty}'.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            questions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  questionText: { type: "STRING" },
                  options: { type: "ARRAY", items: { type: "STRING" } },
                  correctAnswerIndex: { type: "NUMBER" },
                  explanation: { type: "STRING" }
                }
              }
            }
          }
        }
      }
    };

    const resultText = await callGemini(payload, setLoading);
    
    try {
      const resultJson = JSON.parse(resultText);
      if (!resultJson.questions || resultJson.questions.length === 0) {
        throw new Error("No questions generated.");
      }
      setQuizData(resultJson.questions);
    } catch (e) {
      setQuizData({ 
        error: "Failed to create quiz. The AI's response was not in the correct format." 
      });
    }
  };

  const score = useMemo(() => {
    if (!Array.isArray(quizData)) return 0;
    return quizData.reduce((acc, q, i) => 
      acc + (userAnswers[i] === q.correctAnswerIndex ? 1 : 0), 0
    );
  }, [submitted, userAnswers, quizData]);

  const resetQuiz = () => {
    setQuizData(null);
    setSubmitted(false);
    setUserAnswers({});
  };

  if (submitted && Array.isArray(quizData)) {
    const percentage = Math.round((score / quizData.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20"
        >
          <div className="mb-6">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${percentage >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h4 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h4>
            <p className="text-xl text-gray-600">Your Score</p>
          </div>
          
          <div className="mb-8">
            <div className={`text-6xl font-extrabold mb-2 ${
              percentage >= 80 ? 'text-green-600' : 
              percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {score} / {quizData.length}
            </div>
            <div className={`text-2xl font-semibold ${
              percentage >= 80 ? 'text-green-600' : 
              percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {percentage}%
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetQuiz}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Take Another Quiz
          </motion.button>
        </motion.div>

        <div className="space-y-4">
          {quizData.map((q, i) => {
            const isCorrect = userAnswers[i] === q.correctAnswerIndex;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border-2 ${
                  isCorrect 
                    ? 'bg-green-50/80 border-green-200' 
                    : 'bg-red-50/80 border-red-200'
                } backdrop-blur-md`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-800 mb-3">
                      {i + 1}. {q.questionText}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        <strong>Your answer:</strong> {q.options[userAnswers[i]] ?? 'N/A'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-800">
                          <strong>Correct answer:</strong> {q.options[q.correctAnswerIndex]}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-gray-100/80 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (quizData && !('error' in quizData)) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Quiz: {topic}</h2>
          </div>

          <div className="space-y-8">
            <AnimatePresence>
              {quizData.map((q, qIndex) => (
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qIndex * 0.1 }}
                  className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl"
                >
                  <p className="font-semibold text-lg mb-4 text-gray-800">
                    {qIndex + 1}. {q.questionText}
                  </p>
                  
                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <motion.label
                        key={oIndex}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          userAnswers[qIndex] === oIndex
                            ? 'bg-indigo-100 border-indigo-400 shadow-md'
                            : 'bg-white/70 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q${qIndex}`}
                          onChange={() => setUserAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700 font-medium">{option}</span>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSubmitted(true)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg text-lg"
            >
              Submit Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Create AI Quiz</h2>
            <p className="text-gray-600 mt-1">Test your knowledge on any subject</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Topic *
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              type="text"
              placeholder="e.g., 'History of India', 'JavaScript Fundamentals'"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Section (Optional)
            </label>
            <input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              type="text"
              placeholder="e.g., 'Mughal Empire', 'React Hooks'"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val) > 0 && parseInt(val) <= 20)) {
                    setNumQuestions(val);
                  }
                }}
                placeholder="5"
                min="1"
                max="20"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateQuiz}
            disabled={!topic.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Quiz
          </motion.button>

          {quizData && 'error' in quizData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200"
            >
              {quizData.error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}