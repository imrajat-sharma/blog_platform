# Inkwell Blog Platform with Comments

A full-stack editorial blog platform built with React, TypeScript, Express, MongoDB, and JWT authentication. Readers can discover and read stories publicly, while registered writers can publish, edit, and delete their own posts, and join conversations with comments.

---

## 1. Features and Modules

- **Authentication**: User registration and login powered by secure JWT (JSON Web Tokens) with hashed passwords.
- **Posts**: Full CRUD capabilities (create, read, edit, delete). Author-level authorization guarantees that only the post's author can edit or delete their story.
- **Comments**: Authenticated users can comment on any post. Comments display the commenter's name, initials avatar, and time of posting. Authors can delete their own comments.
- **Public Reading**: The post list and individual post reader are accessible publicly without requiring an account.
- **Pagination & Filters**: Server-side pagination loads posts in manageable pages with category pills and dynamic search to keep performance fast.

---

## 2. API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Private (Bearer Token) |
| `GET` | `/api/posts` | List posts (latest first) with pagination, categories & search | Public |
| `GET` | `/api/posts/:id` | Get single post details with populated comments | Public |
| `POST` | `/api/posts` | Create a new blog post | Private (Bearer Token) |
| `PUT` | `/api/posts/:id` | Edit own post | Author Only |
| `DELETE` | `/api/posts/:id` | Delete own post and cascade remove its comments | Author Only |
| `POST` | `/api/posts/:postId/comments` | Add a comment to a post | Private (Bearer Token) |
| `DELETE` | `/api/comments/:id` | Delete own comment | Author Only |

---

## 3. Main React Components (Table 4.11 Architecture)

| Component | File Path | Responsibility |
| :--- | :--- | :--- |
| **Navbar** | [`src/components/Navbar.tsx`](file:///src/components/Navbar.tsx) | Navigation links to home and new post draft; user profile, login, and logout triggers. |
| **PostList**, **PostCard** | [`src/components/PostList.tsx`](file:///src/components/PostList.tsx), [`src/components/PostCard.tsx`](file:///src/components/PostCard.tsx) | Displays paginated list of posts with title, excerpt, category, author avatar, date, and response count. |
| **PostDetail** | [`src/components/PostDetail.tsx`](file:///src/components/PostDetail.tsx) | Full post reader with author metadata, formatted body, edit and delete buttons for the author, and comments. |
| **CommentList** | [`src/components/CommentList.tsx`](file:///src/components/CommentList.tsx) | Displays comments for a post sorted newest first, with author name, time, and author delete button. |
| **CommentForm** | [`src/components/CommentForm.tsx`](file:///src/components/CommentForm.tsx) | Input form for submitting responses; visible to logged-in users with a prompt for visitors to sign in. |
| **PostEditor** | [`src/components/PostEditor.tsx`](file:///src/components/PostEditor.tsx) | Dual-mode editor form for creating new stories or editing existing stories with cover image preview. |
| **AuthContext**, **ProtectedRoute** | [`src/context/AuthContext.tsx`](file:///src/context/AuthContext.tsx), [`src/components/ProtectedRoute.tsx`](file:///src/components/ProtectedRoute.tsx) | Manages authentication state, token storage, and shields private routes/actions. |

---

## 4. Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017` (or configured via `MONGODB_URI`)

### Setup and Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the API Server** (runs on port 5000 and auto-seeds sample posts and demo users on first run):
   ```bash
   npm run server
   ```

3. **Start the Vite Frontend** (with proxy to port 5000):
   ```bash
   npm run dev
   ```

4. **Verify Build & Lint**:
   ```bash
   npm run build
   npm run lint
   ```

### Demo Accounts for Instant Testing

When testing author permissions and comments, you can use the instant sign-in buttons in the login modal or sign in with:

- **Maya Chen**: `maya@example.com` / `password123`
- **Alex Morgan**: `alex@example.com` / `password123`
