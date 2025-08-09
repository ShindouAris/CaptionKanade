import React, {useRef} from "react";
import { Image, Crown, Upload, X } from "lucide-react";

export const IconUpload = React.memo(({ 
  iconPreview, 
  isUploading, 
  onUpload, 
  onRemove, 
  remainingQuota 
}: { 
  iconFile: File | null;
  iconPreview: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  remainingQuota: number;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <Image className="text-pink-600 dark:text-pink-400" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Icon Caption
        </h3>
        <Crown className="text-yellow-500" size={16} />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            {isUploading ? 'Đang tải...' : 'Upload Icon'}
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Còn {remainingQuota}/7 ảnh hôm nay
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            if (e.target) e.target.value = '';
          }}
          className="hidden"
        />

        {iconPreview && (
          <div className="flex items-center gap-2">
            <img 
              src={iconPreview} 
              alt="Icon" 
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
            />
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          • Chỉ file PNG/GIF, tối đa 1MB cho ảnh và 3MB cho gif
          • Tỷ lệ vuông (1:1) được khuyến nghị
        </div>
      </div>
    </div>
  );
});