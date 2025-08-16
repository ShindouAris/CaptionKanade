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
  isLoading: boolean;
  error: string | null;
  filter: {
    searchQuery: string;
    tags: string[];
    onlyFavorites: boolean;
    sortBy: SortBy;
  };
  setFilter: (newFilter: Partial<CaptionContextType['filter']>) => void;
  availableTags: string[];
  addCaption: (caption: Omit<Caption, 'id' | 'created_at' | 'updated_at'>) => Promise<Caption>;
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
  searchCaptions: (query: string, page: number) => Promise<void>;
  clearSearch: () => void;
  quota: UserQuota;
  fetchUserQuota: () => Promise<void>;
}

const CaptionContext = createContext<CaptionContextType | undefined>(undefined);

export const useCaptions = () => {
  const context = useContext(CaptionContext);
  if (!context) {
    throw new Error('useCaptions must be used within a CaptionProvider');
  }
  return context;
};

interface UserQuota {
  today_upload_count: number;
  icon_upload_count: number;
  posted_count: number;
}

export const CaptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [cachedCaptions, setCachedCaptions] = useState<Caption[]>([]);
  const [cachedTotal, setCachedTotal] = useState(0);
  const [totalCaptions, setTotalCaptions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [quota, setQuota] = useState<UserQuota>({
    today_upload_count: 0,
    icon_upload_count: 0,
    posted_count: 0,
  });

  const location = useLocation();
  const { user: authUser } = useAuth();

  // Fetch user quota from backend
  const fetchUserQuota = useCallback(async () => {
    if (!authUser) return;
    try {
      const response = await fetch(`${API_URL}/v1/member/get-upload-stat-today`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: authUser.id })
      });
      if (response.ok) {
        const data = await response.json();
        setQuota({
          today_upload_count: data.today_upload_count ?? 0,
          icon_upload_count: data.icon_upload_count ?? 0,
          posted_count: data.posted_count ?? 0,
        });
      }
    } catch (error) {
      // Có thể log hoặc toast lỗi nếu cần
    }
  }, [authUser]);

  // Gọi fetchUserQuota khi user login hoặc vào trang builder
  useEffect(() => {
    if (authUser) {
      fetchUserQuota();
    }
  }, [authUser, fetchUserQuota]);

  // Fetch captions only when on library page and user is logged in
  useEffect(() => {
    if (location.pathname === '/library' && authUser) {
      fetchCaptions(1);
    }
  }, [location.pathname, authUser]);

  const fetchCaptions = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/captions/${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        const newCaptions = data.captions.map(caption => ({
          ...caption,
        }));
        setCaptions(newCaptions);
        // Cache kết quả fetch
        setCachedCaptions(newCaptions);
        setTotalCaptions(data.total);
        setCachedTotal(data.total);
        setCurrentPage(data.page);
        setPageSize(data.page_size);
      } else {
        throw new Error('Failed to fetch captions');
      }
    } catch (error) {
      console.error('Error fetching captions:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching captions');
    } finally {
      setIsLoading(false);
    }
  };

  const addCaption = async (newCaption: Omit<Caption, 'id' | 'created_at' | 'updated_at'>): Promise<Caption> => {
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
      const icon_url = (newCaption as any).icon_link as string | undefined;
      if (icon_url) {
        formData.append('icon_link', icon_url)
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

      const savedCaption: Caption = await response.json();
      setCaptions(prev => [...prev, { ...savedCaption, is_favorite: false }]);

      // Only update quota if icon was uploaded successfully
      if (iconFile) {
        updateUserQuota();
      }
      return savedCaption;
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
      setCaptions(prev => prev.map(caption => caption.id === id ? { ...caption, is_favorite: !isFavorited, favorite_count: !isFavorited 
                                                                                                                  ? (caption.favorite_count || 0) + 1 
                                                                                                                  : Math.max(0, (caption.favorite_count || 0) - 1) } : caption));
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

  let AbortController: AbortController | null = null;

  const searchCaptions = async (query: string, page: number) => {
    // Nếu query trống, sử dụng cache thay vì gọi API
    if (!query.trim()) {
      setCaptions(cachedCaptions);
      setTotalCaptions(cachedTotal);
      setCurrentPage(1);
      setFilter(prev => ({ ...prev, searchQuery: '' }));
      return;
    }

    // Nếu đang ở trang 1 và có chính xác 1 kết quả match hoàn toàn với query
    // hoặc query mới chứa query cũ (đã match), không cần search nữa
    if (page === 1 && captions.length === 1) {
      const currentText = captions[0].text.toLowerCase();
      const newQuery = query.toLowerCase();
      // Nếu query mới chứa query cũ và query cũ đã match
      if (currentText === filter.searchQuery.toLowerCase() && newQuery.includes(filter.searchQuery.toLowerCase())) {
        return;
      }
      // Hoặc nếu query mới match hoàn toàn
      if (currentText === newQuery) {
        return;
      }
    }

    // Nếu đã search trước đó không có kết quả và query mới chứa query cũ, không cần search nữa
    if (page === 1 && totalCaptions === 0 && filter.searchQuery && query.toLowerCase().includes(filter.searchQuery.toLowerCase())) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (AbortController) {
        AbortController.abort();
      }
      AbortController = new window.AbortController();

      const response = await fetch(`${API_URL}/captions/search/${page}`, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query
      }),
      signal: AbortController.signal
      });
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setCaptions(data.captions.map(caption => ({
          ...caption,
        })));
        setTotalCaptions(data.total);
        setCurrentPage(data.page);
        setPageSize(data.page_size);
      } else {
        throw new Error('Failed to search captions');
      }
    } catch (error) {
      // Bỏ qua lỗi nếu request bị abort
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error searching captions:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching captions');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setCaptions(cachedCaptions);
    setTotalCaptions(cachedTotal);
    setCurrentPage(1);
    setFilter(prev => ({ ...prev, searchQuery: '' }));
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

  // Unique tags are provided inline in the context value

  const handleFilterUpdate = (newFilter: Partial<CaptionContextType['filter']>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter
    }));
  };

  return (
    <CaptionContext.Provider value={{
      captions,
      filteredCaptions,
      totalCaptions,
      currentPage,
      pageSize,
      isLoading,
      error,
      filter,
      setFilter: handleFilterUpdate,
      availableTags: Array.from(new Set(captions.flatMap(c => c.tags || []))),
      addCaption,
      deleteCaption,
      toggleFavorite: debouncedToggleFavorite,
      fetchCaptions,
      user,
      updateUserQuota,
      canUploadIcon,
      getRemainingQuota,
      searchCaptions,
      clearSearch,
      quota,
      fetchUserQuota
    }}>
      {children}
    </CaptionContext.Provider>
  );
};