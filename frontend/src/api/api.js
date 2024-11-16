const API_URL = '/api';

const handleResponse = async (response) => {
  const text = await response.text();

  if (!response.ok) {
    let error;
    try {
      const data = JSON.parse(text);
      error = data.error;
    } catch {
      error = text;
    }
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const deduplicateEntries = (entries) => {
  const uniqueEntries = new Map();
  entries.forEach(([id, entry]) => {
    const existingEntry = uniqueEntries.get(id);
    if (!existingEntry || 
        new Date(entry.modified) > new Date(existingEntry[1].modified)) {
      uniqueEntries.set(id, [id, entry]);
    }
  });
  return Array.from(uniqueEntries.values());
};

export const useApi = () => {
  // Load configuration settings
  const loadConfig = async () => {
    const response = await fetch(`${API_URL}/config`);
    return await handleResponse(response);
  };

  // Save configuration settings
  const saveConfig = async (config) => {
    const response = await fetch(`${API_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await handleResponse(response);
  };

  // Load all journal entries
  const loadAllEntries = async () => {
    const response = await fetch(`${API_URL}/entries`);
    const entries = await handleResponse(response);
    return deduplicateEntries(entries);
  };

  // Save a journal entry with content
  const saveEntry = async (id, entry) => {
    console.log('API saveEntry called with:', { id, entry });
    const response = await fetch(`${API_URL}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, entry }), // Sending complete entry with content
    });
    const result = await handleResponse(response);
    console.log('API saveEntry response:', result);
    return result;
  };

  // Delete a journal entry by ID
  const deleteEntry = async (id, entry) => {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry }),
    });
    return await handleResponse(response);
  };

  return {
    loadConfig,
    saveConfig,
    loadAllEntries,
    saveEntry,
    deleteEntry
  };
};

// Utility function for generating unique IDs for new entries
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};
