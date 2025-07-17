import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Caption } from '../types/Caption';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
const API_URL = import.meta.env.VITE_API_URL;
type SortBy = 'newest' | 'oldest' | 'popular';

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: number | undefined = undefined;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(() => {
      func(...args);
      timeout = undefined;
    }, wait);
  };
};

interface PaginatedResponse {
  total: number;
  page: number;
  page_size: number;
  captions: Caption[];
}

interface CaptionContextType {
  captions: Caption[];
  filteredCaptions: Caption[];
  totalCaptions: number;
  currentPage: number;
  pageSize: number;
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
  toggleFavorite: (id: string) => Promise<void>;
  fetchCaptions: (page: number) => Promise<void>;
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
  const [totalCaptions, setTotalCaptions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
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

  const location = useLocation();
  const { user: authUser } = useAuth();

  // Fetch captions only when on library page and user is logged in
  useEffect(() => {
    if (location.pathname === '/library' && authUser) {
      fetchCaptions(1);
    }
  }, [location.pathname, authUser]);

  const fetchCaptions = async (page: number) => {
    try {
      const response = await fetch(`${API_URL}/captions/${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setCaptions(data.captions.map(caption => ({
          ...caption,
        })));
        setTotalCaptions(data.total);
        setCurrentPage(data.page);
        setPageSize(data.page_size);
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
      formData.append('type', newCaption.type);

      if (newCaption.tags && newCaption.tags.length > 0) {
        formData.append('tags', JSON.stringify(newCaption.tags));
      }

      // Handle icon file
      const iconFile = (newCaption as any).icon_file as File | undefined;
      if (iconFile) {
        formData.append('icon_url', iconFile);
      }

      const response = await fetch(`${API_URL}/captions/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create caption');
      }

      const savedCaption = await response.json();
      setCaptions(prev => [...prev, { ...savedCaption, is_favorite: false }]);

      // Only update quota if icon was uploaded successfully
      if (iconFile) {
        updateUserQuota();
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

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const isFavorited = captions.find(caption => caption.id === id)?.is_favorite || false;
      setCaptions(prev => prev.map(caption => caption.id === id ? { ...caption, is_favorite: !isFavorited } : caption));
      const endpoint = isFavorited ? '/v1/member/unfavorite-post' : '/v1/member/add-favorite-post';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: authUser?.id,
          post_id: id
        })
      });

      if (!response.ok) {
        setCaptions(prev => prev.map(caption => caption.id === id ? { ...caption, is_favorite: !isFavorited } : caption));
      } 
    } catch (error) {
      console.error('Error toggling saved status:', error);
    }
  }, [captions, authUser]);

  // Debounced version of toggleFavorite that returns a Promise
  const debouncedToggleFavorite = useCallback(
    (id: string): Promise<void> => {
      return new Promise((resolve) => {
        debounce((id: string) => {
          toggleFavorite(id).then(resolve);
        }, 500)(id);
      });
    },
    [toggleFavorite]
  );

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

  // Filter and sort captions - now only filter the current page
  const filteredCaptions = captions
    .filter(caption => {
      const matchesSearch = caption.text.toLowerCase().includes(filter.searchQuery.toLowerCase());
      const matchesTags = filter.tags.length === 0 || (caption.tags && filter.tags.every(tag => caption.tags?.includes(tag)));
      const matchesSaved = !filter.onlyFavorites || caption.is_favorite;
      return matchesSearch && matchesTags && matchesSaved;
    })
    .sort((a, b) => {
      switch (filter.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'popular':
          return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
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
    totalCaptions,
    currentPage,
    pageSize,
    filter,
    setFilter: (newFilter) => {
      // Sync onlySaved with onlyFavorites for backend compatibility
      if ('onlyFavorites' in newFilter) {
        newFilter.onlyFavorites = newFilter.onlyFavorites;
      }
      setFilter(prev => ({ ...prev, ...newFilter }));
    },
    availableTags,
    addCaption,
    deleteCaption,
    toggleFavorite: debouncedToggleFavorite,
    fetchCaptions,
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