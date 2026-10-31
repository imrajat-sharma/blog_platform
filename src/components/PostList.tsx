import React, { useEffect, useState } from 'react'
import type { Post } from '../types'
import { postsAPI } from '../api/api'
import { PostCard } from './PostCard'
import { Pagination } from './Pagination'
import { ArrowRight, Loader2, PenLine, RefreshCw, Search, Sparkles } from 'lucide-react'

interface PostListProps {
  onSelectPost: (post: Post) => void
  onNewPost: () => void
}

const CATEGORIES = [
  'All stories',
  'Mindful living',
  'Creativity',
  'Personal',
  'Travel',
  'Technology',
]

export const PostList: React.FC<PostListProps> = ({ onSelectPost, onNewPost }) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalPosts, setTotalPosts] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('All stories')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch posts from API asynchronously
  useEffect(() => {
    let isMounted = true
    postsAPI
      .getAll({
        page: currentPage,
        limit: 5,
        category: selectedCategory,
        search: debouncedSearch,
      })
      .then((data) => {
        if (isMounted) {
          setPosts(data.posts)
          setCurrentPage(data.currentPage)
          setTotalPages(data.totalPages)
          setTotalPosts(data.totalPosts)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load posts')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentPage, selectedCategory, debouncedSearch, refreshTrigger])

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const featuredPost = posts.length > 0 ? posts[0] : null

  return (
    <main id="top">
      {/* Intro Hero Section */}
      <section className="intro">
        <div className="eyebrow">
          <Sparkles size={15} /> A publication for people who think
        </div>
        <h1>Stay curious.</h1>
        <p>Discover stories, thinking, and expertise from writers on any topic.</p>
        <div className="intro-actions">
          <button
            className="dark-cta"
            onClick={() => {
              const el = document.getElementById('stories')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Start reading <ArrowRight size={17} />
          </button>
          <button className="text-cta" onClick={onNewPost}>
            Start writing <PenLine size={16} />
          </button>
        </div>
      </section>

      {/* Featured Post / Editor's Pick (Only shown on Page 1 without search filter) */}
      {featuredPost && currentPage === 1 && !debouncedSearch && selectedCategory === 'All stories' && (
        <section className="featured-wrap" id="stories">
          <div className="section-kicker">
            <span>Editor's Pick</span>
            <div />
          </div>
          <article
            className="featured-card"
            onClick={() => onSelectPost(featuredPost)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && onSelectPost(featuredPost)}
          >
            <div className="featured-copy">
              <div className="tag">{featuredPost.category || 'Mindful living'}</div>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.excerpt || (featuredPost.content.slice(0, 160) + '...')}</p>
              <div className="author">
                <div className="avatar">
                  {featuredPost.author?.name
                    ? featuredPost.author.name.slice(0, 2).toUpperCase()
                    : 'AU'}
                </div>
                <div>
                  <b>{featuredPost.author?.name || 'Anonymous'}</b>
                  <span>
                    {new Date(featuredPost.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <button className="read-link">
                Read story <ArrowRight size={16} />
              </button>
            </div>
            <div
              className="featured-image"
              style={{ backgroundImage: `url(${featuredPost.image})` }}
            />
          </article>
        </section>
      )}

      {/* Stories Listing Section */}
      <section className="stories-section" id={currentPage > 1 || debouncedSearch ? 'stories' : undefined}>
        <div className="stories-title-row">
          <div>
            <h2>Fresh perspectives</h2>
            <p>New ideas from our community.</p>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              aria-label="Search stories"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={selectedCategory === cat ? 'category active' : 'category'}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p>Loading latest stories...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="retry-btn" onClick={() => { setLoading(true); setRefreshTrigger((c) => c + 1) }}>
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty">
            <p>No stories found matching your criteria.</p>
            {searchQuery || selectedCategory !== 'All stories' ? (
              <button
                className="dark-cta"
                style={{ margin: '15px auto 0' }}
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All stories')
                }}
              >
                Reset filters
              </button>
            ) : (
              <button
                className="dark-cta"
                style={{ margin: '15px auto 0' }}
                onClick={onNewPost}
              >
                <PenLine size={16} /> Write the first story
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="post-grid">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onSelect={onSelectPost} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalPosts={totalPosts}
              onPageChange={(page) => {
                setLoading(true)
                setCurrentPage(page)
                const el = document.getElementById('stories')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            />
          </>
        )}
      </section>

      {/* Join Banner */}
      <section className="join-banner" id="about">
        <div>
          <div className="eyebrow light">
            <Sparkles size={15} /> Make your mark
          </div>
          <h2>Write what matters.</h2>
        </div>
        <div>
          <p>
            Inkwell is where new voices and big ideas find an audience. Join readers and writers who
            want to understand the world better.
          </p>
          <button onClick={onNewPost}>
            Start writing <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top">
          inkwell<span>.</span>
        </a>
        <p>Ideas and stories from independent thinkers.</p>
        <div>
          <a href="#about">About</a>
          <a href="#stories">Reading list</a>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </main>
  )
}
