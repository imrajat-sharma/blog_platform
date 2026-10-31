import React, { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { AlertCircle, LogIn, Send } from 'lucide-react'

interface CommentFormProps {
  postId: string
  onCommentAdded: (newCommentText: string) => Promise<void>
}

export const CommentForm: React.FC<CommentFormProps> = ({ postId: _postId, onCommentAdded }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await onCommentAdded(commentText.trim())
      setCommentText('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to post comment')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'ME'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isAuthenticated) {
    return (
      <div className="comment-login-prompt">
        <p>Sign in to join the conversation and leave a comment.</p>
        <button
          type="button"
          className="dark-cta signin-prompt-btn"
          onClick={() => openAuthModal('login')}
        >
          <LogIn size={15} /> Sign In to Respond
        </button>
      </div>
    )
  }

  return (
    <form className="comment-form-box" onSubmit={handleSubmit}>
      {error && (
        <div className="comment-error">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <div className="comment-compose">
        <div className="avatar me" title={user?.name}>
          {getInitials(user?.name)}
        </div>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`What are your thoughts, ${user?.name?.split(' ')[0] || ''}?`}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !commentText.trim()}
          title="Submit response"
          aria-label="Submit comment"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  )
}
