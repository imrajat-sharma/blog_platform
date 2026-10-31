import React, { useState } from 'react'
import type { Post } from '../types'
import { postsAPI } from '../api/api'
import { useAuth } from '../context/useAuth'
import { AlertCircle, ArrowLeft, Image as ImageIcon, Send, Sparkles } from 'lucide-react'

interface PostEditorProps {
  postToEdit?: Post | null
  onSaveComplete: (savedPost: Post) => void
  onCancel: () => void
}

const CATEGORIES = ['Mindful living', 'Creativity', 'Personal', 'Travel', 'Technology']

const PRESET_IMAGES = [
  {
    label: 'Warm Desk / Notebook',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Nature / Path',
    url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1400&q=85',
  },
  {
    label: 'Quiet Morning',
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=85',
  },
  {
    label: 'Travel / Mountain',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
  },
  {
    label: 'Creative Work',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85',
  },
]

export const PostEditor: React.FC<PostEditorProps> = ({
  postToEdit,
  onSaveComplete,
  onCancel,
}) => {
  const { user } = useAuth()
  const isEditing = !!postToEdit

  const [title, setTitle] = useState(postToEdit?.title || '')
  const [category, setCategory] = useState(postToEdit?.category || CATEGORIES[0])
  const [excerpt, setExcerpt] = useState(postToEdit?.excerpt || '')
  const [content, setContent] = useState(postToEdit?.content || '')
  const [image, setImage] = useState(
    postToEdit?.image || PRESET_IMAGES[0].url
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Story title is required')
      return
    }
    if (!content.trim()) {
      setError('Story content is required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isEditing && postToEdit) {
        const updated = await postsAPI.update(postToEdit._id, {
          title: title.trim(),
          excerpt: excerpt.trim() || content.trim().slice(0, 150) + '...',
          content: content.trim(),
          category,
          image: image.trim() || PRESET_IMAGES[0].url,
        })
        onSaveComplete(updated)
      } else {
        const created = await postsAPI.create({
          title: title.trim(),
          excerpt: excerpt.trim() || content.trim().slice(0, 150) + '...',
          content: content.trim(),
          category,
          image: image.trim() || PRESET_IMAGES[0].url,
        })
        onSaveComplete(created)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to save post')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="editor-page">
      <div className="editor-container">
        <div className="editor-top-bar">
          <button type="button" className="back" onClick={onCancel}>
            <ArrowLeft size={17} /> Cancel & Back
          </button>
          <div className="editor-badge">
            <Sparkles size={14} />
            <span>{isEditing ? 'Editing Story' : 'New Story Draft'}</span>
          </div>
        </div>

        <div className="editor-header">
          <h1>{isEditing ? 'Edit your story' : 'Write a new story'}</h1>
          <p>
            {isEditing
              ? `Refining "${postToEdit?.title}" — signed in as ${user?.name}`
              : 'Give your ideas and perspective a place to land.'}
          </p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <label htmlFor="post-title">Story Title</label>
            <input
              id="post-title"
              type="text"
              className="title-input"
              placeholder="Title of your story..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="post-image-select">Cover Image Preset</label>
              <select
                id="post-image-select"
                onChange={(e) => setImage(e.target.value)}
                value={PRESET_IMAGES.some((p) => p.url === image) ? image : 'custom'}
              >
                {PRESET_IMAGES.map((preset) => (
                  <option key={preset.url} value={preset.url}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom">Custom Image URL...</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="post-image-url">Cover Image URL</label>
            <div className="input-wrapper">
              <ImageIcon size={16} className="input-icon" />
              <input
                id="post-image-url"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>

          {image && (
            <div className="image-preview-container">
              <span className="preview-label">Image Preview:</span>
              <div
                className="cover-preview"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="post-excerpt">
              Short Summary / Excerpt <span className="label-sub">(optional)</span>
            </label>
            <textarea
              id="post-excerpt"
              rows={2}
              placeholder="A brief 1-2 sentence teaser for post cards and search..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-content">Story Body</label>
            <textarea
              id="post-content"
              rows={12}
              className="content-textarea"
              placeholder="Tell your story. Write your paragraphs with details, insights, and ideas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="publish"
              disabled={submitting}
            >
              {submitting ? (
                'Saving story...'
              ) : (
                <>
                  <Send size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Publish Story'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
