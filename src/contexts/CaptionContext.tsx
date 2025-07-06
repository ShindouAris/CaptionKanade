import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Caption, CaptionFilter, User, UserQuota } from '../types/Caption';

interface CaptionContextType {
  captions: Caption[];
  addCaption: (caption: Omit<Caption, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  deleteCaption: (id: string) => void;
  toggleFavorite: (id: string) => void;
  filteredCaptions: Caption[];
  filter: CaptionFilter;
  setFilter: (filter: Partial<CaptionFilter>) => void;
  availableTags: string[];
  exportCaptions: () => string;
  importCaptions: (data: string) => void;
  user: User;
  updateUserQuota: () => void;
  canUploadIcon: () => boolean;
  getRemainingQuota: () => number;
}

const CaptionContext = createContext<CaptionContextType | undefined>(undefined);

export const useCaptions = () => {
  const context = useContext(CaptionContext);
  if (!context) {
    throw new Error('useCaptions must be used within a CaptionProvider');
  }
  return context;
};

interface CaptionProviderProps {
  children: ReactNode;
}

export const CaptionProvider: React.FC<CaptionProviderProps> = ({ children }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [filter, setFilterState] = useState<CaptionFilter>({
    tags: [],
    searchQuery: '',
    sortBy: 'newest',
    onlyFavorites: false
  });

  const [user, setUser] = useState<User>({
    isMember: true, // Set to true for demo, in real app this would come from auth
    quota: {
      date: new Date().toDateString(),
      uploadCount: 0,
      maxUploads: 5
    }
  });

  // Load captions from localStorage on mount
  useEffect(() => {
    const savedCaptions = localStorage.getItem('captionkanade-captions');
    if (savedCaptions) {
      try {
        const parsed = JSON.parse(savedCaptions);
        setCaptions(parsed.map((caption: any) => ({
          ...caption,
          createdAt: new Date(caption.createdAt),
          updatedAt: new Date(caption.updatedAt),
          // Migrate old captions to new format
          colortop: caption.colortop || '#FFDEE9',
          colorbottom: caption.colorbottom || '#B5FFFC'
        })));
      } catch (error) {
        console.error('Error loading captions:', error);
      }
    }

    // Load user quota
    const savedQuota = localStorage.getItem('captionkanade-quota');
    if (savedQuota) {
      try {
        const quota = JSON.parse(savedQuota);
        const today = new Date().toDateString();
        
        // Reset quota if it's a new day
        if (quota.date !== today) {
          quota.date = today;
          quota.uploadCount = 0;
        }
        
        setUser(prev => ({ ...prev, quota }));
      } catch (error) {
        console.error('Error loading quota:', error);
      }
    }
  }, []);

  // Save captions to localStorage whenever captions change
  useEffect(() => {
    localStorage.setItem('captionkanade-captions', JSON.stringify(captions));
  }, [captions]);

  // Save quota to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('captionkanade-quota', JSON.stringify(user.quota));
  }, [user.quota]);

  const addCaption = (captionData: Omit<Caption, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCaption: Caption = {
      ...captionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCaptions(prev => [newCaption, ...prev]);
  };

  const updateCaption = (id: string, updates: Partial<Caption>) => {
    setCaptions(prev => prev.map(caption => 
      caption.id === id 
        ? { ...caption, ...updates, updatedAt: new Date() }
        : caption
    ));
  };

  const deleteCaption = (id: string) => {
    setCaptions(prev => prev.filter(caption => caption.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setCaptions(prev => prev.map(caption => 
      caption.id === id 
        ? { ...caption, isFavorite: !caption.isFavorite, updatedAt: new Date() }
        : caption
    ));
  };

  const setFilter = (newFilter: Partial<CaptionFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  const updateUserQuota = () => {
    const today = new Date().toDateString();
    setUser(prev => ({
      ...prev,
      quota: {
        ...prev.quota,
        date: today,
        uploadCount: prev.quota.date === today ? prev.quota.uploadCount + 1 : 1
      }
    }));
  };

  const canUploadIcon = () => {
    return user.isMember && user.quota.uploadCount < user.quota.maxUploads;
  };

  const getRemainingQuota = () => {
    return Math.max(0, user.quota.maxUploads - user.quota.uploadCount);
  };

  // Get filtered captions
  const filteredCaptions = captions.filter(caption => {
    // Search filter
    if (filter.searchQuery && !caption.text.toLowerCase().includes(filter.searchQuery.toLowerCase())) {
      return false;
    }

    // Tags filter
    if (filter.tags.length > 0 && !filter.tags.some(tag => caption.tags.includes(tag))) {
      return false;
    }

    // Favorites filter
    if (filter.onlyFavorites && !caption.isFavorite) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filter.sortBy) {
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'popular':
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      default:
        return 0;
    }
  });

  // Get available tags
  const availableTags = Array.from(new Set(captions.flatMap(caption => caption.tags)));

  const exportCaptions = () => {
    return JSON.stringify(captions, null, 2);
  };

  const importCaptions = (data: string) => {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        const processedCaptions = imported.map((caption: any) => ({
          ...caption,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date(caption.createdAt || Date.now()),
          updatedAt: new Date(caption.updatedAt || Date.now()),
          // Ensure new format
          colortop: caption.colortop || '#FFDEE9',
          colorbottom: caption.colorbottom || '#B5FFFC'
        }));
        setCaptions(prev => [...processedCaptions, ...prev]);
      }
    } catch (error) {
      console.error('Error importing captions:', error);
      throw new Error('Invalid caption data format');
    }
  };

  return (
    <CaptionContext.Provider value={{
      captions,
      addCaption,
      updateCaption,
      deleteCaption,
      toggleFavorite,
      filteredCaptions,
      filter,
      setFilter,
      availableTags,
      exportCaptions,
      importCaptions,
      user,
      updateUserQuota,
      canUploadIcon,
      getRemainingQuota
    }}>
      {children}
    </CaptionContext.Provider>
  );
};