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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="text-pink-600 dark:text-pink-400" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tags
        </h3>
      </div>
      
      <div className="flex gap-2 mb-4">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="Thêm tag..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Thêm
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="hover:text-pink-900 dark:hover:text-pink-100"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
});