import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { X, CheckCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { PiGifFill } from "react-icons/pi";
import { useAuth } from "@/contexts/AuthContext";
import { GifResponse } from "@/types/GIF";
import { Badge } from "../ui/badge";

// Get API URL from environment or use relative path as fallback
const API_URL = import.meta.env.VITE_API_URL || '';

export interface IconGIFProps {
  iconFile?: File | null;
  iconPreview?: string | null;
  isUploading?: boolean;
  onUpload: (url: string) => void;
  onRemove: () => void;
  remainingQuota?: number;
}

export const IconGIF: React.FC<IconGIFProps> = React.memo(
  ({
    iconPreview = null,
    onUpload,
    onRemove,
    remainingQuota = 36,
  }: IconGIFProps) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(iconPreview);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<GifResponse["data"] | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const auth = useAuth();

    // Sync with iconPreview prop when it changes
    React.useEffect(() => {
      if (iconPreview !== previewUrl) {
        if (!previewUrl || iconPreview !== previewUrl) {
          setPreviewUrl(iconPreview);
        }
      }
    }, [iconPreview, previewUrl]);

    // Fetch trending GIFs on component mount
    useEffect(() => {
      fetchTrendingGIFs();
    }, []);

    const fetchTrendingGIFs = async (page: number = 1) => {
      setLoading(true);
      try {
        if (!auth?.user?.id) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/gif/trending?page=${page}&userID=${auth.user.id}`, {
          method: 'GET',
        });
        
        if (res.ok) {
          const response: GifResponse = await res.json();
          setData(response.data);
          setCurrentPage(response.data.current_page);
        }
      } catch (error) {
        console.error('Failed to fetch trending GIFs:', error);
      } finally {
        setLoading(false);
      }
    };

    const searchGifs = async (query: string, page: number = 1) => {
      if (!query.trim()) {
        fetchTrendingGIFs();
        return;
      }

      setLoading(true);
      try {
        if (!auth?.user?.id) {
          setLoading(false);
          return;
        }
        
        const res = await fetch(`${API_URL}/gif/search?query=${encodeURIComponent(query)}&page=${page}&userID=${auth.user.id}`, {
          method: 'GET',
        });

        if (res.ok) {
          const response: GifResponse = await res.json();
          setData(response.data);
        }
      } catch (error) {
        console.error("[searchGifs] Error searching GIFs:", error);
      } finally {
        setLoading(false);
      }
    };

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (query.trim()) {
        searchTimeoutRef.current = setTimeout(() => {
          searchGifs(query, 1);
        }, 1000);
      } else {
        fetchTrendingGIFs();
      }
    };

    const handleGifClick = (gifUrl: string) => {
      setPreviewUrl(gifUrl);
      onUpload(gifUrl);
    };

    const handleRemove = () => {
      setPreviewUrl(null);
      onRemove();
    };

    const handleRefresh = () => {
      setCurrentPage(1);
      setSearchQuery("");
      fetchTrendingGIFs();
    };

    const handleNextPage = () => {
      if (data?.has_next) {
        const nextPage = currentPage + 1;
        if (searchQuery.trim()) {
          searchGifs(searchQuery, nextPage);
        } else {
          fetchTrendingGIFs(nextPage);
        }
        setCurrentPage(nextPage);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 1) {
        const prevPage = currentPage - 1;
        if (searchQuery.trim()) {
          searchGifs(searchQuery, prevPage);
        } else {
          fetchTrendingGIFs();
        }
      }
    };

    return (
      <div className="p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-pink-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <PiGifFill className="text-pink-600 dark:text-pink-400" size={18} />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Icon GIF</h3>
            <Badge variant="secondary" className="ml-auto px-2 py-1 text-xs">
              Beta
            </Badge>
            <span className="text-red-600 underline text-sm hover:text-red-400 cursor-pointer" 
              onClick={() => window.open("https://klipy.com/", "_blank", "noopener noreferrer")}>
              Powered by KLIPY
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Tìm GIF phù hợp trên nền tảng KLIPY..."
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                aria-label="Refresh GIFs"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <img src={previewUrl} alt="Icon preview" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">GIF đã chọn</span>
                <button onClick={handleRemove} className="text-red-500 hover:text-red-700" aria-label="Remove icon">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Quota */}
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
              Còn {remainingQuota}/20 ảnh hôm nay
            </div>

            {/* GIF Grid */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đang tải GIFs...</div>
                </div>
              ) : data && data.data.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {data.data.map((gif) => (
                      <button
                        key={gif.id}
                        onClick={() => handleGifClick(gif.file.sm.gif.url)}
                        className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                          previewUrl === gif.file.sm.gif.url 
                            ? 'border-pink-500 ring-2 ring-pink-300' 
                            : 'border-transparent hover:border-pink-400'
                        }`}
                        title={gif.title}
                      >
                        <img
                          src={gif.file.sm.gif.url}
                          alt={gif.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        {previewUrl === gif.file.sm.gif.url && (
                          <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={14} />
                      Trước
                    </button>
                    
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Trang {currentPage}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={!data.has_next}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Next page"
                    >
                      Sau
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="mb-2">Không tìm thấy GIF nào</div>
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg text-xs hover:bg-pink-600 transition-colors"
                  >
                    Tải lại
                  </button>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 space-y-1">
                <div>• Click vào GIF để chọn làm icon cho caption</div>
                <div>• GIF đã chọn sẽ có viền hồng và dấu tích</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default IconGIF;