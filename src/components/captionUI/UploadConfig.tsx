import React from 'react';
import { Lock, Globe} from 'lucide-react';

interface UploadConfigProps {
  isPrivate: boolean;
  onPrivacyChange: (isPrivate: boolean) => void;
  className?: string;
}

export const UploadConfig: React.FC<UploadConfigProps> = ({
  isPrivate,
  onPrivacyChange,
  className = ""
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPrivate ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
            {isPrivate ? (
              <Lock className="text-orange-600 dark:text-orange-400" size={18} />
            ) : (
              <Globe className="text-green-600 dark:text-green-400" size={18} />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium dark:text-white">
              Đăng riêng tư
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Khi kích hoạt lựa chọn này, chỉ bạn có thể xem và chia sẻ caption đã đăng
            </p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => onPrivacyChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
        </label>
      </div>
    </div>
  );
};
