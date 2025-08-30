import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Crown, X, RefreshCw, CheckCircle } from "lucide-react";

// Get API URL from environment or use relative path as fallback
const API_URL = import.meta.env.VITE_API_URL || '';
export interface IconUploadRecentProps {
  iconPreview?: string | null;
  isUploading?: boolean;
  onUpload: (url: string) => void; // called when user selects an image from recent uploads
  onRemove: () => void; // called when user removes the preview
  remainingQuota?: number;
}

interface RecentImage {
  url: string;
  id: string;
}

export const IconUploadRecent: React.FC<IconUploadRecentProps> = React.memo(
  ({
    iconPreview = null,
    isUploading = false,
    onUpload,
    onRemove,
    remainingQuota = 3,
  }: IconUploadRecentProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(iconPreview);
    const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);

    // Sync with iconPreview prop when it changes
    React.useEffect(() => {
      if (iconPreview !== previewUrl) {
        // Only update if we don't have a local preview or if iconPreview is different
        if (!previewUrl || iconPreview !== previewUrl) {
          setPreviewUrl(iconPreview);
        }
      }
    }, [iconPreview]);

    // Fetch recent images on component mount
    useEffect(() => {
      fetchRecentImages();
    }, []);

    const fetchRecentImages = async () => {
      setLoadingRecent(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoadingRecent(false);
          return;
        }

        // Fallback to relative URL if API_URL is not defined
        const baseUrl = API_URL || '';
        const apiUrl = baseUrl ? `${baseUrl}/v1/member/get-user-uploaded-image` : '/v1/member/get-user-uploaded-image';

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.images && Array.isArray(data.images)) {
            const images = data.images.map((url: string, index: number) => ({
              url,
              id: `${index}-${url.split('/').pop()}`,
            }));
            setRecentImages(images);
          } else {
            setRecentImages([]);
          }
        } else {
          const errorText = await response.text();
          console.error('API error:', response.status, errorText);
        }
      } catch (error) {
        console.error('Failed to fetch recent images:', error);
        setRecentImages([]);
      } finally {
        setLoadingRecent(false);
      }
    };

    const handleRecentImageClick = (imageUrl: string) => {
      // Set the clicked image as preview
      setPreviewUrl(imageUrl);
      // Call parent's onUpload with the selected image URL
      onUpload(imageUrl);
    };

    const handleRefreshRecent = () => {
      fetchRecentImages();
    };

    const handleRemove = () => {
      setPreviewUrl(null);
      onRemove();
    };

    return (
      <div className="p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-pink-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <ImageIcon className="text-pink-600 dark:text-pink-400" size={18} />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Icon Caption</h3>
            <Crown className="text-yellow-500" size={14} />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
                             <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ảnh đã tải gần đây</h4>
              <button
                onClick={handleRefreshRecent}
                disabled={loadingRecent}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                aria-label="Refresh recent images"
              >
                <RefreshCw size={14} className={loadingRecent ? "animate-spin" : ""} />
              </button>
            </div>

            {previewUrl && (
              <div className="flex items-center gap-2">
                <img src={previewUrl} alt="Icon preview" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                <button onClick={handleRemove} className="text-red-500 hover:text-red-700" aria-label="Remove icon">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Recent Images Grid */}
            {loadingRecent ? (
              <div className="flex justify-center p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</div>
              </div>
            ) : recentImages.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {recentImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleRecentImageClick(image.url)}
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors group ${
                      previewUrl === image.url 
                        ? 'border-pink-500 ring-2 ring-pink-300' 
                        : 'border-transparent hover:border-pink-400'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt="Recent upload"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {previewUrl === image.url && (
                      <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <CheckCircle size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
                         ) : (
               <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                 <div>Chưa có ảnh nào được tải lên</div>
                 <button 
                   onClick={fetchRecentImages}
                   className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                 >
                   Thử lại
                 </button>
               </div>
             )}

            <div className="text-xs text-gray-500 dark:text-gray-400">
              • Click vào ảnh để chọn làm icon cho caption<br />
              • Ảnh đã chọn sẽ có viền hồng và dấu tích<br />
              • Sử dụng nút refresh để cập nhật danh sách ảnh mới
            </div>
          </div>
        </div>

      </div>
    );
  }
);

export default IconUploadRecent;

