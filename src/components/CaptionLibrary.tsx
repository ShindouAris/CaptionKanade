import React, { useState } from 'react';
import { Search, Filter, Tag } from 'lucide-react';
import { useCaptions } from '../contexts/CaptionContext';
import { useAuth } from '../contexts/AuthContext';
import { CaptionItem } from './captionUI/CaptionItem';
import DeleteConfirmationDialog from './captionUI/DeleteConfirmationDialog';
import toast from 'react-hot-toast';

const CaptionLibrary: React.FC = () => {
  const { 
    filteredCaptions,
    totalCaptions,
    currentPage,
    isLoading,
    error,
    filter, 
    setFilter, 
    availableTags, 
    toggleFavorite, 
    deleteCaption,
    fetchCaptions,
    searchCaptions,
    clearSearch,
    hasMore,
    loadMore,
  } = useCaptions();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    captionId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    captionId: null,
    isLoading: false,
  });

  // Phân trang cũ đã bỏ, sử dụng next_token: fetchCaptions(1) cho lần đầu, loadMore cho tải thêm

  const handleSearch = () => {
    setFilter({ searchQuery: searchInput });
    searchCaptions(searchInput, 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (!value.trim()) {
      clearSearch();
    }
  };

  const handleTagFilter = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter(t => t !== tag)
      : [...filter.tags, tag];
    setFilter({ tags: newTags });
    if (filter.searchQuery) {
      searchCaptions(filter.searchQuery, 1);
    } else {
      fetchCaptions(1);
    }
  };

  const handleSort = (sortBy: 'newest' | 'oldest' | 'popular') => {
    setFilter({ sortBy });
    fetchCaptions(1);
  };

  const handleDelete = async (id: string) => {
    setDeleteDialog({
      isOpen: true,
      captionId: id,
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.captionId) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteCaption(deleteDialog.captionId);
      // Nếu xóa caption cuối cùng của trang, load trang trước đó
      if (filteredCaptions.length === 1 && currentPage > 1) {
        fetchCaptions(currentPage - 1);
      } else {
        fetchCaptions(currentPage);
      }
    } catch (error) {
      console.error('Lỗi khi xóa caption:', error);
      toast.error("Không thể xóa caption này...")
    } finally {
      setDeleteDialog({
        isOpen: false,
        captionId: null,
        isLoading: false,
      });
      toast.success("Xóa caption thành công!")
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      captionId: null,
      isLoading: false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold dark:text-white mb-2">
          Thư viện Caption
        </h2>
        <p className="dark:text-gray-300">
          Quản lý và tìm kiếm trong {totalCaptions} caption trên toàn hệ thống
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/20 dark:border-gray-600 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm caption..."
                value={searchInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search size={20} />
              Tìm kiếm
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-wrap gap-2">              
              {['newest', 'oldest', 'popular'].map(sort => (
                <button
                  key={sort}
                  onClick={() => handleSort(sort as any)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    filter.sortBy === sort
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {sort === 'newest' ? 'Mới nhất' : sort === 'oldest' ? 'Cũ nhất' : 'Phổ biến'}
                </button>
              ))}
            </div>

            {availableTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lọc theo tag:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagFilter(tag)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        filter.tags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Tag size={14} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center mb-4 px-2 text-base md:text-lg leading-relaxed">
        <span>
          Chưa biết lấy ID bài viết ở đâu? <br className="block md:hidden" />
          Truy cập trang hướng dẫn ở sidebar hoặc&nbsp;
          <a
            href="/tutorial"
            className="underline text-primary hover:text-primary/80 transition-colors"
            style={{ cursor: 'pointer' }}
          >
            Vào đây
          </a>
        </span>
      </div>

      {/* Loading State */}
      {isLoading && filteredCaptions.length === 0 && (
        <div className="text-center py-12">
          <img src='/preload.gif' className='h-48 mx-auto' alt='loading' />
          <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Đã xảy ra lỗi
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <button
            onClick={() => fetchCaptions(currentPage)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCaptions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter.searchQuery || filter.tags.length > 0 
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Chưa có caption nào'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {filter.searchQuery || filter.tags.length > 0 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Hãy tạo caption đầu tiên của bạn!'}
          </p>
          {!(filter.searchQuery || filter.tags.length > 0) && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-builder'))}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:from-primary/90 hover:to-accent/90 transition-all"
            >
              Tạo Caption Ngay
            </button>
          )}
        </div>
      )}

      {/* Caption Grid */}
      {!error && filteredCaptions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaptions.map(caption => (
             <CaptionItem
              caption={caption}
              user={user}
              toggleFavorite={toggleFavorite}
              handleDelete={handleDelete}
             />
            ))}
          </div>

          {/* Load More */}
          {!filter.searchQuery && (
            <div className="mt-8 flex justify-center">
              {hasMore ? (
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang tải...' : 'Tải thêm'}
                </button>
              ) : (
                <div className="text-gray-600 dark:text-gray-300">Đã hiển thị tất cả</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
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

export default CaptionLibrary;