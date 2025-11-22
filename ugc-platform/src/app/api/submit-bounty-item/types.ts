export interface SubmitBountyItemRequest {
  url: string
  bountyId: string // UUID string instead of number
}

export interface YouTubeVideoSnippet {
  title: string
  description: string
  channelId: string
  channelTitle: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
    standard?: { url: string; width: number; height: number }
    maxres?: { url: string; width: number; height: number }
  }
  publishedAt: string
}

export interface YouTubeVideoStatistics {
  viewCount: string
  likeCount: string
  commentCount: string
}

export interface YouTubeVideoResponse {
  items: Array<{
    id: string
    snippet: YouTubeVideoSnippet
    statistics: YouTubeVideoStatistics
  }>
}

export interface BountyItemData {
  url: string
  bountyId: string // UUID string instead of number
  title: string
  description: string
  coverImage: string
  author?: string
  viewCount?: number
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other'
  createdAt: string
  submittedBy?: {
    userId: string
    username?: string
    email?: string
  }
}

export interface SubmitBountyItemResponse {
  success: boolean
  data?: BountyItemData
  error?: string
}

