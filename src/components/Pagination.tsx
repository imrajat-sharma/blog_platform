import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalPosts: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalPosts,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }

    return pages
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalPosts} total stories)
      </div>

      <div className="pagination-controls">
        <button
          className="page-btn nav-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="page-numbers">
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={page}
                className={currentPage === page ? 'page-number active' : 'page-number'}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="page-ellipsis">
                ...
              </span>
            )
          )}
        </div>

        <button
          className="page-btn nav-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

