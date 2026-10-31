import type { AuthResponse, Comment, PaginatedPostsResponse, Post, User } from '../types'

const API_BASE = '/api'

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        'Content-Type': 'application/json',
      }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errorMsg = data?.message || `Request failed with status ${res.status}`
    throw new Error(errorMsg)
  }
  return data as T
}

export const authAPI = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    return handleResponse<AuthResponse>(res)
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<AuthResponse>(res)
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    })
    return handleResponse<{ user: User }>(res)
  },
}

export const postsAPI = {
  async getAll(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<PaginatedPostsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category && params.category !== 'All stories' && params.category !== 'All') {
      searchParams.set('category', params.category)
    }
    if (params?.search && params.search.trim()) {
      searchParams.set('search', params.search.trim())
    }

    const query = searchParams.toString()
    const url = `${API_BASE}/posts${query ? `?${query}` : ''}`
    const res = await fetch(url)
    return handleResponse<PaginatedPostsResponse>(res)
  },

  async getById(id: string): Promise<{ post: Post; comments: Comment[] }> {
    const res = await fetch(`${API_BASE}/posts/${id}`)
    return handleResponse<{ post: Post; comments: Comment[] }>(res)
  },

  async create(data: {
    title: string
    excerpt?: string
    content: string
    category: string
    image?: string
  }): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Post>(res)
  },

  async update(
    id: string,
    data: {
      title?: string
      excerpt?: string
      content?: string
      category?: string
      image?: string
    }
  ): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Post>(res)
  },

  async delete(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return handleResponse<{ message: string }>(res)
  },
}

export const commentsAPI = {
  async create(postId: string, body: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ body }),
    })
    return handleResponse<Comment>(res)
  },

  async delete(commentId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return handleResponse<{ message: string }>(res)
  },
}

