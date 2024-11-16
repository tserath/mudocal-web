// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import LeftSidebar from './components/sidebar/LeftSidebar';
import RightSidebar from './components/sidebar/RightSidebar';
import MainContent from './components/MainContent';
import MobileLayout from './components/mobile/MobileLayout';
import { useApi, generateUUID } from './api/api';
import { ThemeProvider } from './components/theme/ThemeContext';
import { createWindowState } from './config/windowDefaults';

const App = () => {
  const [availableEntries, setAvailableEntries] = useState(new Map());
  const [openEntries, setOpenEntries] = useState(new Map());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const api = useApi();
  const initRef = useRef(false);

  // Create debounced save functions
  const debouncedSaveConfig = useCallback(
    debounce(async (openWindows) => {
      try {
        await api.saveConfig({ openWindows });
      } catch (error) {
        console.error('Error saving config:', error);
      }
    }, 1000),
    [api]
  );

  const debouncedSaveEntry = useCallback(
    debounce(async (id, entry) => {
      console.log('debouncedSaveEntry starting:', { id, entry });
      try {
        const result = await api.saveEntry(id, entry);
        console.log('debouncedSaveEntry result:', result);
      } catch (error) {
        console.error('Error in debouncedSaveEntry:', error);
      }
    }, 500), // Shortened from 1000ms to 500ms for testing
    [api]
  );

  // Initial data load
  useEffect(() => {
    if (initRef.current) return;

    const initializeData = async () => {
      try {
        console.log('Initializing data...');
        const [config, allEntries] = await Promise.all([
          api.loadConfig(),
          api.loadAllEntries()
        ]);

        console.log('Loaded data:', { config, allEntries });

        // Convert array of [id, entry] pairs to Map
        const entriesMap = new Map();
        allEntries.forEach(([id, entry]) => {
          entriesMap.set(id, {
            ...entry,
            id,
            content: entry.content || '', // Explicitly preserve content
            tags: Array.isArray(entry.tags) ? entry.tags : [], // Ensure tags is always an array
            windowState: createWindowState({ offsetIndex: entriesMap.size })
          });
        });

        console.log('Created entries map:', entriesMap);
        setAvailableEntries(entriesMap);

        // Set up open windows from config
        const openOnes = new Map();
        Object.entries(config.openWindows || {}).forEach(([id, windowState], index) => {
          const entry = entriesMap.get(id);
          if (entry) {
            openOnes.set(id, { 
              ...entry,
              windowState: {
                ...createWindowState({ offsetIndex: index }),
                ...windowState
              },
              content: entry.content || '', // Ensure content is preserved
              tags: Array.isArray(entry.tags) ? entry.tags : [] // Ensure tags is always an array
            });
          }
        });

        console.log('Setting open entries:', openOnes);
        setOpenEntries(openOnes);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
    initRef.current = true;
  }, [api]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save window state changes
  useEffect(() => {
    if (!initRef.current) return;

    const openWindows = {};
    openEntries.forEach((entry, id) => {
      if (entry.windowState) {
        openWindows[id] = entry.windowState;
      }
    });
    debouncedSaveConfig(openWindows);
  }, [openEntries, debouncedSaveConfig]);

  const handleNewEntry = useCallback((customDate) => {
    const id = generateUUID();
    const now = customDate || new Date();

    const newEntry = {
      id,
      title: `Entry ${now.toLocaleTimeString()}`,
      content: '',
      created: now.toISOString(),
      modified: now.toISOString(),
      tags: [],
      windowState: createWindowState({
        existingZIndices: Array.from(openEntries.values()).map(e => e.windowState?.zIndex || 0)
      })
    };

    setAvailableEntries(prev => new Map(prev).set(id, newEntry));
    setOpenEntries(prev => new Map(prev).set(id, newEntry));

    const entryForSave = { ...newEntry };
    delete entryForSave.windowState;
    api.saveEntry(id, entryForSave);
  }, [api, openEntries]);

  const handleUpdateEntry = useCallback(async (id, updates) => {
    console.log('handleUpdateEntry called:', { id, updates });
    const currentEntry = openEntries.get(id) || availableEntries.get(id);
    if (!currentEntry) return;

    const updatedEntry = {
      ...currentEntry,
      ...updates,
      modified: new Date().toISOString()
    };

    setAvailableEntries(prev => new Map(prev).set(id, updatedEntry));
    setOpenEntries(prev => prev.has(id) ? new Map(prev).set(id, updatedEntry) : prev);

    const entryForSave = { ...updatedEntry };
    delete entryForSave.windowState;
    if (updates.content !== undefined) {
      entryForSave.content = updates.content;
    }
    debouncedSaveEntry(id, entryForSave);
  }, [availableEntries, openEntries, debouncedSaveEntry]);

  const handleRenameEntry = useCallback((id, newTitle) => {
    handleUpdateEntry(id, { title: newTitle });
  }, [handleUpdateEntry]);

  const handleDeleteEntry = useCallback(async (id) => {
    const entry = availableEntries.get(id);
    if (!entry) return;

    setAvailableEntries(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    setOpenEntries(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    try {
      await api.deleteEntry(id, entry);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }, [api, availableEntries]);

  const handleOpenEntry = useCallback((entry) => {
    if (!entry?.id) return;

    console.log('handleOpenEntry called:', { entry });

    const existingOpenEntry = openEntries.get(entry.id);
    if (existingOpenEntry) {
      console.log('Entry already open, updating z-index:', { existingOpenEntry });
      handleUpdateEntry(entry.id, {
        windowState: {
          ...existingOpenEntry.windowState,
          zIndex: Math.max(...Array.from(openEntries.values()).map(e => e.windowState?.zIndex || 0)) + 1
        }
      });
      return;
    }

    const windowState = createWindowState({
      existingZIndices: Array.from(openEntries.values()).map(e => e.windowState?.zIndex || 0)
    });

    console.log('Opening new entry with windowState:', { windowState });
    setOpenEntries(prev => new Map(prev).set(entry.id, { ...entry, windowState }));
  }, [handleUpdateEntry, openEntries]);

  const handleCloseEntry = useCallback((id) => {
    setOpenEntries(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  return isMobile ? (
    <ThemeProvider>
      <MobileLayout
        availableEntries={availableEntries}
        selectedDate={selectedDate}
        onDateChange={handleDateSelect}
        onEntrySelect={handleOpenEntry}
        onUpdateEntry={handleUpdateEntry}
        onSearch={() => {/* TODO: Implement search */}}
        onOpenSettings={() => {/* TODO: Implement settings */}}
      />
    </ThemeProvider>
  ) : (
    <ThemeProvider>
      <div className="flex h-screen bg-primary dark:bg-primary-dark text-content dark:text-content-dark">
        <LeftSidebar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onNewEntry={handleNewEntry}
          entries={Array.from(availableEntries.values())}
          onOpenEntry={handleOpenEntry}
          onRenameEntry={handleRenameEntry}
          onDeleteEntry={handleDeleteEntry}
        />
        
        <MainContent
          entries={openEntries}
          onUpdateEntry={handleUpdateEntry}
          onCloseEntry={handleCloseEntry}
          onNewEntry={() => handleNewEntry(selectedDate)}
        />

        <RightSidebar
          entries={availableEntries}
          openEntries={openEntries}
          onOpenEntry={handleOpenEntry}
          onUpdateEntry={handleUpdateEntry}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;