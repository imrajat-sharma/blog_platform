export interface User {
  id: string
  name: string
  email: string
}

export interface Author {
  _id: string
  name: string
  email?: string
}

export interface Post {
  _id: string
  title: string
  excerpt: string
  content: string
  category: string
  image: string
  author: Author
  commentsCount?: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  body: string
  post: string
  author: Author
  createdAt: string
  updatedAt: string
}

export interface PaginatedPostsResponse {
  posts: Post[]
  currentPage: number
  totalPages: number
  totalPosts: number
  limit: number
  hasMore: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

