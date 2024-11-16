import React, { useRef, useEffect, useCallback } from 'react';

const RichTextEditor = ({ content, onChange }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const contentRef = useRef(content);

  // Update contentRef when content prop changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Update editor content when content prop changes
  useEffect(() => {
    console.log('RichTextEditor content changed:', { content, currentHTML: editorRef.current?.innerHTML });
    const div = editorRef.current;
    if (div && !isInternalChange.current && div.innerHTML !== content) {
      // Save cursor position if editor is focused
      let savedCursor = null;
      if (document.activeElement === div) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          savedCursor = {
            start: selection.getRangeAt(0).startOffset,
            end: selection.getRangeAt(0).endOffset
          };
        }
      }

      // Update content
      div.innerHTML = content || '';

      // Restore cursor position if we had one
      if (savedCursor && document.activeElement === div) {
        try {
          const selection = window.getSelection();
          const range = document.createRange();
          const textNode = div.firstChild || div;
          
          range.setStart(textNode, Math.min(savedCursor.start, textNode.length || 0));
          range.setEnd(textNode, Math.min(savedCursor.end, textNode.length || 0));
          
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          console.warn('Could not restore cursor position:', e);
        }
      }
    }
    isInternalChange.current = false;
  }, [content]); // Now depends on content prop

  const handleInput = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (editorRef.current) {
      isInternalChange.current = true;
      const newContent = editorRef.current.innerHTML;
      contentRef.current = newContent;
      onChange(newContent);
    }
  }, [onChange]);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className="w-full h-full focus:outline-none overflow-auto p-2 bg-primary dark:bg-primary-dark transition-smooth"
      onInput={handleInput}
      onPaste={handleInput}
      onBlur={handleInput}
      onClick={handleClick}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
      onCompositionStart={(e) => e.stopPropagation()}
      onCompositionEnd={(e) => e.stopPropagation()}
    />
  );
};

export default RichTextEditor;
