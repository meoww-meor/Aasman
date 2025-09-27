import React, { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';

interface RightPaneProps {
  content: { type: 'search' | 'pdf'; url?: string };
  closePane: () => void;
}

export function RightPane({ content, closePane }: RightPaneProps) {
  const paneTitle = content.type === 'search' ? 'Web Search' : 'PDF Preview';

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full md:w-96 border-l border-gray-200/50 bg-white/80 backdrop-blur-md flex flex-col p-4 flex-shrink-0 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">{paneTitle}</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={closePane}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {content.type === 'search' && <WebSearchContent />}
        {content.type === 'pdf' && <PdfPreviewContent url={content.url!} />}
      </div>
    </motion.aside>
  );
}

function WebSearchContent() {
  const [query, setQuery] = useState('');
  const [searchUrl, setSearchUrl] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`);
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search the web..."
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Search className="w-5 h-5" />
        </motion.button>
      </form>
      
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {searchUrl ? (
          <iframe 
            src={searchUrl} 
            className="w-full h-full" 
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <div className="p-8 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Search results will appear here</p>
          </div>
        )}
      </div>
    </Fragment>
  );
}

function PdfPreviewContent({ url }: { url: string }) {
  const gviewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  
  return (
    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <iframe 
        src={gviewUrl} 
        className="w-full h-full" 
        frameBorder="0"
      />
    </div>
  );
}