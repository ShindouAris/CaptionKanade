export interface Comment {
  id: string
  caption_id: string
  author_id: string
  author_username: string | null
  parent_id: string | null
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  replies: Comment[]
}

export interface CommentResponse {
  total: number
  page: number
  limit: number
  comments: Comment[]
}
