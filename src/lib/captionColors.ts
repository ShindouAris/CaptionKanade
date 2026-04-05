export const MAX_CAPTION_COLORS = 8;
export const DEFAULT_CAPTION_COLORS = ['#FFDEE9', '#B5FFFC'];

export const normalizeCaptionColors = (
  colors?: string[] | null,
  fallback: string[] = DEFAULT_CAPTION_COLORS,
): string[] => {
  const palette = (colors ?? [])
    .map((color) => color.trim())
    .filter(Boolean)
    .slice(0, MAX_CAPTION_COLORS);

  if (palette.length > 0) {
    return palette;
  }

  return fallback
    .map((color) => color.trim())
    .filter(Boolean)
    .slice(0, MAX_CAPTION_COLORS);
};

export const getCaptionGradient = (
  colors?: string[] | null,
  fallback: string[] = DEFAULT_CAPTION_COLORS,
): string => {
  const palette = normalizeCaptionColors(colors, fallback);

  if (palette.length <= 1) {
    return palette[0] ?? fallback[0];
  }

  return `linear-gradient(to bottom, ${palette.join(', ')})`;
};

export const getCaptionEdgeColors = (
  colors?: string[] | null,
  fallback: string[] = DEFAULT_CAPTION_COLORS,
): { top: string; bottom: string; palette: string[] } => {
  const palette = normalizeCaptionColors(colors, fallback);
  const top = palette[0] ?? fallback[0] ?? '#ffffff';
  const bottom = palette[palette.length - 1] ?? fallback[fallback.length - 1] ?? top;

  return { top, bottom, palette };
};