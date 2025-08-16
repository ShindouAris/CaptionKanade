import React, { useState, useRef } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { IoPaperPlane } from "react-icons/io5";
import { MdNearMeDisabled } from "react-icons/md";
import { useCaptions } from '../contexts/CaptionContext';
import { useAuth } from '../contexts/AuthContext';
import { Caption } from '../types/Caption';
import toast from 'react-hot-toast';
import { CaptionText } from './captionUI/CaptionText';
import { StyleOptions } from './captionUI/StyleOptions';
import { TagsSection } from './captionUI/TagSelection';
import { IconUpload } from './captionUI/IconUpload';
import { Preview } from './captionUI/Preview';
import { CaptionUploadSuccess } from './captionUI/CaptionUploadSuccess';
import {IconUrlUpload} from './captionUI/IconUrlUpload';


const CaptionBuilder: React.FC = () => {
  const { addCaption, user: captionUser, canUploadIcon, quota, fetchUserQuota } = useCaptions();
  const { user } = useAuth();
  const [captionText, setCaptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedColorTop, setSelectedColorTop] = useState('#FFDEE9');
  const [selectedColorBottom, setSelectedColorBottom] = useState('#B5FFFC');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [uploadedCaption, setUploadedCaption] = useState<Caption | null>(null);
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
    if (file.size > 3 * 1024 * 1024) {
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

  const handleIconUrlUpload = async (url: string) => {

    setIsUploading(true);
    try {
      setIconPreview(url);
      setIconUrl(url);
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error('Có lỗi xảy ra khi tải lên icon. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // Kiểm tra quota
  const remainingCaptionQuota = 20 - (quota.today_upload_count || 0);
  const remainingIconQuota = 3 - (quota.icon_upload_count || 0);

  // Gọi lại fetchUserQuota sau khi upload thành công
  const handleSaveCaption = async () => {
    if (!user) return;
    if (remainingCaptionQuota <= 0) {
      toast.error('Bạn đã hết lượt upload caption hôm nay (20/20)');
      return;
    }
    if (iconFile && remainingIconQuota <= 0) {
      toast.error('Bạn đã hết lượt upload icon hôm nay (3/3)');
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
        icon_link: iconUrl || undefined,
        color: selectedColor,
        colortop: selectedColorTop,
        colorbottom: selectedColorBottom,
        is_favorite: false
      };
      const saved = await addCaption(captionData);
      setUploadedCaption(saved);
      setShowUploadSuccess(true);
      toast.success('Đã đăng caption thành công');
      // Reset form
      setCaptionText('');
      setTags([]);
      setIconFile(null);
      setIconPreview('');
      setIconUrl('')
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
          Caption Studio
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
          
          {!iconFile && (
            <IconUrlUpload 
            iconPreview={iconPreview}
            isUploading={isUploading}
            onUpload={handleIconUrlUpload}
            onRemove={() => {
              setIconPreview('');
              setIconUrl('');
              }}
            remainingQuota={remainingCaptionQuota}
            />
          )}

          {!captionUser.isMember && !iconUrl && (remainingIconQuota > 0) && (
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
              disabled={Boolean(!user || !user.is_verified || isSubmitting || remainingCaptionQuota <= 0 || (iconFile && remainingIconQuota <= 0))}
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
              ) : remainingCaptionQuota <= 0 ? (
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
              Bạn còn {remainingCaptionQuota} lượt upload caption hôm nay
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />

      <CaptionUploadSuccess
        open={showUploadSuccess}
        onOpenChange={setShowUploadSuccess}
        caption={uploadedCaption}
        />
      </div>
  );
};

export default CaptionBuilder;