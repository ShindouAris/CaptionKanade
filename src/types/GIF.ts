export interface GifResponse {
  result: boolean;
  data: {
    data: GifItem[];
    current_page: number;
    per_page: number;
    has_next: boolean;
    meta: Meta;
  };
}

export interface GifItem {
  id: number;
  slug: string;
  title: string;
  file: FileVariants;
  tags: string[];
  type: "gif";
  blur_preview: string;
}

export interface FileVariants {
  hd: GifSize;
  md: GifSize;
  sm: GifSize;
  xs: GifSize;
}

export interface GifSize {
  gif: GifFile;
}

export interface GifFile {
  url: string;
  width: number;
  height: number;
  size: number;
}

export interface Meta {
  item_min_width: number;
  ad_max_resize_percent: number;
}
