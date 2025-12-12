

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PostDraft, FacebookUser, FacebookPage } from './types';

interface AppContextType {
  history: PostDraft[];
  addToHistory: (draft: PostDraft) => void;
  currentDraft: PostDraft | null;
  setCurrentDraft: (draft: PostDraft | null) => void;
  clearHistory: () => void;
  fbUser: FacebookUser | null;
  setFbUser: (user: FacebookUser | null) => void;
  fbPages: FacebookPage[];
  setFbPages: (pages: FacebookPage[]) => void;
  selectedPage: FacebookPage | null;
  setSelectedPage: (page: FacebookPage | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<PostDraft[]>(() => {
    const saved = localStorage.getItem('socialai_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentDraft, setCurrentDraft] = useState<PostDraft | null>(null);
  
  // Facebook State
  const [fbUser, setFbUser] = useState<FacebookUser | null>(null);
  const [fbPages, setFbPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);

  useEffect(() => {
    localStorage.setItem('socialai_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (draft: PostDraft) => {
    setHistory(prev => [draft, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <AppContext.Provider value={{
      history,
      addToHistory,
      currentDraft,
      setCurrentDraft,
      clearHistory,
      fbUser,
      setFbUser,
      fbPages,
      setFbPages,
      selectedPage,
      setSelectedPage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
