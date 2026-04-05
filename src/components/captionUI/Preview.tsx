import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { getCaptionGradient } from "@/lib/captionColors";


export const Preview = React.memo(({ 
  showPreview,
  onTogglePreview,
  captionText,
  selectedColor,
  selectedColors,
  iconPreview
}: {
  showPreview: boolean;
  onTogglePreview: () => void;
  captionText: string;
  selectedColor: string;
  selectedColors: string[];
  iconPreview: string;
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-pink-200 dark:border-gray-600">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="flex items-center gap-2">
        <Eye className="text-pink-600 dark:text-pink-400" size={18} />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Xem trước
        </h3>
      </div>
      <button
        onClick={onTogglePreview}
        className="p-2 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
      >
        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    
    {showPreview && (
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
        <div 
          className="w-full h-full"
          style={{
            background: getCaptionGradient(selectedColors)
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
          <div
            className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl max-w-xs sm:max-w-sm"
            style={{
              background: getCaptionGradient(selectedColors),
              color: selectedColor,
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {iconPreview && (
              <img 
                src={iconPreview} 
                alt="Icon" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <span className="text-center text-xs sm:text-base">
              {captionText || 'Caption Kanade'}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
));
