// src/components/sidebar/ContextMenu.jsx
import React, { useEffect, useCallback } from 'react';

const ContextMenu = ({ x, y, onClose, children }) => {
  const handleClick = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
    };
  }, [handleClick]);

  return (
    <div 
      className="fixed bg-primary dark:bg-primary-dark rounded-lg shadow-lg 
                 border border-border dark:border-border-dark py-1 z-[9999]"
      style={{ left: `${x}px`, top: `${y}px`, minWidth: '160px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const ContextMenuItem = ({ onClick, children, icon: Icon, variant = 'default' }) => {
  const variants = {
    default: 'text-text dark:text-text-dark',
    danger: 'text-red-600 dark:text-red-400'
  };

  return (
    <button
      className={`w-full px-4 py-2 text-left flex items-center gap-2 
                 hover:bg-secondary dark:hover:bg-secondary-dark
                 transition-smooth ${variants[variant]}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};

export default ContextMenu;