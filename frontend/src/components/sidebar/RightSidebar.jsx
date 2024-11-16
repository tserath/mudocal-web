// src/components/sidebar/RightSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Search, Tag, ChevronRight } from 'lucide-react';
import SearchTab from './SearchTab';
import TagsTab from './TagsTab';

const RightSidebar = ({ entries, openEntries, onOpenEntry, onUpdateEntry }) => {
  const [activeTab, setActiveTab] = useState('tags');
  const [activeDocument, setActiveDocument] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const activeEntry = Array.from(openEntries.values()).reduce((highest, current) => {
      if (!highest) return current;
      const highestZ = highest.windowState?.zIndex || 0;
      const currentZ = current.windowState?.zIndex || 0;
      return currentZ > highestZ ? current : highest;
    }, null);

    setActiveDocument(activeEntry);
  }, [openEntries]);

  return (
    <div className={`relative flex flex-col bg-primary dark:bg-primary-dark border-l border-border dark:border-border-dark transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-80'}`}>
      <div className="flex items-center p-4 border-b border-border dark:border-border-dark">
        {!isCollapsed ? (
          <>
            <div className="flex gap-2 flex-1">
              <TabButton 
                icon={Tag}
                label="Tags"
                isActive={activeTab === 'tags'}
                onClick={() => setActiveTab('tags')}
              />
              <TabButton 
                icon={Search}
                label="Search"
                isActive={activeTab === 'search'}
                onClick={() => setActiveTab('search')}
              />
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="ml-2 p-1.5 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 rounded-lg bg-secondary/20 dark:bg-secondary-dark/20"
              title="Collapse Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-1.5 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 rounded-lg bg-secondary/20 dark:bg-secondary-dark/20"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-auto">
          {activeTab === 'tags' ? (
            <TagsTab
              activeDocument={activeDocument}
              entries={entries}
              onUpdateEntry={onUpdateEntry}
            />
          ) : (
            <SearchTab
              entries={entries}
              onOpenEntry={onOpenEntry}
            />
          )}
        </div>
      )}
    </div>
  );
};

const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    className={`flex-1 px-4 py-2 flex items-center justify-center gap-2
      ${isActive ? 
        'bg-secondary dark:bg-secondary-dark font-medium' : 
        'hover:bg-secondary/50 dark:hover:bg-secondary-dark/50'
      } transition-smooth`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export default RightSidebar;