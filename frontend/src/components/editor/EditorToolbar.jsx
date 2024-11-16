// src/components/editor/EditorToolbar.jsx
import React from 'react';
import { 
  Layout, LayoutGrid, Minimize,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3,
  Superscript, Subscript,
  List, ListOrdered,
  Quote, Code, Link, Image,
  PlusCircle, ArrowDownWideNarrow
} from 'lucide-react';

const ToolbarButton = ({ icon: Icon, title, onClick }) => (
  <button
    className="p-1.5 rounded hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
    title={title}
    onClick={onClick}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const EditorToolbar = ({ viewMode, setViewMode, mdiViewRef, onNewEntry }) => {
  console.log('EditorToolbar render:', { viewMode });

  const handleFormatText = (format, value) => {
    document.execCommand(format, false, value);
  };
  
  return (
    <div className="w-full flex items-center p-2 gap-4 bg-primary dark:bg-primary-dark">
      {/* New Entry button */}
      <div className="flex items-center gap-1 border-r border-border dark:border-border-dark pr-2">
        <ToolbarButton 
          icon={PlusCircle} 
          title="New Entry" 
          onClick={onNewEntry} 
        />
      </div>

      {/* Editor toolbar section */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-1 border-r border-border dark:border-border-dark pr-2">
          <ToolbarButton icon={Bold} title="Bold" onClick={() => handleFormatText('bold')} />
          <ToolbarButton icon={Italic} title="Italic" onClick={() => handleFormatText('italic')} />
          <ToolbarButton icon={Underline} title="Underline" onClick={() => handleFormatText('underline')} />
          <ToolbarButton icon={Strikethrough} title="Strikethrough" onClick={() => handleFormatText('strikethrough')} />
        </div>

        <div className="flex items-center gap-1 border-r border-border dark:border-border-dark pr-2">
          <ToolbarButton icon={AlignLeft} title="Align Left" onClick={() => handleFormatText('justifyLeft')} />
          <ToolbarButton icon={AlignCenter} title="Center" onClick={() => handleFormatText('justifyCenter')} />
          <ToolbarButton icon={AlignRight} title="Align Right" onClick={() => handleFormatText('justifyRight')} />
        </div>

        <div className="flex items-center gap-1 border-r border-border dark:border-border-dark pr-2">
          <ToolbarButton icon={Heading1} title="Heading 1" onClick={() => handleFormatText('formatBlock', '<h1>')} />
          <ToolbarButton icon={Heading2} title="Heading 2" onClick={() => handleFormatText('formatBlock', '<h2>')} />
          <ToolbarButton icon={Heading3} title="Heading 3" onClick={() => handleFormatText('formatBlock', '<h3>')} />
        </div>

        <div className="flex items-center gap-1 border-r border-border dark:border-border-dark pr-2">
          <ToolbarButton icon={Superscript} title="Superscript" onClick={() => handleFormatText('superscript')} />
          <ToolbarButton icon={Subscript} title="Subscript" onClick={() => handleFormatText('subscript')} />
        </div>

        <div className="flex items-center gap-1 border-r border-border dark:border-border-dark pr-2">
          <ToolbarButton icon={List} title="Bullet List" onClick={() => handleFormatText('insertUnorderedList')} />
          <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => handleFormatText('insertOrderedList')} />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton icon={Quote} title="Quote" onClick={() => handleFormatText('formatBlock', '<blockquote>')} />
          <ToolbarButton icon={Code} title="Code" onClick={() => handleFormatText('formatBlock', '<pre>')} />
          <ToolbarButton icon={Link} title="Link" onClick={() => handleFormatText('createLink')} />
          <ToolbarButton icon={Image} title="Image" onClick={() => handleFormatText('insertImage')} />
        </div>
      </div>

      {/* View controls - right side */}
      <div className="flex items-center gap-2 min-w-[200px] border-l border-border dark:border-border-dark pl-4">
        <ToolbarButton 
          icon={Layout} 
          title="Switch View Mode" 
          onClick={() => setViewMode(viewMode === 'mdi' ? 'tabbed' : 'mdi')} 
        />

        {viewMode === 'mdi' && (
          <div className="flex items-center gap-2">
            <ToolbarButton
              icon={LayoutGrid}
              title="Tile Windows"
              onClick={() => mdiViewRef.current?.tileWindows()}
            />
            <ToolbarButton
              icon={ArrowDownWideNarrow}
              title="Cascade Windows"
              onClick={() => mdiViewRef.current?.cascadeWindows()}
            />
            <ToolbarButton
              icon={Minimize}
              title="Minimize All"
              onClick={() => mdiViewRef.current?.minimizeAll()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;