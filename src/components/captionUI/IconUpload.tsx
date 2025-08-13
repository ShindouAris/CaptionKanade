import React, { useState, useRef, useCallback, ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Image as ImageIcon, Crown, Upload, X } from "lucide-react";

export interface IconUploadProps {
  iconFile?: File | null;
  iconPreview?: string | null;
  isUploading?: boolean;
  onUpload: (file: File) => void; // called after user presses Apply with the cropped File
  onRemove: () => void; // called when user removes the preview
  remainingQuota?: number;
}

export const IconUpload: React.FC<IconUploadProps> = React.memo(
  ({
    iconFile = null,
    iconPreview = null,
    isUploading = false,
    onUpload,
    onRemove,
    remainingQuota = 3,
  }: IconUploadProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null); // original uploaded image as dataURL
    const [previewUrl, setPreviewUrl] = useState<string | null>(iconPreview);

    // Sync with iconPreview prop when it changes
    React.useEffect(() => {
      if (iconPreview !== previewUrl) {
        // Only update if we don't have a local preview or if iconPreview is different
        if (!previewUrl || iconPreview !== previewUrl) {
          setPreviewUrl(iconPreview);
        }
      }
    }, [iconPreview]);

    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [showCropper, setShowCropper] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Check if file is animated GIF or WebP
    const isAnimatedFile = (file: File): boolean => {
      const type = file.type.toLowerCase();
      return type === 'image/gif' || type === 'image/webp';
    };

    const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        if (e.target) e.target.value = "";
        return;
      }

      // Check if it's an animated file type - skip cropper
      if (isAnimatedFile(file)) {
        // Create preview URL immediately for better UX
        const url = URL.createObjectURL(file);
        
        // Revoke previous preview if we created one
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        
        // Set preview immediately
        setPreviewUrl(url);
        
        // Upload the file - parent will handle the actual upload
        onUpload(file);
        
        // Clear input so same file can be selected again later
        if (e.target) e.target.value = "";
        return;
      }

      // For static images, proceed with cropper
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);

      // Clear input so same file can be selected again later
      if (e.target) e.target.value = "";
    };

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCancel = () => {
      setShowCropper(false);
      setImageSrc(null);
    };

    const handleApply = async () => {
      if (!imageSrc || !croppedAreaPixels) return;

      try {
        // get a Blob (PNG) from the canvas crop
        const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
        const filename = iconFile?.name ?? `icon-${Date.now()}.png`;
        const file = new File([blob], filename, { type: blob.type || "image/png" });

        // pass file to parent to upload/store
        onUpload(file);

        // show preview locally
        const url = URL.createObjectURL(blob);
        // revoke previous preview if we created one
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
      } catch (err) {
        console.error("Failed to crop image", err);
      } finally {
        setShowCropper(false);
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
      }
    };

    const handleRemove = () => {
      // Revoke blob URL if we created it
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      onRemove();
    };

    // Cleanup blob URLs when component unmounts
    React.useEffect(() => {
      return () => {
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    return (
      <div className="p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-pink-600 dark:text-pink-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Icon Caption</h3>
            <Crown className="text-yellow-500" size={16} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload icon"
              >
                <Upload size={16} />
                {isUploading ? "Đang tải..." : "Upload Icon"}
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">Còn {remainingQuota}/3 ảnh hôm nay</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.gif,.webp,image/*"
              onChange={onSelectFile}
              className="hidden"
            />

            {previewUrl && (
              <div className="flex items-center gap-2">
                <img src={previewUrl} alt="Icon preview" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                <button onClick={handleRemove} className="text-red-500 hover:text-red-700" aria-label="Remove icon">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400">
              • Chỉ file PNG/GIF/WebP, tối đa 1MB cho ảnh và 3MB cho gif<br />
              • Tỷ lệ vuông (1:1) được khuyến nghị<br />
              • GIF và WebP động sẽ được tải lên trực tiếp (không cắt)
            </div>
          </div>
        </div>

        {showCropper && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cắt ảnh</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Điều chỉnh vùng cắt cho icon của bạn</p>
              </div>
              
              <div className="relative flex-1 bg-gray-100 dark:bg-gray-900 min-h-[400px]">
                <Cropper
                  image={imageSrc || undefined}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button 
                  onClick={handleCancel} 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleApply} 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default IconUpload;

// ----- helpers -----
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob from canvas"));
    }, "image/png");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}