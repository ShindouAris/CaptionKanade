import React, { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Trash2, Edit3, ChevronDown, Reply } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { Comment, CommentResponse } from '../../types/Comment'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL

interface CommentSectionProps {
  captionId: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({ captionId }) => {
  const { user, getAuthHeader } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [_, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async (pageNum: number = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/comments/${captionId}?page=${pageNum}&limit=20`, {
        headers: { 'Accept': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to fetch comments')
      const data: CommentResponse = await res.json()
      if (pageNum === 1) {
        setComments(data.comments)
      } else {
        setComments(prev => [...prev, ...data.comments])
      }
      setTotal(data.total)
      setHasMore(data.comments.length === 20)
    } catch (e) {
      console.error('Error fetching comments:', e)
    } finally {
      setLoading(false)
    }
  }, [captionId])

  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  const handleCreate = async (content: string, parentId: string | null = null) => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/comments/create`, {
        method: 'POST',
        headers: { ...getAuthHeader() as Record<string, string> },
        body: JSON.stringify({
          caption_id: captionId,
          content: content.trim(),
          parent_id: parentId
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to create comment')
      }
      setNewComment('')
      setReplyTo(null)
      setReplyText('')
      fetchComments(1)
      toast.success('Bình luận thành công!')
    } catch (e: any) {
      toast.error(e.message || 'Không thể tạo bình luận')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: { ...getAuthHeader() as Record<string, string> },
        body: JSON.stringify({ content: editText.trim() })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to update comment')
      }
      setEditingId(null)
      setEditText('')
      fetchComments(1)
      toast.success('Đã cập nhật bình luận!')
    } catch (e: any) {
      toast.error(e.message || 'Không thể cập nhật bình luận')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() as Record<string, string> }
      })
      if (!res.ok) throw new Error('Failed to delete comment')
      fetchComments(1)
      toast.success('Đã xóa bình luận!')
    } catch {
      toast.error('Không thể xóa bình luận')
    }
  }

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isAuthor = user?.id === comment.author_id

    return (
      <div key={comment.id} className={`min-w-0 ${isReply ? 'ml-4 pl-3 border-l-2 border-primary/20 sm:ml-8 sm:pl-4' : ''}`}>
        {editingId === comment.id ? (
          <div className="space-y-2 py-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full min-w-0 p-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
              rows={2}
              maxLength={1000}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(comment.id)}
                disabled={submitting || !editText.trim()}
                className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Lưu
              </button>
              <button
                onClick={() => { setEditingId(null); setEditText('') }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-lg"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <div className="flex min-w-0 items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                {(comment.author_username || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {comment.author_username || 'Người dùng'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                  {comment.is_deleted ? (
                    <span className="italic text-gray-400">[đã xóa]</span>
                  ) : (
                    comment.content
                  )}
                </p>
                {!comment.is_deleted && (
                  <div className="flex items-center gap-3 mt-1">
                    {!isReply && user && (
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-xs text-gray-400 hover:text-primary flex items-center gap-1"
                      >
                        <Reply size={12} />
                        {replyTo === comment.id ? 'Hủy' : 'Trả lời'}
                      </button>
                    )}
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => { setEditingId(comment.id); setEditText(comment.content) }}
                          className="text-xs text-gray-400 hover:text-primary flex items-center gap-1"
                        >
                          <Edit3 size={12} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {replyTo === comment.id && (
          <div className="ml-4 mb-2 min-w-0 space-y-2 sm:ml-8">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Viết trả lời..."
              className="w-full min-w-0 p-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
              rows={2}
              maxLength={1000}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleCreate(replyText, comment.id)}
                disabled={submitting || !replyText.trim()}
                className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Gửi trả lời
              </button>
              <button
                onClick={() => { setReplyTo(null); setReplyText('') }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-lg"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {comment.replies?.map(reply => renderComment(reply, true))}
      </div>
    )
  }

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={18} className="text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bình luận
        </h3>
        {total > 0 && (
          <span className="text-sm text-gray-400">({total})</span>
        )}
      </div>

      {user ? (
        <div className="flex min-w-0 gap-2 mb-4">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Viết bình luận..."
            className="min-w-0 flex-1 p-3 border rounded-xl text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
            rows={2}
            maxLength={1000}
          />
          <button
            onClick={() => handleCreate(newComment)}
            disabled={submitting || !newComment.trim()}
            className="self-end px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} />
            Gửi
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-4 italic">
          Đăng nhập để bình luận
        </p>
      )}

      {loading && comments.length === 0 ? (
        <div className="text-center py-4">
          <img src='/preload.gif' className='h-12 mx-auto' alt='loading' />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Chưa có bình luận nào
        </p>
      ) : (
        <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setPage(p => { const np = p + 1; fetchComments(np); return np })}
          disabled={loading}
          className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1"
        >
          <ChevronDown size={16} />
          Xem thêm bình luận
        </button>
      )}
    </div>
  )
}
