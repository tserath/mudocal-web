// src/components/mdi/MDIWindow.jsx
import React, { useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Edit2, Maximize2, Minimize2, X } from 'lucide-react';
import RichTextEditor from '../editor/RichTextEditor';
import WindowHeader from './WindowHeader';

const MDIWindow = ({
  id,
  entry,
  isMinimized,
  minimizedPosition,
  maxZIndex,
  onActivate,
  onMinimize,
  onRestore,
  onMaximize,
  onRestoreFromMaximize,
  onUpdateState,
  onClose
}) => {
  const containerRef = useRef(null);

  console.log('MDIWindow render:', {
    id,
    entry,
    isMinimized,
    minimizedPosition,
    maxZIndex,
    windowState: entry.windowState
  });

  const handleContentChange = (newContent) => {
    console.log('MDIWindow content change:', { id, newContent });
    onUpdateState(id, {
      content: newContent,
      modified: new Date().toISOString()
    });
  };

  // Function to ensure window stays within bounds
  const ensureInBounds = (x, y, width, height) => {
    if (!containerRef.current) return { x, y };
    
    const container = containerRef.current.parentElement;
    if (!container) return { x, y };
    
    const containerRect = container.getBoundingClientRect();
    const minX = 0;
    const minY = 0;
    const maxX = Math.max(0, containerRect.width - width);
    const maxY = Math.max(0, containerRect.height - height);
    
    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY)
    };
  };

  if (isMinimized) {
    const position = minimizedPosition || { x: 0, y: 0 };
    return (
      <Rnd
        position={{ x: position.x, y: position.y }}
        size={{ width: 160, height: 32 }}
        style={{ 
          zIndex: maxZIndex,
          position: 'absolute',
          display: 'flex',
          visibility: 'visible',
          backgroundColor: 'transparent'
        }}
        enableResizing={false}
        onDragStop={(e, d) => {
          const { x, y } = ensureInBounds(d.x, d.y, 160, 32);
          onUpdateState(id, { x, y });
        }}
      >
        <div
          className="w-full h-full flex items-center gap-2 px-2 
            bg-gray-100 dark:bg-gray-700
            hover:bg-gray-200 dark:hover:bg-gray-600
            rounded shadow-md 
            border border-gray-200 dark:border-gray-600
            transition-smooth cursor-pointer"
          onClick={(e) => {
            // Prevent click event when dragging ends
            if (e.detail === 2) { // Double click
              onRestore(id);
            }
          }}
        >
          <Edit2 className="w-4 h-4 flex-none" />
          <span className="flex-1 truncate text-sm">
            {entry.title || 'Untitled'}
          </span>
        </div>
      </Rnd>
    );
  }

  return (
    <Rnd
      ref={containerRef}
      position={{ x: entry.windowState?.x || 0, y: entry.windowState?.y || 0 }}
      size={{ 
        width: entry.windowState?.width || 400, 
        height: entry.windowState?.height || 300 
      }}
      minWidth={200}
      minHeight={100}
      style={{ 
        zIndex: entry.windowState?.zIndex || 0,
        position: 'absolute',
        display: 'flex',
        visibility: 'visible',
        backgroundColor: 'transparent',
        pointerEvents: 'auto'
      }}
      onDragStart={() => onActivate(id)}
      onResizeStart={() => onActivate(id)}
      enableResizing={!entry.windowState?.isMaximized}
      disableDragging={entry.windowState?.isMaximized}
      onDragStop={(e, d) => {
        const { x, y } = ensureInBounds(
          d.x, 
          d.y, 
          entry.windowState?.width || 400,
          entry.windowState?.height || 300
        );
        onUpdateState(id, { x, y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const width = parseInt(ref.style.width);
        const height = parseInt(ref.style.height);
        const { x, y } = ensureInBounds(position.x, position.y, width, height);
        onUpdateState(id, { width, height, x, y });
      }}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
    >
      <div className="w-full h-full flex flex-col bg-primary dark:bg-primary-dark rounded-lg shadow-lg border border-border dark:border-border-dark overflow-hidden" onClick={() => onActivate(id)}>
        <div className="window-drag-handle flex items-center justify-between p-2 bg-secondary dark:bg-secondary-dark border-b border-border dark:border-border-dark">
          <span className="text-sm font-medium truncate">{entry.title || 'Untitled'}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => onMinimize(id)} className="p-1 hover:bg-primary dark:hover:bg-primary-dark rounded">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={() => entry.windowState?.isMaximized ? onRestoreFromMaximize(id) : onMaximize(id)} className="p-1 hover:bg-primary dark:hover:bg-primary-dark rounded">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={() => onClose(id)} className="p-1 hover:bg-primary dark:hover:bg-primary-dark rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <RichTextEditor
            content={entry.content || ''}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </Rnd>
  );
};

export default MDIWindow;