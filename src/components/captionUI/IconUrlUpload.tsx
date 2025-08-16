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

    // Validate URL
    const validateUrl = (url: string) => {
      if (!url.trim()) {
        setIsValidUrl(false);
        setUrlError("");
        return;
      }

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

      setIsValidUrl(true);
      setUrlError("");
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
      <div className="p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-pink-600 dark:text-pink-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Icon Caption</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.png)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={isUploading}
                  />
                  {isValidUrl && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
                  )}
                  {urlError && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
                  )}
                </div>
                {urlError && (
                  <p className="text-sm text-red-500 mt-1">{urlError}</p>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Còn {remainingQuota}/20 ảnh hôm nay</span>
            <button
              onClick={handleApply}
              disabled={isUploading || !isValidUrl}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              • URL phải là link ảnh trực tiếp, không phải trang web chứa ảnh
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default IconUrlUpload;