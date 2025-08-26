import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Caption } from '../types/Caption';
import { CaptionItem } from './captionUI/CaptionItem';
import DeleteConfirmationDialog from './captionUI/DeleteConfirmationDialog';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Trending: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; captionId: string | null; isLoading: boolean; }>({
    isOpen: false,
    captionId: null,
    isLoading: false,
  });

  const fetchTrending = async (initial = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const qs = initial ? `limit=21` : `limit=21&next_token=${encodeURIComponent(nextToken || '')}`; // grid 3x3 mà 20 thì xấu lắm
      const response = await fetch(`${API_URL}/captions/trending?${qs}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch trending');
      const data = await response.json();
      const mapped = (data.captions as Caption[]).map(c => ({ ...c }));
      setCaptions(prev => initial ? mapped : [...prev, ...mapped]);
      setHasMore(Boolean(data.has_more));
      setNextToken(data.next_token || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching trending');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleDelete = async (id: string) => {
    setDeleteDialog({ isOpen: true, captionId: id, isLoading: false });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, captionId: null, isLoading: false });
  };

  const confirmDelete = async () => {
    try {
      toast.error('Không hỗ trợ xóa ở trang Trending. Vui lòng xóa tại Library.');
    } finally {
      closeDeleteDialog();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold dark:text-white mb-2">Trending Caption</h2>
        <p className="dark:text-gray-300">Các caption đang thịnh hành</p>
      </div>

      {isLoading && captions.length === 0 && (  
        <div className="text-center py-12">
          <img src='/preload.gif' className='h-48 mx-auto' alt='loading' />
          <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Đã xảy ra lỗi</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button onClick={() => fetchTrending(true)} className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-all">Thử lại</button>
        </div>
      )}

      {!isLoading && !error && captions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chưa có gì nổi bật</h3>
        </div>
      )}

      {!error && captions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captions.map(caption => (
              <CaptionItem
                key={caption.id}
                caption={caption}
                user={user}
                toggleFavorite={() => Promise.resolve()}
                handleDelete={handleDelete}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            {hasMore ? (
              <button
                onClick={() => fetchTrending(false)}
                disabled={isLoading}
                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            ) : (
              <div className="text-gray-600 dark:text-gray-300">Đã hiển thị tất cả</div>
            )}
          </div>
        </>
      )}

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
    </div>
  );
};

export default Trending;


