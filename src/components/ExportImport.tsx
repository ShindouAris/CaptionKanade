import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useCaptions } from '../contexts/CaptionContext';

const ExportImport: React.FC = () => {
  const { captions, exportCaptions, importCaptions } = useCaptions();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportCaptions();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `captionkanade-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importCaptions(content);
        setImportStatus('success');
        setImportMessage('Nhập dữ liệu thành công!');
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Lỗi: File không đúng định dạng hoặc bị hỏng');
      }
    };
    reader.readAsText(file);
  };

  const handleExportTxt = () => {
    try {
      const txtContent = captions.map(caption => {
        const tags = caption.tags.length > 0 ? ` [${caption.tags.join(', ')}]` : '';
        return `${caption.text}${tags}`;
      }).join('\n\n');
      
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `captionkanade-captions-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('TXT export failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Xuất / Nhập dữ liệu
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Sao lưu và khôi phục thư viện caption của bạn
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-4">
            <Download className="text-pink-600 dark:text-pink-400" size={24} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Xuất dữ liệu
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-gray-600 dark:text-gray-400" size={20} />
                <span className="font-medium text-gray-900 dark:text-white">
                  Thông tin thư viện
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>• Tổng số caption: {captions.length}</p>
                <p>• Caption yêu thích: {captions.filter(c => c.isFavorite).length}</p>
                <p>• Số tag khác nhau: {Array.from(new Set(captions.flatMap(c => c.tags))).length}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={captions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Xuất file JSON (đầy đủ)
              </button>
              
              <button
                onClick={handleExportTxt}
                disabled={captions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                Xuất file TXT (chỉ text)
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-blue-600 dark:text-blue-400 mt-0.5" size={16} />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• File JSON chứa đầy đủ thông tin (text, tags, style, icon)</li>
                    <li>• File TXT chỉ chứa nội dung caption và tags</li>
                    <li>• Nên sao lưu định kỳ để tránh mất dữ liệu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="text-pink-600 dark:text-pink-400" size={24} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nhập dữ liệu
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-pink-300 dark:border-pink-600 rounded-xl p-8 text-center">
              <Upload className="mx-auto mb-4 text-pink-600 dark:text-pink-400" size={48} />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chọn file để nhập
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Chọn file JSON đã xuất trước đó
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
              >
                Chọn file
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {/* Status Messages */}
            {importStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {importMessage}
                  </span>
                </div>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {importMessage}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-1">Cảnh báo:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Dữ liệu nhập sẽ được thêm vào thư viện hiện tại</li>
                    <li>• Không ghi đè lên caption đã có</li>
                    <li>• Chỉ chấp nhận file JSON từ CaptionKanade</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Backups */}
      <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Hướng dẫn sao lưu
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              📥 Khi nào nên sao lưu:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Trước khi xóa trình duyệt cache</li>
              <li>• Sau khi tạo nhiều caption mới</li>
              <li>• Trước khi chuyển sang thiết bị khác</li>
              <li>• Định kỳ hàng tuần/tháng</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              📤 Cách sử dụng file sao lưu:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Lưu file JSON ở nơi an toàn</li>
              <li>• Có thể mở trên máy tính khác</li>
              <li>• Chia sẻ với bạn bè qua file</li>
              <li>• Khôi phục khi cần thiết</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportImport;