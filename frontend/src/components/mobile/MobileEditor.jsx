import React, { useState, useCallback } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { format, parseISO } from 'date-fns';
import RichTextEditor from '../editor/RichTextEditor';

const MobileEditor = ({ entry, onSave, onClose }) => {
  const [editedEntry, setEditedEntry] = useState(entry);

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

  const handleEditorClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleEditorChange = useCallback((newContent) => {
    const updatedEntry = { ...editedEntry, content: newContent };
    setEditedEntry(updatedEntry);
    onSave(updatedEntry);
  }, [editedEntry, onSave]);

  const handleClose = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  return (
    <div 
      className="flex flex-col h-full bg-primary dark:bg-primary-dark"
      onClick={handleEditorClick}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-secondary dark:bg-secondary-dark border-b border-border dark:border-border-dark">
        <button
          onClick={handleClose}
          className="flex items-center text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark"
        >
          <IoArrowBack className="w-6 h-6 mr-2" />
          Back
        </button>
      </div>

      {/* Editor */}
      <div 
        className="flex-1 p-4" 
        onClick={handleEditorClick}
      >
        <h1 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">
          {editedEntry.title || formatDate(editedEntry.date)}
        </h1>
        <RichTextEditor
          content={editedEntry.content || ''}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default MobileEditor;
