'use client'

import { IndexedDBManager } from '@/app/utils/IndexedDBManager';
import { logger } from '@/app/utils/logger';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Define storage instances
export const savedSellersStorage = new IndexedDBManager("ebextractor", 'saved_sellers');
export const savedSearchesStorage = new IndexedDBManager("ebextractor", 'saved_searches');
export const savedItemsStorage = new IndexedDBManager("ebextractor", 'saved_items');

// Context type
interface IndexedDBContextType {
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
  savedSellersStorage: IndexedDBManager;
  savedSearchesStorage: IndexedDBManager;
  savedItemsStorage: IndexedDBManager;
}

// Create context
const IndexedDBContext = createContext<IndexedDBContextType | undefined>(undefined);

// Provider props
interface IndexedDBProviderProps {
  children: ReactNode;
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

export const IndexedDBProvider: React.FC<IndexedDBProviderProps> = ({ 
  children, 
  onInitialized,
  onError 
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Initialize by making a simple count call on each storage
        // This triggers the database creation with all stores
        await Promise.all([
          savedSellersStorage.count(),
          savedSearchesStorage.count(),
          savedItemsStorage.count(),
        ]);

        setIsReady(true);
        setIsInitializing(false);
        onInitialized?.();
        
        logger.debug.log('✅ IndexedDB initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize IndexedDB';
        setError(errorMessage);
        setIsInitializing(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        
        logger.debug.error('❌ IndexedDB initialization failed:', err);
      }
    };

    initializeDB();

  }, [onInitialized, onError]);

  const value: IndexedDBContextType = {
    isReady,
    isInitializing,
    error,
    savedSellersStorage: savedSellersStorage,
    savedSearchesStorage: savedSearchesStorage,
    savedItemsStorage: savedItemsStorage,
  };

  return (
    <IndexedDBContext.Provider value={value}>
      {children}
    </IndexedDBContext.Provider>
  );
};

// Custom hook to use IndexedDB
export const useIndexedDB = () => {
  const context = useContext(IndexedDBContext);
  
  if (context === undefined) {
    throw new Error('useIndexedDB must be used within an IndexedDBProvider');
  }
  
  return context;
};

// Convenience hooks for specific stores
export const useSellersStorage = () => {
  const { savedSellersStorage, isReady } = useIndexedDB();
  return { savedSellersStorage, isReady };
};

export const useSearchesStorage = () => {
  const { savedSearchesStorage, isReady } = useIndexedDB();
  return { savedSearchesStorage, isReady };
};

export const useItemsStorage = () => {
  const { savedItemsStorage, isReady } = useIndexedDB();
  return { savedItemsStorage, isReady };
};

export default IndexedDBProvider;