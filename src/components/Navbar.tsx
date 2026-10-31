import React, { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { LogIn, LogOut, Menu, PenLine, Sparkles, X } from 'lucide-react'

interface NavbarProps {
  onNavigateHome: () => void
  onNewPost: () => void
  activeView: 'list' | 'detail' | 'editor'
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onNewPost, activeView }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleNewPostClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login')
    } else {
      onNewPost()
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            onNavigateHome()
          }}
        >
          inkwell<span>.</span>
        </a>

        <nav className={mobileMenuOpen ? 'nav-open' : ''}>
          <a
            href="#stories"
            className={activeView === 'list' ? 'current' : ''}
            onClick={(e) => {
              e.preventDefault()
              onNavigateHome()
              setMobileMenuOpen(false)
            }}
          >
            Home
          </a>
          <button
            type="button"
            className="nav-link-btn"
            onClick={handleNewPostClick}
          >
            New Post
          </button>
        </nav>
      </div>

      <div className="header-actions">
        <button className="write-button" onClick={handleNewPostClick}>
          <PenLine size={16} />
          <span>Write</span>
        </button>

        {isAuthenticated && user ? (
          <div className="profile-dropdown-container">
            <button
              className="profile-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              title={`${user.name} (${user.email})`}
            >
              <div className="avatar">{getInitials(user.name)}</div>
              <span className="profile-name">{user.name}</span>
            </button>

            {userDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="avatar me">{getInitials(user.name)}</div>
                  <div className="dropdown-user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setUserDropdownOpen(false)
                    onNewPost()
                  }}
                >
                  <PenLine size={15} /> Write a new story
                </button>
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setUserDropdownOpen(false)
                    logout()
                  }}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-actions">
            <button
              className="sign-in-btn"
              onClick={() => openAuthModal('login')}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              className="get-started-btn"
              onClick={() => openAuthModal('register')}
            >
              <Sparkles size={14} />
              <span>Register</span>
            </button>
          </div>
        )}

        <button
          className="mobile-menu icon-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
