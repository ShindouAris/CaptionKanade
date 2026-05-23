import React from "react";
import { Palette } from "lucide-react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { MAX_CAPTION_COLORS, normalizeCaptionColors } from "@/lib/captionColors";

type PalettePreset = {
  colors: string[];
  name: string;
  color: string;
};

const randomHexColor = (): string => {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
};

const colorDistance = (c1: string, c2: string): number => {
  const [r1, g1, b1] = c1.match(/\w\w/g)!.map((v) => parseInt(v, 16));
  const [r2, g2, b2] = c2.match(/\w\w/g)!.map((v) => parseInt(v, 16));
  return Math.sqrt(
    (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
  );
};

const randomName = (): string => {
  const adjectives = [
    "Pastel",
    "Mint",
    "Peach",
    "Purple",
    "Sunset",
    "Warm",
    "Nature",
    "Pink",
    "Ocean",
    "Golden",
  ];
  const nouns = [
    "Dream",
    "Rose",
    "Blossom",
    "Sky",
    "Cloud",
    "Coral",
    "Fresh",
    "Passion",
    "Mist",
    "Glow",
  ];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`;
};

function hexToRgb(hex: string) {
  const [r, g, b] = hex.match(/\w\w/g)!.map((v) => parseInt(v, 16));
  return { r, g, b };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function mixColors(c1: string, c2: string) {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const r = Math.floor((rgb1.r + rgb2.r) / 2);
  const g = Math.floor((rgb1.g + rgb2.g) / 2);
  const b = Math.floor((rgb1.b + rgb2.b) / 2);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const generatePalette = (): string[] => {
  const count = 2 + Math.floor(Math.random() * 3);
  const palette: string[] = [];

  while (palette.length < count) {
    let color = randomHexColor();
    while (palette.some((existing) => colorDistance(existing, color) < 100)) {
      color = randomHexColor();
    }
    palette.push(color);
  }

  return palette;
};

export const generateGradients = (count: number): PalettePreset[] => {
  const presets: PalettePreset[] = [];
  while (presets.length < count) {
    const colors = generatePalette();

    // Màu chữ = màu trung gian + điều chỉnh sáng/tối
    const mid = mixColors(colors[0], colors[colors.length - 1]);
    const lum = luminance(hexToRgb(mid));
    const textColor = lum > 128 ? "#1F2937" /* text-gray-800 */ : "#F9FAFB"; /* text-gray-50 */

    presets.push({ colors, color: textColor, name: randomName() });
  }
  return presets;
};



export const StyleOptions = React.memo(({ 
  selectedColor,
  selectedColors,
  onColorChange,
  onColorsChange,
}: {
  selectedColor: string;
  selectedColors: string[];
  onColorChange: (color: string) => void;
  onColorsChange: (colors: string[]) => void;
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-primary/20 dark:border-gray-600">
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Palette className="text-primary dark:text-primary" size={18} />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Tùy chỉnh giao diện
        </h3>
      </div>
      <Button className="bg-gradient-to-br from-primary/20 to-blue-300 text-black font-comic text-xs sm:text-sm px-3 sm:px-4 py-2" onClick={() => {
          const newPalette = generateGradients(1)[0]
          onColorsChange(newPalette.colors)
          onColorChange(newPalette.color)
        toast.success(`Đã tạo một palette mới - ${newPalette.name}!`)
      }}>
        <span className="hidden sm:inline">Random một màu mới</span>
        <span className="sm:hidden">Random màu</span>
      </Button>
    </div>
    
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Màu chữ
        </label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full h-8 sm:h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Palette màu ({selectedColors.length}/{MAX_CAPTION_COLORS})
          </label>
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3 text-xs"
            disabled={selectedColors.length >= MAX_CAPTION_COLORS}
            onClick={() => onColorsChange([...selectedColors, selectedColors[selectedColors.length - 1] ?? '#FFFFFF'])}
          >
            Thêm màu
          </Button>
        </div>

        <div className="space-y-2">
          {selectedColors.map((color, index) => (
            <div key={`${color}-${index}`} className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Màu {index + 1}
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const nextColors = [...selectedColors];
                    nextColors[index] = e.target.value;
                    onColorsChange(normalizeCaptionColors(nextColors, selectedColors));
                  }}
                  className="w-full h-8 sm:h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mt-5 h-8 px-3 text-xs text-red-600 hover:text-red-700"
                disabled={selectedColors.length <= 1}
                onClick={() => {
                  if (selectedColors.length <= 1) return;
                  onColorsChange(selectedColors.filter((_, currentIndex) => currentIndex !== index));
                }}
              >
                Xóa
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));