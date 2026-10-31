import React from 'react'
import type { Comment } from '../types'
import { useAuth } from '../context/useAuth'
import { Clock, Trash2 } from 'lucide-react'

interface CommentListProps {
  comments: Comment[]
  onDeleteComment: (commentId: string) => Promise<void>
}

export const CommentList: React.FC<CommentListProps> = ({ comments, onDeleteComment }) => {
  const { user } = useAuth()

  const formatCommentDate = (isoString?: string) => {
    if (!isoString) return 'Recently'
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Recently'
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <p>No responses yet. Be the first to share your thoughts!</p>
      </div>
    )
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => {
        const isAuthor =
          user &&
          comment.author &&
          (user.id === comment.author._id || user.id === (comment.author as unknown as string))

        return (
          <div className="comment" key={comment._id}>
            <div className="avatar me">{getInitials(comment.author?.name)}</div>
            <div className="comment-main">
              <div className="comment-header">
                <div className="comment-author-info">
                  <b>{comment.author?.name || 'Anonymous Reader'}</b>
                  <span className="comment-time">
                    <Clock size={11} style={{ marginRight: 3, display: 'inline' }} />
                    {formatCommentDate(comment.createdAt)}
                  </span>
                </div>

                {isAuthor && (
                  <button
                    className="delete-comment-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this response?')) {
                        onDeleteComment(comment._id)
                      }
                    }}
                    title="Delete your comment"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <p className="comment-body">{comment.body}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
