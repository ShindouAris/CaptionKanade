export interface Caption {
  id: string;
  text: string;
  tags: string[];
  font: string;
  color: string;
  colortop: string;
  colorbottom: string;
  iconUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
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
  onlyFavorites: boolean;
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