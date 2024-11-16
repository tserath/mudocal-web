// src/components/tabbed/TabbedView.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import RichTextEditor from '../editor/RichTextEditor';

const TabbedView = ({ entries, onUpdateEntry, onCloseEntry }) => {
  const [activeTabId, setActiveTabId] = useState(null);

  useEffect(() => {
    if (!activeTabId && entries.size > 0) {
      setActiveTabId(Array.from(entries.keys())[0]);
    }
    else if (activeTabId && !entries.has(activeTabId)) {
      const remainingEntries = Array.from(entries.keys());
      setActiveTabId(remainingEntries.length > 0 ? remainingEntries[0] : null);
    }
  }, [entries, activeTabId]);

  if (entries.size === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-muted dark:text-text-muted-dark">
        No open documents
      </div>
    );
  }

  const activeEntry = entries.get(activeTabId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border dark:border-border-dark bg-primary dark:bg-primary-dark">
        <div className="flex-1 flex overflow-x-auto">
          {Array.from(entries.entries()).map(([id, entry]) => (
            <div
              key={id}
              className={`group flex items-center min-w-[150px] max-w-[200px] px-4 py-2 
                cursor-pointer border-r border-border dark:border-border-dark 
                ${activeTabId === id ? 
                  'bg-primary dark:bg-primary-dark' : 
                  'bg-secondary dark:bg-secondary-dark hover:bg-secondary/80 dark:hover:bg-secondary-dark/80'
                } transition-smooth`}
              onClick={() => setActiveTabId(id)}
            >
              <div className="flex-1 truncate">
                <span className="font-medium">{entry.title || 'Untitled'}</span>
              </div>
              <button
                className={`ml-2 p-0.5 rounded hover:bg-secondary dark:hover:bg-secondary-dark 
                  opacity-0 group-hover:opacity-100 transition-smooth
                  ${activeTabId === id ? 'opacity-100' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseEntry(id);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeEntry && (
        <div className="flex-1 p-4 overflow-auto">
          <RichTextEditor
            content={activeEntry.content || ''}
            onChange={(content) => onUpdateEntry(activeTabId, { content })}
          />
        </div>
      )}
    </div>
  );
};

export default TabbedView;