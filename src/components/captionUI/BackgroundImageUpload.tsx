import React, { useRef, useState, ChangeEvent, useCallback } from "react";
import { ImageIcon, Upload, X, Link, CheckCircle, AlertCircle, Crop as CropIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

const MAX_BG_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".gif"];
const CROP_ASPECT = 16 / 9;

export interface BackgroundImageUploadProps {
  bgFile?: File | null;
  bgPreview?: string | null;
  bgLink?: string | null;
  isUploading?: boolean;
  onUploadFile: (file: File) => void;
  onUploadLink: (url: string) => void;
  onRemove: () => void;
  remainingQuota?: number;
  mode: "file" | "url";
  onModeChange: (mode: "file" | "url") => void;
}

export const BackgroundImageUpload: React.FC<BackgroundImageUploadProps> = React.memo(
  ({
    bgPreview = null,
    isUploading = false,
    onUploadFile,
    onUploadLink,
    onRemove,
    remainingQuota = 3,
    mode,
    onModeChange,
  }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [fileError, setFileError] = useState("");

    // Cropper state
    const [cropperOpen, setCropperOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalFileName, setOriginalFileName] = useState<string>("background.png");
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const isValidImageUrl = (url: string) => {
      try {
        const { pathname } = new URL(url);
        const lower = pathname.toLowerCase();
        return ALLOWED_EXTS.some((ext) => lower.endsWith(ext));
      } catch {
        return false;
      }
    };

    const canLoadImage = (url: string): Promise<boolean> =>
      new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => resolve(false), 8000);
        img.onload = () => { clearTimeout(timer); resolve(true); };
        img.onerror = () => { clearTimeout(timer); resolve(false); };
        img.src = url;
      });

    const validateUrl = async (url: string) => {
      if (!url.trim()) { setIsValidUrl(false); setUrlError(""); return; }
      setIsValidating(true);
      setUrlError("");
      try {
        if (!isValidImageUrl(url)) {
          setIsValidUrl(false);
          setUrlError("URL phải là link ảnh trực tiếp (.jpg, .jpeg, .png, .gif)");
          return;
        }
        const ok = await canLoadImage(url);
        if (!ok) {
          setIsValidUrl(false);
          setUrlError("Không thể tải ảnh từ URL này. Vui lòng kiểm tra lại.");
          return;
        }
        setIsValidUrl(true);
        setUrlError("");
      } catch {
        setIsValidUrl(false);
        setUrlError("Có lỗi khi kiểm tra URL.");
      } finally {
        setIsValidating(false);
      }
    };

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setUrlInput(url);
      setIsValidUrl(false);
      setUrlError("");
      if (url.trim()) {
        const id = setTimeout(() => validateUrl(url), 500);
        return () => clearTimeout(id);
      }
    };

    const handleApplyUrl = () => {
      if (!isValidUrl || !urlInput.trim()) return;
      onUploadLink(urlInput.trim());
      setUrlInput("");
      setIsValidUrl(false);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (e.target) e.target.value = "";
      if (!file) return;

      setFileError("");

      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError("Chỉ chấp nhận file JPG, JPEG, PNG hoặc GIF");
        return;
      }
      if (file.size > MAX_BG_SIZE) {
        setFileError("File quá lớn. Tối đa 1MB");
        return;
      }

      // GIF: skip cropping to preserve animation
      if (file.type === "image/gif") {
        onUploadFile(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setOriginalFileName(file.name);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setCropperOpen(true);
      };
      reader.onerror = () => setFileError("Không đọc được file ảnh");
      reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    }, []);

    const closeCropper = () => {
      setCropperOpen(false);
      setImageSrc(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };

    const handleApplyCrop = async () => {
      if (!imageSrc || !croppedAreaPixels) return;
      setIsProcessing(true);
      try {
        const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
        if (blob.size > MAX_BG_SIZE) {
          setFileError("Ảnh sau khi cắt vẫn lớn hơn 1MB. Hãy chọn vùng nhỏ hơn hoặc dùng ảnh khác.");
          setIsProcessing(false);
          return;
        }
        const baseName = originalFileName.replace(/\.[^.]+$/, "") || "background";
        const file = new File([blob], `${baseName}-cropped.png`, { type: "image/png" });
        onUploadFile(file);
        closeCropper();
      } catch (err) {
        console.error("Crop failed", err);
        setFileError("Không thể cắt ảnh. Vui lòng thử lại.");
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 via-accent to-primary">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="text-blue-500 dark:text-blue-400" size={18} />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Ảnh nền Caption
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-300 dark:border-orange-600">
              Beta
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onModeChange("file")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "file"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Tải file
            </button>
            <button
              onClick={() => onModeChange("url")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === "url"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Dán URL
            </button>
          </div>

          {mode === "file" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Upload size={15} />
                  {isUploading ? "Đang tải..." : "Chọn ảnh"}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Còn {remainingQuota}/3 lượt hôm nay
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={13} /> {fileError}
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                • Chỉ chấp nhận JPG, JPEG, PNG, GIF — tối đa 1MB<br />
                • Ảnh tĩnh sẽ được cắt theo tỷ lệ 16:9 trước khi tải lên<br />
                • GIF sẽ được tải lên trực tiếp (không cắt) để giữ animation
              </div>
            </div>
          )}

          {mode === "url" && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/background.jpg"
                  disabled={isUploading || isValidating}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm pr-9"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                  </div>
                )}
                {isValidUrl && !isValidating && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                )}
                {urlError && !isValidating && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                )}
              </div>
              {urlError && <p className="text-xs text-red-500">{urlError}</p>}
              {isValidating && <p className="text-xs text-blue-500">Đang kiểm tra ảnh...</p>}
              <button
                onClick={handleApplyUrl}
                disabled={!isValidUrl || isValidating || isUploading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Link size={15} />
                Áp dụng
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                • Chỉ link ảnh trực tiếp và có các đuôi (.jpg, .jpeg, .png, .gif)<br />
                • Link phải sống liên tục để ảnh hiển thị
              </div>
            </div>
          )}

          {bgPreview && (
            <div className="mt-3 flex items-center gap-2">
              <img
                src={bgPreview}
                alt="Background preview"
                className="w-16 h-10 rounded object-cover border border-gray-200 dark:border-gray-600"
                loading="lazy"
              />
              <button onClick={onRemove} className="text-red-500 hover:text-red-700" aria-label="Xóa ảnh nền">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <Drawer
          open={cropperOpen}
          onOpenChange={(open) => {
            if (!open && !isProcessing) closeCropper();
          }}
        >
          <DrawerContent className="max-h-[85vh] sm:max-w-2xl sm:mx-auto">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center gap-2 text-base">
                <CropIcon size={16} className="text-blue-500" />
                Cắt ảnh nền (16:9)
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                Kéo để di chuyển, dùng thanh trượt để zoom.
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-2">
              <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mx-auto" style={{ aspectRatio: `${CROP_ASPECT}`, maxHeight: "45vh" }}>
                {imageSrc && (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={CROP_ASPECT}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    objectFit="contain"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                  {zoom.toFixed(2)}x
                </span>
              </div>
            </div>

            <DrawerFooter className="pt-2">
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeCropper}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApplyCrop}
                  disabled={isProcessing || !croppedAreaPixels}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Đang cắt..." : "Áp dụng"}
                </button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }
);

export default BackgroundImageUpload;

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
      else reject(new Error("Failed to create blob"));
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
