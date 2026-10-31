import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = process.env.PORT || 5000
const secret = process.env.JWT_SECRET || 'commonplace-super-secret-jwt-token-key-2026'

app.use(cors())
app.use(express.json())

// Mongoose Schemas & Models
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '', trim: true },
    content: { type: String, required: true },
    category: { type: String, default: 'General' },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
const Post = mongoose.model('Post', postSchema)
const Comment = mongoose.model('Comment', commentSchema)

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token missing or invalid' })
    }
    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token' })
  }
}

const tokenFor = (user) => jwt.sign({ id: user._id, name: user.name, email: user.email }, secret, { expiresIn: '7d' })

// Seed initial data if database is empty
async function seedInitialData() {
  try {
    const count = await Post.countDocuments()
    if (count > 0) return

    console.log('Seeding initial blog posts, users, and comments...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    const maya = await User.create({
      name: 'Maya Chen',
      email: 'maya@example.com',
      password: hashedPassword,
    })

    const alex = await User.create({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: hashedPassword,
    })

    const samplePosts = [
      {
        title: 'The slow art of building a meaningful life',
        excerpt: 'A few thoughts on making room for what actually matters — and letting the rest wait.',
        content: `A few thoughts on making room for what actually matters — and letting the rest wait.\n\nThe things that shape our days are often the ones we barely notice: a walk without a destination, a thought left unfinished, the small courage of choosing a different rhythm.\n\nThere is no single way to make a life feel meaningful. But there is value in paying close attention to the moments that feel true, and allowing them to lead us somewhere unexpected.\n\nGive the good things more room. This is an invitation to slow down and notice. To keep a little space open for curiosity, for conversation, and for the ideas that ask us to see the world differently.`,
        category: 'Mindful living',
        image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1400&q=85',
        author: maya._id,
      },
      {
        title: 'Notes from a very quiet morning',
        excerpt: 'There is a particular kind of clarity that only arrives before the world begins asking things of you.',
        content: `There is a particular kind of clarity that only arrives before the world begins asking things of you.\n\nBefore dawn, the silence has weight. The kettle whistles softly, steam rises into the blue-tinted air, and for twenty minutes you exist outside the demands of productivity.\n\nCultivating this stillness isn't a luxury; it is the anchor from which good thoughts, patient decisions, and gentle work originate.`,
        category: 'Personal',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=85',
        author: alex._id,
      },
      {
        title: 'What I learned from starting over',
        excerpt: 'It turns out that beginnings are less about confidence and more about staying curious.',
        content: `When you tear down old habits and embark into the unfamiliar, the hardest part is not the work — it is tolerating being bad at things again.\n\nBeginners have an advantage that seasoned veterans forget: innocence and an appetite for discovery without the burden of ego. Embrace the mess of the early drafts.`,
        category: 'Creativity',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85',
        author: maya._id,
      },
      {
        title: 'A field guide to tiny adventures',
        excerpt: 'The antidote to routine might be closer than you think.',
        content: `You don't need a passport or weeks off work to rediscover wonder. Take a train to an unfamiliar suburb, walk through a library you've never visited, or cook an elaborate meal on a Tuesday.\n\nNovelty is a posture of mind, not a destination on a map.`,
        category: 'Travel',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
        author: alex._id,
      },
      {
        title: 'Architecture of thoughtful software',
        excerpt: 'How building clean, maintainable systems is both engineering discipline and poetic craft.',
        content: `Great software feels inevitable. When code is well-structured with clear abstractions, reading it feels like a pleasant walk along a well-lit path.\n\nResist unnecessary complexity. Keep models focused, APIs predictable, and user interfaces empathetic.`,
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=85',
        author: maya._id,
      },
      {
        title: 'The discipline of creative solitude',
        excerpt: 'Why uninterrupted focus remains the ultimate superpower for modern thinkers.',
        content: `Noise is everywhere. Notifications constantly seek our attention, fragmenting our deepest thinking. Carving out two hours of pure, deep work each morning will transform what you create.`,
        category: 'Creativity',
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        author: alex._id,
      },
      {
        title: 'Finding rhythm in unpredictable seasons',
        excerpt: 'Designing personal workflows that adapt gracefully to changes in energy and environment.',
        content: `Life does not move in a straight line. Rigid schedules often break under pressure, but flexible routines can bend and absorb disruptions while still propelling you forward.`,
        category: 'Mindful living',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
        author: maya._id,
      },
    ]

    const createdPosts = await Post.insertMany(samplePosts)

    // Seed sample comments
    await Comment.insertMany([
      {
        body: 'This stopped me in my tracks. Thank you for putting this into words.',
        post: createdPosts[0]._id,
        author: alex._id,
      },
      {
        body: 'A beautiful reminder to make space for the things that matter.',
        post: createdPosts[0]._id,
        author: maya._id,
      },
      {
        body: 'Quiet mornings are the best hours of the day. Couldn’t agree more!',
        post: createdPosts[1]._id,
        author: maya._id,
      },
    ])

    console.log('Sample data seeded successfully. Demo accounts: maya@example.com / alex@example.com (password: password123)')
  } catch (err) {
    console.error('Error seeding data:', err.message)
  }
}

