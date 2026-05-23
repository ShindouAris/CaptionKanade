import { Type } from "lucide-react";

export const CaptionText = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-primary/20 dark:border-gray-600">
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <Type className="text-primary dark:text-primary" size={18} />
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
        Nội dung Caption
      </h3>
    </div>
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <span
        className={`text-xs sm:text-sm ${
          value.length === 36
            ? 'text-red-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {value.length}/36 ký tự
      </span>
    </div>
    <textarea
      value={value}
      maxLength={36}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Caption Kanade"
      className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
    />
  </div>
);