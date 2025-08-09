import React from "react";
import { Eye, EyeOff } from "lucide-react";


export const Preview = React.memo(({ 
  showPreview,
  onTogglePreview,
  captionText,
  selectedColor,
  selectedColorTop,
  selectedColorBottom,
  iconPreview
}: {
  showPreview: boolean;
  onTogglePreview: () => void;
  captionText: string;
  selectedColor: string;
  selectedColorTop: string;
  selectedColorBottom: string;
  iconPreview: string;
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Eye className="text-pink-600 dark:text-pink-400" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Xem trước
        </h3>
      </div>
      <button
        onClick={onTogglePreview}
        className="p-2 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
      >
        {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
    
    {showPreview && (
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
        <div 
          className="w-full h-full"
          style={{
            background: `linear-gradient(to bottom, ${selectedColorTop}, ${selectedColorBottom})`
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl max-w-sm"
            style={{
              background: `linear-gradient(to bottom, ${selectedColorTop}, ${selectedColorBottom})`,
              color: selectedColor,
              fontSize: '16px',
              fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {iconPreview && (
              <img 
                src={iconPreview} 
                alt="Icon" 
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <span className="text-center">
              {captionText || 'Caption Kanade'}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
));
