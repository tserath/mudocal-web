// src/components/sidebar/FileTree.jsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import ContextMenu, { ContextMenuItem } from './ContextMenu';

const FileTree = ({ entries, onOpenEntry, onRenameEntry, onDeleteEntry }) => {
  const [structure, setStructure] = useState({});
  const [expanded, setExpanded] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const newStructure = {};
    
    Array.from(entries.values()).forEach((entry) => {
      if (!entry.created) return;
      
      const date = new Date(entry.created);
      if (isNaN(date.getTime())) return;
      
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      const day = date.getDate().toString().padStart(2, '0');
      
      if (!newStructure[year]) newStructure[year] = {};
      if (!newStructure[year][month]) newStructure[year][month] = {};
      if (!newStructure[year][month][day]) newStructure[year][month][day] = [];
      
      newStructure[year][month][day].push(entry);
    });
    
    setStructure(newStructure);
    
    // Auto-expand current year
    const currentYear = new Date().getFullYear();
    if (newStructure[currentYear]) {
      setExpanded(prev => ({ ...prev, [currentYear]: true }));
    }
  }, [entries]);

  const TreeNode = ({ label, children, nodeKey, level = 0 }) => (
    <div className="select-none">
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-secondary 
                   dark:hover:bg-secondary-dark rounded cursor-pointer transition-smooth"
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => setExpanded(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }))}
      >
        {children && (
          expanded[nodeKey] ? 
            <ChevronDown className="w-4 h-4 text-text-muted dark:text-text-muted-dark" /> :
            <ChevronRight className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />
        )}
        <span className="text-sm">{label}</span>
      </div>
      {expanded[nodeKey] && children}
    </div>
  );

  const formatFileTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 text-sm">
      {Object.entries(structure).sort((a, b) => b[0] - a[0]).map(([year, months]) => (
        <TreeNode key={year} label={year} nodeKey={year} level={0}>
          <div>
            {Object.entries(months).map(([month, days]) => (
              <TreeNode key={`${year}-${month}`} label={month} nodeKey={`${year}-${month}`} level={1}>
                <div>
                  {Object.entries(days).sort((a, b) => b[0] - a[0]).map(([day, dayEntries]) => (
                    <TreeNode 
                      key={`${year}-${month}-${day}`} 
                      label={day}
                      nodeKey={`${year}-${month}-${day}`}
                      level={2}
                    >
                      <div>
                        {dayEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center gap-2 px-2 py-1 hover:bg-secondary 
                                     dark:hover:bg-secondary-dark rounded cursor-pointer transition-smooth"
                            style={{ paddingLeft: `${4 * 16}px` }}
                            onClick={() => onOpenEntry(entry)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({
                                x: e.pageX,
                                y: e.pageY,
                                entry
                              });
                            }}
                          >
                            <FileText className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />
                            <div className="flex-1 truncate">
                              <span className="font-medium">{entry.title || 'Untitled'}</span>
                              <span className="text-text-muted dark:text-text-muted-dark ml-2">
                                {formatFileTime(entry.created)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TreeNode>
                  ))}
                </div>
              </TreeNode>
            ))}
          </div>
        </TreeNode>
      ))}

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} />
      )}

      <ConfirmationDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          onDeleteEntry(showDeleteConfirm.id);
          setShowDeleteConfirm(null);
        }}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${showDeleteConfirm?.title || 'Untitled'}"?`}
      />
    </div>
  );
};

export default FileTree;