// ---------------- API ROUTES ----------------

// 1. Authentication: Register (Public)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    })

    return res.status(201).json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message })
  }
})

// 2. Authentication: Login (Public)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    return res.json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

// 3. Current User verification: /api/auth/me (Private)
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

// 4. List posts (latest first) with Pagination & Filters (Public)
app.get('/api/posts', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, parseInt(req.query.limit) || 6)
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.category && req.query.category !== 'All stories' && req.query.category !== 'All') {
      filter.category = req.query.category
    }

    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i')
      filter.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { content: searchRegex }]
    }

    const totalPosts = await Post.countDocuments(filter)
    const totalPages = Math.ceil(totalPosts / limit) || 1

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Add comment count for each post
    const postIds = posts.map((p) => p._id)
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ])
    const countMap = {}
    commentCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count
    })

    const postsWithCounts = posts.map((p) => ({
      ...p,
      commentsCount: countMap[p._id.toString()] || 0,
    }))

    return res.json({
      posts: postsWithCounts,
      currentPage: page,
      totalPages,
      totalPosts,
      limit,
      hasMore: page < totalPages,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch posts', error: error.message })
  }
})

// 5. Get one post with its comments (Public)
app.get('/api/posts/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID format' })
    }

    const post = await Post.findById(req.params.id).populate('author', 'name email').lean()
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Comments sorted newest first
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return res.json({
      post: {
        ...post,
        commentsCount: comments.length,
      },
      comments,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch post', error: error.message })
  }
})

// 6. Create a post (Private)
app.post('/api/posts', auth, async (req, res) => {
  try {
    const { title, excerpt, content, category, image } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' })
    }

    const generatedExcerpt =
      excerpt && excerpt.trim()
        ? excerpt.trim()
        : content.trim().slice(0, 150) + (content.length > 150 ? '...' : '')

    const post = await Post.create({
      title: title.trim(),
      excerpt: generatedExcerpt,
      content: content.trim(),
      category: category || 'General',
      image:
        image && image.trim()
          ? image.trim()
          : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      author: req.user.id,
    })

    const populatedPost = await Post.findById(post._id).populate('author', 'name email')
    return res.status(201).json(populatedPost)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create post', error: error.message })
  }
})

// 7. Edit own post (Author only) - Supports PUT and PATCH
const updatePostHandler = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID format' })
    }

    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Verify authorship
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own posts' })
    }

    const { title, excerpt, content, category, image } = req.body
    if (title !== undefined) post.title = title.trim()
    if (excerpt !== undefined) post.excerpt = excerpt.trim()
    if (content !== undefined) post.content = content.trim()
    if (category !== undefined) post.category = category
    if (image !== undefined) post.image = image

    await post.save()
    const populated = await Post.findById(post._id).populate('author', 'name email')
    return res.json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post', error: error.message })
  }
}

app.put('/api/posts/:id', auth, updatePostHandler)
app.patch('/api/posts/:id', auth, updatePostHandler)

// 8. Delete own post (Author only)
app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID format' })
    }

    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Verify authorship
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own posts' })
    }

    await Post.findByIdAndDelete(req.params.id)
    // Cascade delete associated comments
    await Comment.deleteMany({ post: req.params.id })

    return res.json({ message: 'Post and associated comments deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete post', error: error.message })
  }
})

// 9. Add a comment to a post (Private)
const addCommentHandler = async (req, res) => {
  try {
    const postId = req.params.postId || req.params.id
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' })
    }

    const { body } = req.body
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Comment body is required' })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = await Comment.create({
      body: body.trim(),
      post: postId,
      author: req.user.id,
    })

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email')
    return res.status(201).json(populatedComment)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add comment', error: error.message })
  }
}

app.post('/api/posts/:postId/comments', auth, addCommentHandler)
app.post('/api/posts/:id/comments', auth, addCommentHandler)

// 10. Delete own comment (Author only)
app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment ID format' })
    }

    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Verify authorship
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own comments' })
    }

    await Comment.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete comment', error: error.message })
  }
})

// Database connection & Server initialization
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commonplace'
mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log(`Connected to MongoDB at ${mongoUri}`)
    await seedInitialData()
    app.listen(PORT, () => console.log(`Blog API server running on port ${PORT}`))
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
