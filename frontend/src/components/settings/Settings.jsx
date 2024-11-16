import React from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import Modal from '../shared/Modal';

const Settings = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'system', icon: Monitor, label: 'Use System Theme' },
    { id: 'light', icon: Sun, label: 'Light Theme' },
    { id: 'dark', icon: Moon, label: 'Dark Theme' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Appearance</h3>
          <div className="space-y-2">
            {themes.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth
                  ${theme === id ? 
                    'bg-secondary dark:bg-secondary-dark' : 
                    'hover:bg-secondary/50 dark:hover:bg-secondary-dark/50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;