import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const secret = process.env.JWT_SECRET || 'change-this-local-development-secret'
app.use(cors())
app.use(express.json())

const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String }, { timestamps: true })
const postSchema = new mongoose.Schema({ title: String, excerpt: String, content: String, category: String, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true })
const commentSchema = new mongoose.Schema({
  body: String,
  post: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },{ timestamps: true })
const User = mongoose.model('User', userSchema), Post = mongoose.model('Post', postSchema), Comment = mongoose.model('Comment', commentSchema)

const auth = async (req, res, next) => { try { req.user = jwt.verify(req.headers.authorization?.replace('Bearer ', ''), secret); next() } catch { res.status(401).json({ message: 'Authentication required' }) } }
const tokenFor = user => jwt.sign({ id: user._id, name: user.name }, secret, { expiresIn: '7d' })

app.post('/api/auth/register', async (req, res) => { const { name, email, password } = req.body; if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' }); try { const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) }); res.status(201).json({ token: tokenFor(user), user: { id: user._id, name, email } }) } catch { res.status(409).json({ message: 'An account with that email already exists' }) } })
app.post('/api/auth/login', async (req, res) => { const user = await User.findOne({ email: req.body.email }); if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Invalid email or password' }); res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } }) })
app.get('/api/posts', async (_req, res) => res.json(await Post.find().populate('author', 'name').sort('-createdAt')))
app.post('/api/posts', auth, async (req, res) => res.status(201).json(await Post.create({ ...req.body, author: req.user.id })))
app.patch('/api/posts/:id', auth, async (req, res) => { const post = await Post.findOneAndUpdate({ _id: req.params.id, author: req.user.id }, req.body, { new: true }); if (!post) return res.status(404).json({ message: 'Post not found' }); res.json(post) })
app.delete('/api/posts/:id', auth, async (req, res) => { const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id }); if (!post) return res.status(404).json({ message: 'Post not found' }); await Comment.deleteMany({ post: req.params.id }); res.status(204).end() })
app.get('/api/posts/:id/comments', async (req, res) => res.json(await Comment.find({ post: req.params.id }).populate('author', 'name').sort('-createdAt')))
app.post('/api/posts/:id/comments', auth, async (req, res) => res.status(201).json(await Comment.create({ body: req.body.body, post: req.params.id, author: req.user.id })))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commonplace').then(() => app.listen(process.env.PORT || 5000, () => console.log('API running on http://localhost:5000'))).catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1) })
