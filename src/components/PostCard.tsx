import React from 'react'
import type { Post } from '../types'
import { Calendar, MessageSquare, Tag } from 'lucide-react'

interface PostCardProps {
  post: Post
  onSelect: (post: Post) => void
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect }) => {
  const getInitials = (name?: string) => {
    if (!name) return 'AU'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recently'
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const authorName = post.author?.name || 'Anonymous'

  return (
    <article className="post-card" onClick={() => onSelect(post)}>
      <div className="card-image" style={{ backgroundImage: `url(${post.image})` }}>
        <div className="tag floating">
          <Tag size={11} style={{ marginRight: 4, display: 'inline' }} />
          {post.category || 'General'}
        </div>
      </div>

      <div className="post-content">
        <div className="post-meta-top">
          <span className="post-category-badge">{post.category || 'General'}</span>
          <span className="post-date">
            <Calendar size={12} style={{ marginRight: 4, display: 'inline' }} />
            {formatDate(post.createdAt)}
          </span>
        </div>

        <h3>{post.title}</h3>
        <p>{post.excerpt || (post.content ? post.content.slice(0, 140) + '...' : '')}</p>

        <div className="card-bottom">
          <div className="author">
            <div className="avatar">{getInitials(authorName)}</div>
            <div>
              <b>{authorName}</b>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          <div className="card-interactions">
            <div className="comments-indicator" title={`${post.commentsCount || 0} responses`}>
              <MessageSquare size={15} />
              <span>{post.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

