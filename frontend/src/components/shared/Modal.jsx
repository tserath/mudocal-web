import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions,
  width = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-primary dark:bg-primary-dark rounded-lg shadow-xl ${width} max-w-[90vw]`}>
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary dark:hover:bg-secondary-dark rounded-lg
              text-text-muted dark:text-text-muted-dark transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">{children}</div>
        
        {actions && (
          <div className="flex justify-end gap-3 px-6 pb-6">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const ModalAction = ({ 
  onClick, 
  variant = 'secondary',
  children 
}) => {
  const baseClasses = "px-4 py-2 rounded-md transition-smooth";
  const variants = {
    primary: "bg-accent hover:bg-accent-hover text-white",
    secondary: "bg-secondary hover:bg-secondary-dark dark:bg-secondary-dark dark:hover:bg-accent-hover-dark",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Modal;