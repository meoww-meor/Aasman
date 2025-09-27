import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';

interface ContentRendererProps {
  content: string;
  onPreviewPdf?: (url: string) => void;
}

export function ContentRenderer({ content, onPreviewPdf }: ContentRendererProps) {
  const parsedContent = useMemo(() => {
    if (!content) return null;

    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <motion.h2
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 text-gray-800"
          >
            {line.substring(3)}
          </motion.h2>
        );
      }

      if (line.startsWith('### ')) {
        return (
          <motion.h3
            key={index}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-xl font-semibold mt-6 mb-3 text-gray-800"
          >
            {line.substring(4)}
          </motion.h3>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="ml-6 list-decimal my-2 text-gray-700"
          >
            {line.substring(line.indexOf(' ') + 1)}
          </motion.li>
        );
      }

      if (line.startsWith('- ')) {
        const linkRegex = /\[(PDF|Web Page)\]:\s(.*?)\s(https?:\/\/[^\s]+)/;
        const match = line.substring(2).match(linkRegex);
        
        if (match) {
          const [, type, title, url] = match;
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="ml-6 list-disc my-3 flex items-start gap-3 flex-wrap"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-800">
                  [{type}] {title}:
                </span>{' '}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-2 transition-colors inline-flex items-center gap-1"
                >
                  {url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {type === 'PDF' && onPreviewPdf && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPreviewPdf(url)}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-all duration-200 flex items-center gap-1 shadow-sm"
                >
                  <FileText className="w-3 h-3" />
                  Preview
                </motion.button>
              )}
            </motion.li>
          );
        }
        
        return (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="ml-6 list-disc my-2 text-gray-700"
          >
            {line.substring(2)}
          </motion.li>
        );
      }

      if (line.trim() === '') {
        return <br key={index} />;
      }

      return (
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="my-2 text-gray-700 leading-relaxed"
        >
          {line}
        </motion.p>
      );
    });
  }, [content, onPreviewPdf]);

  return (
    <div className="prose max-w-none text-gray-700">
      {parsedContent}
    </div>
  );
}