import React, { useEffect, useState } from 'react'
import type { Comment, Post } from '../types'
import { commentsAPI, postsAPI } from '../api/api'
import { useAuth } from '../context/useAuth'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Loader2,
  Share2,
  Tag,
  Trash2,
} from 'lucide-react'

interface PostDetailProps {
  postId: string
  onBack: () => void
  onEditPost: (post: Post) => void
  onDeleteSuccess: () => void
}

export const PostDetail: React.FC<PostDetailProps> = ({
  postId,
  onBack,
  onEditPost,
  onDeleteSuccess,
}) => {
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    postsAPI
      .getById(postId)
      .then((data) => {
        if (isMounted) {
          setPost(data.post)
          setComments(data.comments || [])
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load story')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [postId])

  const handleDeletePost = async () => {
    if (!post) return
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await postsAPI.delete(post._id)
      onDeleteSuccess()
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('Failed to delete post')
      }
      setDeleting(false)
    }
  }

  const handleAddComment = async (body: string) => {
    if (!post) return
    const newComment = await commentsAPI.create(post._id, body)
    // Newest first
    setComments((prev) => [newComment, ...prev])
  }

  const handleDeleteComment = async (commentId: string) => {
    await commentsAPI.delete(commentId)
    setComments((prev) => prev.filter((c) => c._id !== commentId))
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recently'
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getInitials = (name?: string) => {
    if (!name) return 'AU'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="article-loading">
        <Loader2 className="spinner" size={36} />
        <p>Loading story...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="article-error">
        <h2>Unable to load story</h2>
        <p>{error || 'Story not found.'}</p>
        <button className="dark-cta" onClick={onBack}>
          <ArrowLeft size={16} /> Back to stories
        </button>
      </div>
    )
  }

  // Check if current user is author of post
  const isPostAuthor =
    user &&
    post.author &&
    (user.id === post.author._id || user.id === (post.author as unknown as string))

  return (
    <div className="article-page">
      <header className="topbar article-topbar">
        <button className="back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to stories
        </button>

        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            onBack()
          }}
        >
          inkwell<span>.</span>
        </a>

        <div className="article-head-actions">
          {isPostAuthor && (
            <div className="author-controls-bar">
              <button
                className="edit-post-btn"
                onClick={() => onEditPost(post)}
                title="Edit this post"
              >
                <Edit3 size={15} />
                <span>Edit Post</span>
              </button>
              <button
                className="delete-post-btn"
                onClick={handleDeletePost}
                disabled={deleting}
                title="Delete this post"
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <article className="full-story">
          <div className="story-category-header">
            <span className="tag">
              <Tag size={12} style={{ marginRight: 4, display: 'inline' }} />
              {post.category || 'General'}
            </span>
          </div>

          <h1>{post.title}</h1>

          {post.excerpt && <p className="article-deck">{post.excerpt}</p>}

          <div className="article-author">
            <div className="author">
              <div className="avatar">{getInitials(post.author?.name)}</div>
              <div>
                <b>{post.author?.name || 'Anonymous Author'}</b>
                <span>
                  <Calendar size={12} style={{ marginRight: 4, display: 'inline' }} />
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </div>

            <div className="story-actions">
              {isPostAuthor ? (
                <div className="author-badge">Author of this story</div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href }).catch(() => {})
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Link copied to clipboard!')
                    }
                  }}
                  title="Share story"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>

          {post.image && (
            <div
              className="article-image"
              style={{ backgroundImage: `url(${post.image})` }}
            />
          )}

          <div className="article-copy">
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Author Controls Box at Bottom as well */}
          {isPostAuthor && (
            <div className="author-bottom-actions">
              <div className="author-callout">
                <div>
                  <strong>You are the author of this post.</strong>
                  <p>You have permission to edit content or permanently remove this story.</p>
                </div>
                <div className="author-buttons">
                  <button className="edit-cta" onClick={() => onEditPost(post)}>
                    <Edit3 size={15} /> Edit Story
                  </button>
                  <button
                    className="delete-cta"
                    onClick={handleDeletePost}
                    disabled={deleting}
                  >
                    <Trash2 size={15} /> Delete Story
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <section className="comments article-comments">
            <div className="comments-heading-row">
              <h3>
                Responses <span>({comments.length})</span>
              </h3>
            </div>

            {/* Form for adding a comment - visible only to logged-in users / prompt */}
            <CommentForm
              postId={post._id}
              onCommentAdded={handleAddComment}
            />

            {/* Shows the comments of a post, newest first */}
            <CommentList
              comments={comments}
              onDeleteComment={handleDeleteComment}
            />
          </section>
        </article>
      </main>
    </div>
  )
}
