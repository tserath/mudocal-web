// src/components/MainContent.jsx
import React, { useRef, useState } from 'react';
import MDIWindowManager from './mdi/MDIWindowManager';
import TabbedView from './tabbed/TabbedView';
import EditorToolbar from './editor/EditorToolbar';

const MainContent = ({ entries, onUpdateEntry, onCloseEntry, onNewEntry }) => {
  const [viewMode, setViewMode] = useState('mdi');
  const mdiViewRef = useRef(null);

  console.log('MainContent render:', { 
    viewMode, 
    entriesCount: entries.size,
    entriesArray: Array.from(entries.values()),
    entriesKeys: Array.from(entries.keys())
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-primary dark:bg-primary-dark">
      <div className="flex-none z-10 border-b border-border dark:border-border-dark">
        <EditorToolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          mdiViewRef={mdiViewRef}
          onNewEntry={onNewEntry}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        {viewMode === 'mdi' ? (
          <div className="w-full h-full relative">
            <MDIWindowManager
              ref={mdiViewRef}
              entries={Array.from(entries.values())}
              onUpdateEntry={onUpdateEntry}
              onCloseEntry={onCloseEntry}
            />
          </div>
        ) : (
          <TabbedView
            entries={entries}
            onUpdateEntry={(id, updates) => {
              console.log('TabbedView onUpdateEntry:', { id, updates });
              onUpdateEntry(id, updates);
            }}
            onCloseEntry={(id) => {
              console.log('TabbedView onCloseEntry:', { id });
              onCloseEntry(id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MainContent;