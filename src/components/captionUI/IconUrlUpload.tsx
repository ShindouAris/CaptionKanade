import React, { useState, ChangeEvent } from "react";
import { Image as ImageIcon, Link, X, CheckCircle, AlertCircle } from "lucide-react";

export interface IconUrlUploadProps {
  iconFile?: File | null;
  iconPreview?: string | null;
  isUploading?: boolean;
  onUpload: (url: string) => void; // called after user presses Apply with the image URL
  onRemove: () => void; // called when user removes the preview
  remainingQuota?: number;
}

export const IconUrlUpload: React.FC<IconUrlUploadProps> = React.memo(
  ({
    iconPreview = null,
    isUploading = false,
    onUpload,
    onRemove,
    remainingQuota = 20,
  }: IconUrlUploadProps) => {
    const [imageUrl, setImageUrl] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(iconPreview);
    const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
    const [urlError, setUrlError] = useState<string>("");
    const [isValidating, setIsValidating] = useState<boolean>(false);

    // Sync with iconPreview prop when it changes
    React.useEffect(() => {
      if (iconPreview !== previewUrl) {
        // Only update if we don't have a local preview or if iconPreview is different
        if (!previewUrl || iconPreview !== previewUrl) {
          setPreviewUrl(iconPreview);
        }
      }
    }, [iconPreview]);

    // Check if URL has valid image extension
    const isValidImageUrl = (url: string): boolean => {
      const validExtensions = ['.gif', '.png', '.jpg', '.jpeg', '.webp'];
      const lowerUrl = url.toLowerCase();
      return validExtensions.some(ext => lowerUrl.includes(ext));
    };

    // Check if URL is a direct image link
    const isDirectImageUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        // Check if the pathname ends with image extension
        const pathname = urlObj.pathname.toLowerCase();
        const validExtensions = ['.gif', '.png', '.jpg', '.jpeg', '.webp'];
        return validExtensions.some(ext => pathname.endsWith(ext));
      } catch {
        return false;
      }
    };

    // Check if image can actually be loaded and displayed
    const canLoadImage = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          console.log("[canLoadImage] Ảnh load thành công:", url);
          resolve(true);
        };
        
        img.onerror = () => {
          console.warn("[canLoadImage] Không thể load ảnh:", url);
          resolve(false);
        };
        
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
          console.warn("[canLoadImage] Timeout khi load ảnh:", url);
          resolve(false);
        }, 10000); // 10 seconds timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          console.log("[canLoadImage] Ảnh load thành công:", url);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.warn("[canLoadImage] Không thể load ảnh:", url);
          resolve(false);
        };
        
        // Start loading the image
        img.src = url;
      });
    };

    // Validate URL - now properly async
    const validateUrl = async (url: string) => {
      if (!url.trim()) {
        setIsValidUrl(false);
        setUrlError("");
        return;
      }

      setIsValidating(true);
      setUrlError("");

      try {
        // Check if URL has valid format
        if (!isValidImageUrl(url)) {
          setIsValidUrl(false);
          setUrlError("URL phải chứa định dạng ảnh hợp lệ (.gif, .png, .jpg, .jpeg, .webp)");
          return;
        }

        // Check if URL is direct image link
        if (!isDirectImageUrl(url)) {
          setIsValidUrl(false);
          setUrlError("URL phải là link ảnh trực tiếp (không phải trang web chứa ảnh)");
          return;
        }

        // Check if image can actually be loaded
        const canLoad = await canLoadImage(url);
        if (!canLoad) {
          setIsValidUrl(false);
          setUrlError("Không thể load ảnh từ URL này. Vui lòng kiểm tra lại link hoặc thử link khác.");
          return;
        }

        // If all checks pass
        setIsValidUrl(true);
        setUrlError("");
        
      } catch (error) {
        console.error("[validateUrl] Lỗi khi validate URL:", error);
        setIsValidUrl(false);
        setUrlError("Có lỗi xảy ra khi kiểm tra URL. Vui lòng thử lại.");
      } finally {
        setIsValidating(false);
      }
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setImageUrl(url);
      setIsValidUrl(false);
      setUrlError("");
      
      if (url.trim()) {
        // Debounce validation
        const timeoutId = setTimeout(() => validateUrl(url), 500);
        return () => clearTimeout(timeoutId);
      }
    };

    const handleApply = () => {
      if (!isValidUrl || !imageUrl.trim()) return;

      // Pass URL to parent component for handling
      onUpload(imageUrl);
      
      // Set preview locally
      setPreviewUrl(imageUrl);
      
      // Clear input
      setImageUrl("");
      setIsValidUrl(false);
    };

    const handleRemove = () => {
      setPreviewUrl(null);
      setImageUrl("");
      setIsValidUrl(false);
      setUrlError("");
      onRemove();
    };

    return (
      <div className="p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-accent">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-primary/20 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <ImageIcon className="text-primary dark:text-primary" size={18} />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Icon Caption</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.png)"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    disabled={isUploading || isValidating}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                  {isValidUrl && !isValidating && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                  )}
                  {urlError && !isValidating && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />
                  )}
                </div>
                {urlError && (
                  <p className="text-xs sm:text-sm text-red-500 mt-1">{urlError}</p>
                )}
                {isValidating && (
                  <p className="text-xs sm:text-sm text-blue-500 mt-1">Đang kiểm tra ảnh...</p>
                )}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">Còn {remainingQuota}/20 ảnh hôm nay</span>
            <button
              onClick={handleApply}
              disabled={isUploading || !isValidUrl || isValidating}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              aria-label="Apply image URL"
            >
              <Link size={16} />
              {isUploading ? "Đang tải..." : "Áp dụng"}
            </button>

            {previewUrl && (
              <div className="flex items-center gap-2">
                <img src={previewUrl} alt="Icon preview" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                <button onClick={handleRemove} className="text-red-500 hover:text-red-700" aria-label="Remove icon">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400">
              • Chỉ chấp nhận URL ảnh trực tiếp với định dạng .gif, .png, .jpg, .jpeg, .webp<br />
              • Tỷ lệ vuông (1:1) được khuyến nghị<br />
              • URL phải là link ảnh trực tiếp, không phải trang web chứa ảnh<br />
              • Link ảnh phải sống liên tục nếu muốn ảnh hiển thị trong locket<br />
              • Up ảnh chết lưu rồi thì phải xóa<br />
              • Hệ thống sẽ kiểm tra xem ảnh có load được không trước khi cho phép sử dụng
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default IconUrlUpload;