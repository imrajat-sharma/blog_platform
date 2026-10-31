import { useEffect, useState } from 'react'
import type { Post } from './types'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { Navbar } from './components/Navbar'
import { PostList } from './components/PostList'
import { PostDetail } from './components/PostDetail'
import { PostEditor } from './components/PostEditor'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthModal } from './components/AuthModal'
import './App.css'

type ViewMode = 'list' | 'detail' | 'editor'

function BlogApp() {
  const { openAuthModal, isAuthenticated } = useAuth()
  const [view, setView] = useState<ViewMode>('list')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [postToEdit, setPostToEdit] = useState<Post | null>(null)

  // Listen for hash changes to support browser back button / direct anchors
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#post/')) {
        const id = hash.replace('#post/', '')
        if (id) {
          setSelectedPostId(id)
          setView('detail')
        }
      } else if (hash === '#write') {
        setPostToEdit(null)
        setView('editor')
      } else if (hash === '#stories' || hash === '' || hash === '#top') {
        if (view !== 'list') {
          setView('list')
          setSelectedPostId(null)
          setPostToEdit(null)
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [view])

  const navigateToHome = () => {
    window.location.hash = ''
    setSelectedPostId(null)
    setPostToEdit(null)
    setView('list')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToPost = (post: Post) => {
    setSelectedPostId(post._id)
    setPostToEdit(null)
    setView('detail')
    window.location.hash = `#post/${post._id}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToNewPost = () => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }
    setPostToEdit(null)
    setView('editor')
    window.location.hash = '#write'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToEditPost = (post: Post) => {
    setPostToEdit(post)
    setView('editor')
    window.location.hash = `#edit/${post._id}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveComplete = (savedPost: Post) => {
    setSelectedPostId(savedPost._id)
    setPostToEdit(null)
    setView('detail')
    window.location.hash = `#post/${savedPost._id}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteSuccess = () => {
    navigateToHome()
  }

  return (
    <div className="app-shell">
      {/* Navbar: Links to home and new post; login and logout */}
      <Navbar
        onNavigateHome={navigateToHome}
        onNewPost={navigateToNewPost}
        activeView={view}
      />

      {/* Main Content Areas */}
      {view === 'list' && (
        <PostList
          onSelectPost={navigateToPost}
          onNewPost={navigateToNewPost}
        />
      )}

      {view === 'detail' && selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          onBack={navigateToHome}
          onEditPost={navigateToEditPost}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      {view === 'editor' && (
        <ProtectedRoute fallbackMessage="You must be signed in to compose or edit stories.">
          <PostEditor
            postToEdit={postToEdit}
            onSaveComplete={handleSaveComplete}
            onCancel={() => {
              if (selectedPostId) {
                setView('detail')
                window.location.hash = `#post/${selectedPostId}`
              } else {
                navigateToHome()
              }
            }}
          />
        </ProtectedRoute>
      )}

      {/* Authentication Modal (JWT Register and Login) */}
      <AuthModal />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BlogApp />
    </AuthProvider>
  )
}
