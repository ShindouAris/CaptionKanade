import React, {useState} from "react";
import { Hash, X } from "lucide-react";

export const TagsSection = React.memo(({ 
  tags, 
  onAddTag, 
  onRemoveTag 
}: { 
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim()) {
      onAddTag(tagInput.trim());
      setTagInput('');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-primary/20 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Hash className="text-primary dark:text-primary" size={18} />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Tags
        </h3>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="Thêm tag..."
          className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
        />
        <button
          onClick={handleAddTag}
          className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
        >
          Thêm
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary rounded-full text-xs sm:text-sm"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="hover:text-primary/90 dark:hover:text-primary/80"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
});