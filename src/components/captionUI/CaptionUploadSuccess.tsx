import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Caption } from "@/types/Caption";
import { Sparkles, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface CaptionUploadSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caption: Caption | null;
  is_private: boolean
}

export const CaptionUploadSuccess: React.FC<CaptionUploadSuccessProps> = ({ open, onOpenChange, caption, is_private }) => {
  const handleCopyId = async () => {
    if (!caption?.id) return;
    try {
      await navigator.clipboard.writeText(caption.id);
      toast.success("Đã copy ID caption vào clipboard");
    } catch (error) {
      toast.error("Không thể copy vào clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 size={20} />
            Đăng caption thành công
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {caption && (
            <div className="rounded-2xl p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-full h-28 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-4 h-4 text-white/70" />
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(to bottom, ${caption.colortop}, ${caption.colorbottom})`,
                    color: caption.color,
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {caption.icon_url && (
                    <img
                      src={caption.icon_url}
                      alt="Icon"
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <span className="text-sm font-bold truncate max-w-48" style={{ color: caption.color }}>
                    {caption.text.length > 40 ? `${caption.text.substring(0, 40)}...` : caption.text}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                <button onClick={handleCopyId} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  ID: {caption.id}
                </button>
                <span>{new Date(caption.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Đóng
            </button>
            {is_private ? <a
              href="/userprofile"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition"
            >
              Xem profile
            </a> 
            : 
            <a
              href="/library"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition"
            >
              Xem thư viện
            </a>
            }
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


