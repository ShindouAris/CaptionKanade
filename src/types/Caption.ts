export interface Caption {
  id: string;
  author: string;
  text: string;
  type: 'background' | 'image_icon' | 'image_gif';
  icon_url?: string;
  icon_link?: string;
  icon_delete_link?: string;
  tags: string[] | null;
  color: string;
  colortop: string;
  colorbottom: string;
  created_at: string;
  updated_at: string;
  favorite_count?: number;
  is_favorite?: boolean;
  is_popular?: boolean;
  is_private?: boolean;
}

export interface CaptionCreateForm {
  author: string;
  text: string;
  icon_url?: File;
  tags: string[] | null;
  color: string;
  colortop: string;
  colorbottom: string;
}

export interface CaptionStyle {
  font: string;
  color: string;
  colortop: string;
  colorbottom: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface CaptionFilter {
  tags: string[];
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'popular';
}

export interface UserQuota {
  date: string;
  uploadCount: number;
  maxUploads: number;
}

export interface User {
  isMember: boolean;
  quota: UserQuota;
}