import React, { useState } from 'react';
import { Search, Filter, Heart, Edit3, Trash2, Download, Tag, Calendar } from 'lucide-react';
import { useCaptions } from '../contexts/CaptionContext';


const CaptionLibrary: React.FC = () => {
  const { 
    filteredCaptions, 
    filter, 
    setFilter, 
    availableTags, 
    toggleFavorite, 
    deleteCaption 
  } = useCaptions();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setFilter({ searchQuery: query });
  };

  const handleTagFilter = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter(t => t !== tag)
      : [...filter.tags, tag];
    setFilter({ tags: newTags });
  };

  const handleSort = (sortBy: 'newest' | 'oldest' | 'popular') => {
    setFilter({ sortBy });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa caption này?')) {
      deleteCaption(id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message
    const event = new CustomEvent('caption-copied');
    window.dispatchEvent(event);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Thư viện Caption
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Quản lý và tìm kiếm trong {filteredCaptions.length} caption của bạn
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm caption..."
              value={filter.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter({ onlyFavorites: !filter.onlyFavorites })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  filter.onlyFavorites
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Heart size={16} />
                Yêu thích
              </button>
              
              {['newest', 'oldest', 'popular'].map(sort => (
                <button
                  key={sort}
                  onClick={() => handleSort(sort as any)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    filter.sortBy === sort
                      ? 'bg-pink-500 text-white'
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
                          ? 'bg-pink-500 text-white'
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

      {/* Caption Grid */}
      {filteredCaptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chưa có caption nào
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Hãy tạo caption đầu tiên của bạn!
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-builder'))}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Tạo Caption Ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaptions.map(caption => (
            <div
              key={caption.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 dark:border-gray-600 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Caption Preview */}
              <div className="relative aspect-video">
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(to bottom, ${caption.colortop}, ${caption.colorbottom})`
                  }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl max-w-full"
                    style={{
                      background: `linear-gradient(to bottom, ${caption.colortop}, ${caption.colorbottom})`,
                      color: caption.color,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {caption.icon_url && (
                      <img 
                        src={caption.icon_url} 
                        alt="Icon" 
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0" 
                      />
                    )}
                    <span className="text-center">
                      {caption.text.length > 50 ? `${caption.text.substring(0, 50)}...` : caption.text}
                    </span>
                  </div>
                </div>

                {/* Overlay actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleFavorite(caption.id)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      caption.isFavorite
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white'
                    }`}
                  >
                    <Heart size={16} />
                  </button>
                </div>
              </div>

              {/* Caption Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                    {caption.text}
                  </p>
                </div>

                {/* Tags */}
                {caption.tags && caption.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {caption.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar size={12} />
                  {new Date(caption.created_at).toLocaleDateString('vi-VN')}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(caption.text)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                  >
                    <Download size={14} />
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedCaption(caption.id === selectedCaption ? null : caption.id)}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(caption.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaptionLibrary;