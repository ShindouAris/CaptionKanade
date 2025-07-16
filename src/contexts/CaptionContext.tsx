import React, { createContext, useContext, useState, useEffect } from 'react';
import { Caption } from '../types/Caption';
const API_URL = import.meta.env.VITE_API_URL;
type SortBy = 'newest' | 'oldest' | 'popular';

interface CaptionContextType {
  captions: Caption[];
  filteredCaptions: Caption[];
  filter: {
    searchQuery: string;
    tags: string[];
    onlyFavorites: boolean;
    sortBy: SortBy;
  };
  setFilter: (newFilter: Partial<CaptionContextType['filter']>) => void;
  availableTags: string[];
  addCaption: (caption: Omit<Caption, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteCaption: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  user: {
    isMember: boolean;
    uploadQuota: number;
  };
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

export const CaptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [icon_url, seticon_url] = useState<File | null>(null);
  const [filter, setFilter] = useState<CaptionContextType['filter']>({
    searchQuery: '',
    tags: [],
    onlyFavorites: false,
    sortBy: 'newest'
  });
  const [user, setUser] = useState({
    isMember: false,
    uploadQuota: 5
  });
  // Fetch captions on mount
  useEffect(() => {
    fetchCaptions();
  }, []);

  const fetchCaptions = async () => {
    try {
      const response = await fetch(`${API_URL}/captions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCaptions(data.map((caption: Caption) => ({
          ...caption,
          isFavorite: false
        })));
      }
    } catch (error) {
      console.error('Error fetching captions:', error);
    }
  };

  const addCaption = async (newCaption: Omit<Caption, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const formData = new FormData();
      formData.append('text', newCaption.text);
      formData.append('color', newCaption.color);
      formData.append('colortop', newCaption.colortop);
      formData.append('colorbottom', newCaption.colorbottom);
      formData.append('author', newCaption.author);

      if (newCaption.tags && newCaption.tags.length > 0) {
        newCaption.tags.forEach(tag => formData.append('tags', tag));
      }

      if (newCaption.icon_url) {
        formData.append('icon_url', newCaption.icon_url);
      }

      const response = await fetch(`${API_URL}/captions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const savedCaption = await response.json();
        setCaptions(prev => [...prev, { ...savedCaption, isFavorite: false }]);
      }
    } catch (error) {
      console.error('Error adding caption:', error);
      throw error;
    }
  };

  const deleteCaption = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/captions/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setCaptions(prev => prev.filter(caption => caption.id !== id));
      }
    } catch (error) {
      console.error('Error deleting caption:', error);
      throw error;
    }
  };

  const toggleFavorite = (id: string) => {
    setCaptions(prev => prev.map(caption => 
      caption.id === id 
        ? { ...caption, isFavorite: !caption.isFavorite }
        : caption
    ));
  };

  const updateUserQuota = () => {
    setUser(prev => ({
      ...prev,
      uploadQuota: Math.max(0, prev.uploadQuota - 1)
    }));
  };

  const canUploadIcon = () => {
    return user.uploadQuota > 0;
  };

  const getRemainingQuota = () => {
    return user.uploadQuota;
  };

  // Filter and sort captions
  const filteredCaptions = captions
    .filter(caption => {
      const matchesSearch = caption.text.toLowerCase().includes(filter.searchQuery.toLowerCase());
      const matchesTags = filter.tags.length === 0 || (caption.tags && filter.tags.every(tag => caption.tags?.includes(tag)));
      const matchesFavorite = !filter.onlyFavorites || caption.isFavorite;
      return matchesSearch && matchesTags && matchesFavorite;
    })
    .sort((a, b) => {
      switch (filter.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'popular':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        default:
          return 0;
      }
    });

  // Get all unique tags
  const availableTags = Array.from(
    new Set(captions.flatMap(caption => caption.tags || []))
  );

  const value: CaptionContextType = {
    captions,
    filteredCaptions,
    filter,
    setFilter: (newFilter) => setFilter(prev => ({ ...prev, ...newFilter })),
    availableTags,
    addCaption,
    deleteCaption,
    toggleFavorite,
    user,
    updateUserQuota,
    canUploadIcon,
    getRemainingQuota
  };

  return (
    <CaptionContext.Provider value={value}>
      {children}
    </CaptionContext.Provider>
  );
};