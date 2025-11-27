// TikTok Direct API Response Types

export interface TikTokVideoObject {
  id: string;
  create_time: number;
  cover_image_url?: string;
  share_url?: string;
  video_description?: string;
  duration?: number;
  height?: number;
  width?: number;
  title?: string;
  embed_html?: string;
  embed_link?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
}

export interface TikTokVideoQueryResponse {
  data: {
    videos: TikTokVideoObject[];
  };
  error: {
    code: number;
    message: string;
    log_id: string;
  };
}

export interface TikTokResearchVideo {
  id: string | number;
  create_time: number;
  username?: string;
  region_code?: string;
  video_description?: string;
  music_id?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  hashtag_names?: string[];
}

export interface TikTokResearchResponse {
  data: {
    videos: TikTokResearchVideo[];
    cursor?: number;
    has_more?: boolean;
    search_id?: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  } | null;
}

// Peekalink API Response Types (Fallback)

export interface PeekalinkImage {
  thumbnail: ImageSize;
  medium: ImageSize;
  large: ImageSize;
  original: ImageSize;
}

export interface ImageSize {
  width: number;
  height: number;
  url: string;
}

export interface TikTokUser {
  id: number;
  username: string;
  verified: boolean;
  name: string;
  bio: string;
  url: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  visibility: string;
  avatar: PeekalinkImage;
}

export interface TikTokMedia {
  width: number;
  height: number;
  size: number;
  format: string;
  hasAlphaChannel: boolean;
  thumbnail: ImageSize;
  medium: ImageSize;
  large: ImageSize;
  original: ImageSize;
}

export interface TikTokVideoData {
  id: number;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  playsCount: number; // This is the view count
  sharesCount: number;
  text: string;
  user: TikTokUser;
  media: TikTokMedia[];
}

export interface PeekalinkResponse {
  id: number;
  ok: boolean;
  url: string;
  domain: string;
  type: string;
  status: number;
  updatedAt: string;
  size: number;
  redirected: boolean;
  title: string;
  description: string;
  image: PeekalinkImage;
  tiktokVideo: TikTokVideoData;
  requestId: string;
}

// API Request/Response Types

export interface TikTokViewsRequest {
  urls: string[];
}

export interface VideoViewResult {
  url: string;
  viewCount: number | null;
  success: boolean;
  error?: string;
  metadata?: {
    username: string;
    title: string;
    likes: number;
    comments: number;
    shares: number;
    publishedAt: string;
  };
}

export interface TikTokViewsResponse {
  results: VideoViewResult[];
  summary: {
    totalVideos: number;
    successful: number;
    failed: number;
    totalViews: number;
  };
}

