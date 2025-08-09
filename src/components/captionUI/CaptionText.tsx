import { Type } from "lucide-react";

export const CaptionText = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
    <div className="flex items-center gap-2 mb-4">
      <Type className="text-pink-600 dark:text-pink-400" size={20} />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Nội dung Caption
      </h3>
    </div>
    <div className="flex items-center gap-2 mb-4">
      <span
        className={`text-sm ${
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
      className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
    />
  </div>
);