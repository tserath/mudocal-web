// src/components/sidebar/LeftSidebar.jsx
import React, { useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import FileList from './FileList';
import { PlusCircle, Calendar as CalendarIcon, FolderOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import FileTree from './FileTree';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import SettingsModal from '../settings/Settings';
import 'react-calendar/dist/Calendar.css';
import '../../styles/calendar.css';
import { format } from 'date-fns';

const ViewToggleButton = ({ view, currentView, onClick, icon: Icon }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(view);
    }}
    className={`flex-1 px-4 py-2 flex items-center justify-center gap-2
      ${currentView === view ? 
        'bg-secondary dark:bg-secondary-dark font-medium' : 
        'hover:bg-secondary/50 dark:hover:bg-secondary-dark/50'}`}
  >
    <Icon size={18} />
    <span>{view === 'calendar' ? 'Calendar' : 'Files'}</span>
  </button>
);

const LeftSidebar = ({ 
  selectedDate, 
  onDateSelect, 
  onNewEntry, 
  entries, 
  onOpenEntry,
  onRenameEntry,
  onDeleteEntry 
}) => {
  const [currentView, setCurrentView] = useState('calendar');
  const [contextMenuPos, setContextMenuPos] = useState(null);
  const [contextMenuDate, setContextMenuDate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleContextMenu = useCallback((e, date) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.pageX, y: e.pageY });
    setContextMenuDate(date);
  }, []);

  const handleNewEntry = useCallback((e) => {
    e?.stopPropagation();
    if (contextMenuDate) {
      onNewEntry(contextMenuDate);
    }
    setContextMenuPos(null);
    setContextMenuDate(null);
  }, [contextMenuDate, onNewEntry]);

  const handleDateChange = useCallback((date) => {
    if (typeof onDateSelect === 'function') {
      onDateSelect(date);
    }
  }, [onDateSelect]);

  return (
    <div 
      className={`relative flex flex-col bg-primary dark:bg-primary-dark border-r border-border dark:border-border-dark transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-80'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center p-4 border-b border-border dark:border-border-dark">
        {!isCollapsed ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(true);
              }}
              className="p-1.5 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 rounded-lg bg-secondary/20 dark:bg-secondary-dark/20 mr-2"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1 flex-1" onClick={(e) => e.stopPropagation()}>
              <ViewToggleButton
                view="calendar"
                currentView={currentView}
                onClick={(view) => {
                  setCurrentView(view);
                }}
                icon={CalendarIcon}
              />
              <ViewToggleButton
                view="files"
                currentView={currentView}
                onClick={(view) => {
                  setCurrentView(view);
                }}
                icon={FolderOpen}
              />
            </div>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(false);
            }}
            className="w-full p-1.5 hover:bg-secondary/50 dark:hover:bg-secondary-dark/50 rounded-lg bg-secondary/20 dark:bg-secondary-dark/20"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {currentView === 'calendar' ? (
            <>
              <div className="p-4" onClick={(e) => e.stopPropagation()}>
                <div className="calendar-container">
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    className="w-full rounded-lg shadow-sm calendar-custom"
                    nextLabel={<span className="text-lg">›</span>}
                    prevLabel={<span className="text-lg">‹</span>}
                    next2Label={null}
                    prev2Label={null}
                    navigationLabel={({ date }) => format(date, 'MMMM yyyy')}
                    minDetail="month"
                    showNavigation={true}
                    onClickDay={(value, event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleDateChange(value);
                    }}
                    tileContent={({ date }) => (
                      <div
                        className="absolute inset-0"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleContextMenu(e, date);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  />
                </div>
              </div>

              <div 
                className="flex-1 overflow-auto px-4 pb-4" 
                onClick={(e) => e.stopPropagation()}
              >
                <FileList
                  date={selectedDate}
                  entries={entries}
                  onOpenEntry={onOpenEntry}
                  onRenameEntry={onRenameEntry}
                  onDeleteEntry={onDeleteEntry}
                />
              </div>
            </>
          ) : (
            <div 
              className="flex-1 overflow-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <FileTree
                entries={entries}
                onOpenEntry={onOpenEntry}
                onRenameEntry={onRenameEntry}
                onDeleteEntry={onDeleteEntry}
              />
            </div>
          )}
        </div>
      )}

      {!isCollapsed && (
        <div 
          className="p-4 border-t border-border dark:border-border-dark"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(true);
            }}
            className="w-full px-4 py-2 flex items-center justify-center gap-2 rounded
                     bg-secondary dark:bg-secondary-dark
                     hover:bg-accent dark:hover:bg-accent-dark hover:text-white
                     transition-smooth"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      )}

      {contextMenuPos && (
        <ContextMenu x={contextMenuPos.x} y={contextMenuPos.y} onClose={() => setContextMenuPos(null)}>
          <ContextMenuItem icon={PlusCircle} onClick={handleNewEntry}>
            New Entry
          </ContextMenuItem>
        </ContextMenu>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default LeftSidebar;