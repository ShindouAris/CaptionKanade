import React, { useState, useRef } from 'react';
import { Upload, Type, Palette, Hash, Save, Eye, EyeOff, X, Image, Crown } from 'lucide-react';
import { useCaptions } from '../contexts/CaptionContext';
import { useAuth } from '../contexts/AuthContext';

const CaptionBuilder: React.FC = () => {
  const { addCaption, user: captionUser, updateUserQuota, canUploadIcon, getRemainingQuota } = useCaptions();
  const { user } = useAuth();
  const [captionText, setCaptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedColorTop, setSelectedColorTop] = useState('#FFDEE9');
  const [selectedColorBottom, setSelectedColorBottom] = useState('#B5FFFC');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gradientPresets = [
    { top: '#FFDEE9', bottom: '#B5FFFC', name: 'Pastel Dream' },
    { top: '#A8EDEA', bottom: '#FED6E3', name: 'Mint Rose' },
    { top: '#FFB6C1', bottom: '#FFDAB9', name: 'Peach Blossom' },
    { top: '#E0C3FC', bottom: '#9BB5FF', name: 'Purple Sky' },
    { top: '#FFF1EB', bottom: '#ACE0F9', name: 'Sunset Cloud' },
    { top: '#FFE5B4', bottom: '#FFCCCB', name: 'Warm Coral' },
    { top: '#C1FBA4', bottom: '#7FB3D3', name: 'Nature Fresh' },
    { top: '#F093FB', bottom: '#F5576C', name: 'Pink Passion' }
  ];

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (128KB = 131072 bytes)
    if (file.size > 131072) {
      alert('Kích thước file phải nhỏ hơn 128KB');
      return;
    }

    // Check file type
    if (!file.type.includes('png') && !file.type.includes('gif')) {
      alert('Chỉ chấp nhận file PNG hoặc GIF');
      return;
    }

    if (!canUploadIcon()) {
      alert('Bạn đã hết quota upload icon hôm nay');
      return;
    }

    setIsUploading(true);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setIconPreview(e.target?.result as string);
      setIconFile(file);
      updateUserQuota();
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveCaption = () => {
    if (!user) return;

    addCaption({
      text: captionText.trim() || 'Caption Kanade', // Use default if empty
      tags: tags.length > 0 ? tags : null,
      author: user.id,
      type: iconFile ? 'image_icon' : 'background',
      icon_url: iconFile ? URL.createObjectURL(iconFile) : undefined,
      color: selectedColor,
      colortop: selectedColorTop,
      colorbottom: selectedColorBottom,
      isFavorite: false
    });

    // Reset form
    setCaptionText('');
    setTags([]);
    setIconFile(null);
    setIconPreview('');
    setSelectedColor('#ffffff');
    setSelectedColorTop('#FFDEE9');
    setSelectedColorBottom('#B5FFFC');
    setTagInput('');

    // Show success message
    const event = new CustomEvent('caption-saved');
    window.dispatchEvent(event);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Caption Builder
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tạo caption đẹp mắt với gradient và icon tùy chỉnh
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          {/* Caption Text */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-4">
              <Type className="text-pink-600 dark:text-pink-400" size={20} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nội dung Caption
              </h3>
            </div>
            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Caption Kanade"
              className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Icon Upload - Only for Members */}
          {captionUser.isMember && (
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
                    disabled={isUploading || !canUploadIcon()}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {isUploading ? 'Đang tải...' : 'Upload Icon'}
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Còn {getRemainingQuota()}/5 ảnh hôm nay
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.gif"
                  onChange={handleIconUpload}
                  className="hidden"
                />

                {iconPreview && (
                  <div className="flex items-center gap-2">
                    <img src={iconPreview} alt="Icon" className="w-8 h-8 rounded-full object-cover" />
                    <button
                      onClick={() => {
                        setIconFile(null);
                        setIconPreview('');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  • Chỉ file PNG/GIF, tối đa 128KB
                  • Tỷ lệ vuông (1:1) được khuyến nghị
                </div>
              </div>
            </div>
          )}

          {/* Non-member notice */}
          {!captionUser.isMember && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="text-yellow-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tính năng Premium
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Chỉ thành viên mới được thêm icon riêng cho caption.
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all">
                Nâng cấp ngay
              </button>
            </div>
          )}

          {/* Styling Options */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-pink-600 dark:text-pink-400" size={20} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tùy chỉnh giao diện
              </h3>
            </div>
            
            <div className="space-y-4">

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Màu chữ
                </label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>

              {/* Gradient Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Màu trên
                  </label>
                  <input
                    type="color"
                    value={selectedColorTop}
                    onChange={(e) => setSelectedColorTop(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Màu dưới
                  </label>
                  <input
                    type="color"
                    value={selectedColorBottom}
                    onChange={(e) => setSelectedColorBottom(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Gradient Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gradient có sẵn
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedColorTop(preset.top);
                        setSelectedColorBottom(preset.bottom);
                      }}
                      className="aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-pink-500 transition-colors"
                      style={{
                        background: `linear-gradient(to bottom, ${preset.top}, ${preset.bottom})`
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
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
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-pink-900 dark:hover:text-pink-100"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="text-pink-600 dark:text-pink-400" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Xem trước
                </h3>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
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

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveCaption}
              // disabled={!captionText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              Lưu Caption
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CaptionBuilder;