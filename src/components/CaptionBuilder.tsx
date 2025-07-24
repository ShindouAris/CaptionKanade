import React, { useState, useRef } from 'react';
import { Upload, Type, Palette, Hash, Eye, EyeOff, X, Image, Crown, Loader2 } from 'lucide-react';
import { IoPaperPlane } from "react-icons/io5";
import { MdNearMeDisabled } from "react-icons/md";
import { useCaptions } from '../contexts/CaptionContext';
import { useAuth } from '../contexts/AuthContext';
import { Caption } from '../types/Caption';
import toast from 'react-hot-toast';

// Tách các component con để tối ưu render
const CaptionText = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
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

const IconUpload = React.memo(({ 
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
          • Chỉ file PNG/GIF, tối đa 3MB
          • Tỷ lệ vuông (1:1) được khuyến nghị
        </div>
      </div>
    </div>
  );
});

const StyleOptions = React.memo(({ 
  selectedColor,
  selectedColorTop,
  selectedColorBottom,
  onColorChange,
  onGradientChange,
  gradientPresets
}: {
  selectedColor: string;
  selectedColorTop: string;
  selectedColorBottom: string;
  onColorChange: (color: string) => void;
  onGradientChange: (top: string, bottom: string) => void;
  gradientPresets: Array<{ top: string; bottom: string; name: string; }>;
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
    <div className="flex items-center gap-2 mb-4">
      <Palette className="text-pink-600 dark:text-pink-400" size={20} />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Tùy chỉnh giao diện
      </h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Màu chữ
        </label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Màu trên
          </label>
          <input
            type="color"
            value={selectedColorTop}
            onChange={(e) => onGradientChange(e.target.value, selectedColorBottom)}
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
            onChange={(e) => onGradientChange(selectedColorTop, e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gradient có sẵn
        </label>
        <div className="grid grid-cols-4 gap-2">
          {gradientPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => onGradientChange(preset.top, preset.bottom)}
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
));

const TagsSection = React.memo(({ 
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

const Preview = React.memo(({ 
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

const CaptionBuilder: React.FC = () => {
  const { addCaption, user: captionUser, canUploadIcon, getRemainingQuota, quota, fetchUserQuota } = useCaptions();
  const { user } = useAuth();
  const [captionText, setCaptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedColorTop, setSelectedColorTop] = useState('#FFDEE9');
  const [selectedColorBottom, setSelectedColorBottom] = useState('#B5FFFC');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleIconUpload = async (file: File) => {
    if (file.size > 3145728) {
      toast.error('Kích thước file phải nhỏ hơn 3MB');
      return;
    }

    if (!file.type.includes('png') && !file.type.includes('gif')) {
      toast.error('Chỉ chấp nhận file PNG hoặc GIF');
      return;
    }

    if (!canUploadIcon()) {
      toast.error('Bạn đã hết quota upload icon hôm nay');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onload = () => {
          try {
            const previewUrl = reader.result as string;
            setIconPreview(previewUrl);
            setIconFile(file);
            toast.success('Tải lên icon thành công');
            resolve(null);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error('Có lỗi xảy ra khi tải lên icon. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // Kiểm tra quota
  const remainingImageQuota = 20 - (quota.today_upload_count || 0);
  const remainingIconQuota = 7 - (quota.icon_upload_count || 0);

  // Gọi lại fetchUserQuota sau khi upload thành công
  const handleSaveCaption = async () => {
    if (!user) return;
    if (remainingImageQuota <= 0) {
      toast.error('Bạn đã hết lượt upload caption hôm nay (20/20)');
      return;
    }
    if (iconFile && remainingIconQuota <= 0) {
      toast.error('Bạn đã hết lượt upload icon hôm nay (7/7)');
      return;
    }
    setIsSubmitting(true);
    try {
      const captionData: Omit<Caption, 'id' | 'created_at' | 'updated_at'> & { icon_file?: File } = {
        text: captionText.trim() || 'Caption Kanade',
        tags: tags.length > 0 ? tags : null,
        author: user.id,
        type: iconFile ? 'image_icon' : 'background',
        icon_url: '',
        icon_file: iconFile || undefined,
        color: selectedColor,
        colortop: selectedColorTop,
        colorbottom: selectedColorBottom,
        is_favorite: false
      };
      await addCaption(captionData);
      toast.success('Đã đăng caption thành công');
      // Reset form
      setCaptionText('');
      setTags([]);
      setIconFile(null);
      setIconPreview('');
      setSelectedColor('#ffffff');
      setSelectedColorTop('#FFDEE9');
      setSelectedColorBottom('#B5FFFC');
      const event = new CustomEvent('caption-saved');
      window.dispatchEvent(event);
      await fetchUserQuota(); // Cập nhật lại quota sau khi upload
    } catch (error) {
      console.error('Error saving caption:', error);
      toast.error('Có lỗi xảy ra khi lưu caption. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white to-purple-600 mb-2">
          Caption Builder
        </h1>
        <p className="dark:text-gray-300">
          Tạo caption đẹp mắt với gradient và icon tùy chỉnh
        </p>
        {/* <div className="mt-2 flex gap-4 text-sm text-gray-700 dark:text-gray-300">
          <span>Quota caption: <b>{remainingImageQuota}</b>/40</span>
          <span>Quota icon: <b>{remainingIconQuota}</b>/5</span>
        </div> */}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          <CaptionText value={captionText} onChange={setCaptionText} />

          {/* Icon Upload - Only for Members */}
          {!captionUser.isMember && (
            <IconUpload
              iconFile={iconFile}
              iconPreview={iconPreview}
              isUploading={isUploading}
              onUpload={handleIconUpload}
              onRemove={() => {
                setIconFile(null);
                setIconPreview('');
              }}
              remainingQuota={remainingIconQuota}
            />
          )}

          {/* Non-member notice */}
          {captionUser.isMember && (
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

          <StyleOptions
            selectedColor={selectedColor}
            selectedColorTop={selectedColorTop}
            selectedColorBottom={selectedColorBottom}
            onColorChange={setSelectedColor}
            onGradientChange={(top, bottom) => {
              setSelectedColorTop(top);
              setSelectedColorBottom(bottom);
            }}
            gradientPresets={gradientPresets}
          />

          <TagsSection
            tags={tags}
            onAddTag={(tag) => {
              if (!tags.includes(tag)) {
                setTags([...tags, tag]);
                toast.success('Đã thêm tag mới');
              } else {
                toast.error('Tag này đã tồn tại');
              }
            }}
            onRemoveTag={(tag) => setTags(tags.filter(t => t !== tag))}
          />
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Preview
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            captionText={captionText}
            selectedColor={selectedColor}
            selectedColorTop={selectedColorTop}
            selectedColorBottom={selectedColorBottom}
            iconPreview={iconPreview}
          />

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveCaption}
              disabled={Boolean(!user || !user.is_verified || isSubmitting || remainingImageQuota <= 0 || (iconFile && remainingIconQuota <= 0))}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!user?.is_verified ? (
                <>
                  <MdNearMeDisabled size={20} />
                  Bạn cần xác thực email để đăng caption
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang đăng...
                </>
              ) : remainingImageQuota <= 0 ? (
                <>
                  <MdNearMeDisabled size={20} />
                  Đã hết lượt upload caption hôm nay
                </>
              ) : iconFile && remainingIconQuota <= 0 ? (
                <>
                  <MdNearMeDisabled size={20} />
                  Đã hết lượt upload icon hôm nay
                </>
              ) : (
                <>
                  <IoPaperPlane size={20} />
                  Đăng Caption
                </>
              )}
            </button>
          </div>
          <div className="flex justify-center items-center gap-2 text-sm text-gray-700 dark:text-gray-300 text-center">
            <div
              className="rounded-lg px-4 py-2 shadow-sm font-bold"
              style={{
                background: "linear-gradient(to right, #f9a8d4, #8b5cf6)",
                color: "#374151"
              }}
            >
              Bạn còn {remainingImageQuota} lượt upload caption hôm nay
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CaptionBuilder;