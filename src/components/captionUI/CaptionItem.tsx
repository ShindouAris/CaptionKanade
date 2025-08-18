import React, {useState} from "react";
import { Calendar, Heart, Tag, Trash2, Sparkles, TrendingUp } from "lucide-react";
import { FaHeart } from "react-icons/fa6";
import { FaHashtag } from "react-icons/fa";

import { Badge } from "../ui/badge";
import { Caption } from "@/types/Caption";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import toast from "react-hot-toast";

interface CaptionProps {
  caption: Caption;
  user: any;
  toggleFavorite: (id: string) => void;
  handleDelete: (id: string) => void;
}



export const CaptionItem: React.FC<CaptionProps> = ({ 
  caption, 
  user, 
  toggleFavorite, 
  handleDelete 
}) => {
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
  try {
    navigator.clipboard.writeText(caption.id) 
    toast.success("Đã copy id của caption này vào clipboad")
  } catch (error) {
    toast.error("Lỗi khi copy vào clipboard")
  }
}
  return (
    <>
    <div className="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
      
    >
      
      {/* Popular Badge */}
      {caption.is_popular && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            <TrendingUp size={12} />
            <span>HOT</span>
          </div>
        </div>
      )}

      {/* Header with gradient preview */}
      <div className="relative h-32 overflow-hidden" onClick={() => setOpen(!open)}>
        {/* <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${caption.colortop}, ${caption.colorbottom})`
          }}
        /> */}
        
        {/* Caption preview overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-8">
          <div 
            className="
              flex items-center gap-3 px-4 py-2 rounded-full max-w-full backdrop-blur-sm
              lg:px-6 lg:py-3 lg:gap-5
              transition-all duration-300
            "
            style={{
              background: `linear-gradient(to bottom, ${caption.colortop}, ${caption.colorbottom})`,
              color: caption.color,
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {caption.icon_url && (
              <img 
                src={caption.icon_url} 
                alt="Icon" 
                className="w-5 h-5 rounded-md object-cover flex-shrink-0
                  lg:w-8 lg:h-8
                " 
              />
            )}
            <span 
              className="text-sm font-bold truncate max-w-48
                lg:text-lg lg:max-w-xl
              "
              style={{ color: caption.color }}
            >
              {caption.text.length > 40 ? `${caption.text.substring(0, 40)}...` : caption.text}
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2">
          <Sparkles className="w-4 h-4 text-white/60" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Full caption text */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed text-sm">
            {caption.text}
          </p>
        </div>  

        {/* Tags */}
        {caption.tags && caption.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {caption.tags.slice(0, 3).map(tag => (
              <Badge 
                key={tag}
                className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-800/50"
              >
                <Tag size={10} />
                {tag}
              </Badge>
            ))}
            {caption.tags.length > 3 && (
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                +{caption.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bottom section */}
        <div className="flex items-center justify-between">
          
          {/* Left side - Meta info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <Calendar size={12} />
              <span>{new Date(caption.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            
            <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/50">
              <Heart size={12} />
              <span className="ml-1">{caption.favorite_count}</span>
            </Badge>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => toggleFavorite(caption.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  caption.is_favorite
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                }`}
              >
                {caption.is_favorite ? (
                  <>
                    <FaHeart size={14} />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Heart size={14} />
                    <span>Lưu</span>
                  </>
                )}
              </button>
            )}

            {caption.author === user?.id && (
              <button
                onClick={() => handleDelete(caption.id)}
                className="flex items-center justify-center p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105"
                title="Xóa caption"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-lg font-bold">{caption.text}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {/* Preview lớn */}
            <div
              className="w-full h-64 rounded-3xl flex items-center justify-center"
            >
              <div 
                className="
                  flex items-center gap-3 
                  px-6 py-2.5 
                  rounded-3xl max-w-full 
                  backdrop-blur-sm
                  sm:px-9 sm:py-4.5 sm:gap-[21.6px]
                  sm:min-h-[72px]
                "
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
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-md object-cover flex-shrink-0" 
                  />
                )}
                <span 
                  className="text-md sm:text-xl font-bold truncate max-w-48 sm:max-w-xs"
                  style={{ color: caption.color }}
                >
                  {caption.text.length > 40 ? `${caption.text.substring(0, 40)}...` : caption.text}
                </span>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                <Calendar size={14} className="inline mr-1" />
                {new Date(caption.created_at).toLocaleDateString("vi-VN")}
              </span>
              <button onClick={handleCopy}>
                <FaHashtag size={14} className="inline mr-1" />
                {caption.id}
              </button>
              <span className="inline">
                ❤️ {caption.favorite_count}
              </span>
            </div>

            {/* Tags */}
            {caption.tags && caption.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {caption.tags?.map(tag => (
                  <Badge key={tag} className="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


