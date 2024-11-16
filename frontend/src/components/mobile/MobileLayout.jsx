import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { IoCalendarOutline, IoSearchOutline, IoSettingsOutline, IoAddOutline } from 'react-icons/io5';
import MobileEditor from './MobileEditor';
import MobileCalendar from './MobileCalendar';
import MobileSearch from './MobileSearch';
import MobileSettings from './MobileSettings';

const DocumentList = ({ entries, onEntrySelect }) => {
  const formatDate = (dateString) => {
    try {
      if (!dateString) return format(new Date(), 'PPP');
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'PPP');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    // Create a temporary div to hold the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Get the text content without HTML tags
    return temp.textContent || temp.innerText || '';
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {entries.size === 0 ? (
        <div className="bg-secondary dark:bg-secondary-dark rounded-lg p-4">
          <p className="text-text-muted dark:text-text-muted-dark">No entries for this date</p>
        </div>
      ) : (
        Array.from(entries.values()).map(entry => (
          <div
            key={entry.id}
            className="p-4 bg-secondary dark:bg-secondary-dark rounded-lg cursor-pointer hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-smooth"
            onClick={() => onEntrySelect(entry)}
          >
            <h3 className="text-lg font-semibold mb-2 text-text dark:text-text-dark">
              {entry.title || formatDate(entry.created)}
            </h3>
            <p className="text-text-muted dark:text-text-muted-dark line-clamp-2">
              {stripHtml(entry.content) || 'No content'}
            </p>
            {entry.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm rounded-full bg-[#e5e7eb]/50 dark:bg-[#2C2E33]/10 text-[#6b7280] dark:text-[#909296]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const MobileLayout = ({ 
  availableEntries,
  selectedDate,
  onDateChange,
  onEntrySelect,
  onUpdateEntry,
  onSearch,
  onOpenSettings 
}) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const getEntriesForDate = (date) => {
    const filtered = new Map();
    Array.from(availableEntries.entries()).forEach(([id, entry]) => {
      const entryDate = new Date(entry.created);
      if (entryDate.toDateString() === date.toDateString()) {
        filtered.set(id, entry);
      }
    });
    return filtered;
  };

  const handleDateChange = (date) => {
    onDateChange(date);
    setActiveTab('documents'); 
  };

  const handleEntrySelect = (entry) => {
    setEditingEntry(entry);
    setIsEditing(true);
  };

  if (isEditing) {
    const currentEntry = availableEntries.get(editingEntry?.id) || editingEntry;
    return (
      <MobileEditor
        entry={currentEntry}
        onSave={(updatedEntry) => {
          onUpdateEntry(updatedEntry.id, updatedEntry);
        }}
        onClose={() => {
          setIsEditing(false);
          setEditingEntry(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-primary dark:bg-primary-dark text-text dark:text-text-dark">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        {activeTab === 'documents' && (
          <div className="relative h-full">
            <DocumentList
              entries={getEntriesForDate(selectedDate)}
              onEntrySelect={handleEntrySelect}
            />
            {/* Floating Action Button */}
            <button
              onClick={() => {
                const newEntry = {
                  id: crypto.randomUUID(),
                  title: '',
                  content: '',
                  created: selectedDate.toISOString(),
                  tags: []
                };
                onUpdateEntry(newEntry.id, newEntry);
                handleEntrySelect(newEntry);
              }}
              className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#dee5f5]/90 hover:bg-[#dee5f5] dark:bg-[#25262b]/90 dark:hover:bg-[#25262b] text-text dark:text-text-dark shadow-lg flex items-center justify-center z-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-label="Add new entry"
            >
              <IoAddOutline className="w-8 h-8" />
            </button>
          </div>
        )}
        {activeTab === 'calendar' && (
          <MobileCalendar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onClose={() => setActiveTab('documents')}
            availableEntries={availableEntries}
          />
        )}
        {activeTab === 'search' && (
          <MobileSearch
            entries={availableEntries}
            onEntrySelect={handleEntrySelect}
            onClose={() => setActiveTab('documents')}
          />
        )}
        {activeTab === 'settings' && (
          <MobileSettings
            onClose={() => setActiveTab('documents')}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around border-t border-border dark:border-border-dark bg-secondary dark:bg-secondary-dark p-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'documents'
              ? 'text-[#2C2E33] dark:text-[#e5e7eb] bg-accent/10 dark:bg-[#2C2E33]/50'
              : 'text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark'
          }`}
        >
          <IoCalendarOutline className="w-6 h-6" />
          <span className="text-xs mt-1">Today</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'calendar'
              ? 'text-[#2C2E33] dark:text-[#e5e7eb] bg-accent/10 dark:bg-[#2C2E33]/50'
              : 'text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark'
          }`}
        >
          <IoCalendarOutline className="w-6 h-6" />
          <span className="text-xs mt-1">Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'search'
              ? 'text-[#2C2E33] dark:text-[#e5e7eb] bg-accent/10 dark:bg-[#2C2E33]/50'
              : 'text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark'
          }`}
        >
          <IoSearchOutline className="w-6 h-6" />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === 'settings'
              ? 'text-[#2C2E33] dark:text-[#e5e7eb] bg-accent/10 dark:bg-[#2C2E33]/50'
              : 'text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark'
          }`}
        >
          <IoSettingsOutline className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default MobileLayout;
