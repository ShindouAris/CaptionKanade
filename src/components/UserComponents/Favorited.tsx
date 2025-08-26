import React, { useState, useEffect, useCallback } from 'react';
import { CaptionItem } from '../captionUI/CaptionItem';
import { useAuth } from '@/contexts/AuthContext';
const API_URL = import.meta.env.VITE_API_URL
import { useCaptions } from '@/contexts/CaptionContext';
import DeleteConfirmationDialog from '../captionUI/DeleteConfirmationDialog';
export interface Caption {
  id: string;
  author: string;
  text: string;
  type: 'background' | 'image_icon' | 'image_gif';
  icon_url?: string;
  icon_delete_link?: string;
  tags: string[] | null;
  color: string;
  colortop: string;
  colorbottom: string;
  created_at: string;
  updated_at: string;
  favorite_count?: number;
  is_favorite?: boolean;
  is_popular?: boolean;
}

interface PostsResponse {
  captions: Caption[];
  next_token: string | null;
  total_count?: number;
}


const UserFavorited: React.FC = () => {
  const authContext = useAuth();
  const [posts, setPosts] = useState<Caption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const { toggleFavorite, deleteCaption,} = useCaptions();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    captionId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    captionId: null,
    isLoading: false,
  });

  // Fixed get_posted function - removed nextToken dependency to prevent infinite loops
  const getPosted = useCallback(async (token: string | null = null): Promise<PostsResponse> => {
    const { user, accessToken } = authContext;
    
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    const url = `${API_URL}/v1/member/favorites${token ? `?next_token=${token}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch posted data`);
    }

    const data: PostsResponse = await response.json();
    return data;
  }, [authContext.user, authContext.accessToken]);

  // Load initial posts
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPosted(null); // Always start fresh
      setPosts(data.captions || []);
      setNextToken(data.next_token || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  }, [getPosted]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (!nextToken || loadingMore) return;

    try {
      setLoadingMore(true);
      const data = await getPosted(nextToken);
      setPosts(prev => [...prev, ...(data.captions || [])]);
      setNextToken(data.next_token || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [getPosted, nextToken, loadingMore]);

  // Only load posts when user or accessToken changes, not when loadPosts changes
  useEffect(() => {
    if (authContext.user && authContext.accessToken) {
      loadPosts();
    }
  }, [authContext.user, authContext.accessToken]); // Removed loadPosts dependency

  // Retry handler
  const handleRetry = () => {
    loadPosts();
  };

  // Open delete confirmation dialog
  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, captionId: id, isLoading: false });
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteDialog.captionId) return;
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteCaption(deleteDialog.captionId);
      setPosts(prev => prev.filter(p => p.id !== deleteDialog.captionId));
    } catch (err) {
      console.error('Lỗi khi xóa caption:', err);
    } finally {
      setDeleteDialog({ isOpen: false, captionId: null, isLoading: false });
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, captionId: null, isLoading: false });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mt-2 backdrop:blur-0">
        <div className="pt-16 pb-8 px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mt-2 backdrop:blur-0">
        <div className="pt-16 pb-8 px-8 text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mt-2 backdrop:blur-0">
      <div className="pt-16 pb-8 px-8 items-center text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-200 via-sky-300 to-green-200 bg-clip-text text-transparent mb-2">
            Những thứ bạn đã yêu thích
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có caption nào
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <CaptionItem
                key={post.id}
                caption={post}
                user={authContext.user}
                toggleFavorite={toggleFavorite}
                handleDelete={handleDelete}
              />
            ))}

            {/* Load More Button */}
            {nextToken && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải...
                    </span>
                  ) : (
                    'Tải thêm caption'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <DeleteConfirmationDialog
      isOpen={deleteDialog.isOpen}
      onClose={closeDeleteDialog}
      onConfirm={confirmDelete}
      title="Xóa Caption"
      description="Bạn có chắc chắn muốn xóa caption này? Hành động này không thể hoàn tác."
      confirmText="Xóa Caption"
      cancelText="Hủy"
      isLoading={deleteDialog.isLoading}
    />
    </>
  );
};

export default UserFavorited;
