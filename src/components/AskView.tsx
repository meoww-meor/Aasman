import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings2, Mic, AudioLines, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { ContentRenderer } from './ContentRenderer';
import { callGemini } from '../utils/api';

interface AskViewProps {
  setLoading: (loading: boolean) => void;
}

function PlaceholdersAndVanishInput({
  className,
  placeholder,
  onChange,
  onSubmit,
  value,
  setValue,
}: {
  className?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  setValue: (value: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [animating, setAnimating] = useState(false);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
          newData.push({ 
            x: n, 
            y: t, 
            color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]] 
          });
        }
      }
    }
    newDataRef.current = newData.map(({ x, y, color }) => ({ 
      x, 
      y, 
      r: 1, 
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})` 
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev), 
        0
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || value.trim() === '') return;
    vanishAndSubmit();
    onSubmit(e);
  };

  return (
    <form
      className={`relative mx-auto h-14 w-full max-w-2xl overflow-hidden bg-white/80 backdrop-blur-md shadow-xl border border-white/20 transition duration-200 rounded-2xl ${
        value && "bg-gray-50/80"
      } ${className}`}
      onSubmit={handleSubmit}
    >
      <canvas
        className={`pointer-events-none absolute -left-2 top-2 origin-top-left scale-50 transform pr-20 text-base invert filter ${
          !animating ? "opacity-0" : "opacity-100"
        }`}
        ref={canvasRef}
      />
      <input
        placeholder={placeholder}
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange(e);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !animating) {
            vanishAndSubmit();
          }
        }}
        ref={inputRef}
        value={value}
        type="text"
        className={`relative z-50 h-full w-full border-none bg-transparent pl-6 pr-20 text-base text-gray-800 focus:outline-none focus:ring-0 placeholder-gray-500 ${
          animating && "text-transparent"
        }`}
      />
      <button
        disabled={!value}
        type="submit"
        className="absolute right-3 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 transition duration-200 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300"
      >
        <ArrowRight className={`h-4 w-4 ${value ? 'text-white' : 'text-gray-500'}`} />
      </button>
    </form>
  );
}

export function AskView({ setLoading }: AskViewProps) {
  const [value, setValue] = useState("");
  const [content, setContent] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handled by the PlaceholdersAndVanishInput component
  };

  const onSubmit = async (e: React.FormEvent) => {
    if (!value.trim()) return;
    
    const userMessage = value;
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    
    const payload = { contents: [{ parts: [{ text: userMessage }] }] };
    const result = await callGemini(payload, setLoading);
    
    setChatHistory(prev => [...prev, { type: 'ai', content: result }]);
    setContent(result);
  };

  const quickPrompts = [
    "Create a React component",
    "Write a Python script",
    "Make a lesson plan",
    "Explain black holes",
    "Write an essay outline",
    "Debug my code",
    "Plan a presentation",
    "Summarize a topic"
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      {!content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col items-center justify-center gap-8"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Ready to build something amazing?
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Ask me anything - from coding help to creative writing, research assistance to problem solving.
            </p>
          </div>

          <div className="w-full max-w-3xl space-y-6">
            <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-white/30">
              <PlaceholdersAndVanishInput
                placeholder="Ask me anything..."
                className="h-14 w-full max-w-full bg-transparent shadow-none"
                onChange={handleChange}
                onSubmit={onSubmit}
                value={value}
                setValue={setValue}
              />
              
              <div className="flex h-12 w-full items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <Plus className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors" />
                  <span className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    <Settings2 className="size-5" />
                    Tools
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Mic className="size-5 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors" />
                  <span className="bg-gray-200/60 hover:bg-gray-300/60 flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors">
                    <AudioLines className="size-5 text-gray-700" />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {quickPrompts.map((prompt, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setValue(prompt)}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 inline-block cursor-pointer rounded-2xl px-4 py-2 text-sm font-medium tracking-tight transition-all shadow-sm hover:shadow-md"
                >
                  {prompt}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {content && (
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AI Assistant</h2>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setContent('');
                setChatHistory([]);
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </motion.button>
          </div>

          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-4xl ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-md p-4'
                    : 'bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl rounded-bl-md p-6 shadow-lg'
                }`}>
                  {message.type === 'user' ? (
                    <p className="font-medium">{message.content}</p>
                  ) : (
                    <ContentRenderer content={message.content} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="sticky bottom-4">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
              <PlaceholdersAndVanishInput
                placeholder="Continue the conversation..."
                className="h-12 w-full max-w-full bg-transparent shadow-none"
                onChange={handleChange}
                onSubmit={onSubmit}
                value={value}
                setValue={setValue}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}