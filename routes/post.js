import { Router } from "express"
import Post from "../models/Post.js"
import path, { dirname } from "path"
import multer from "multer"
import { fileURLToPath } from "url"
import { v4 } from "uuid"
import { getToken } from "../jwt/token.js"
import isHave from "../middleware/isHave.js"
import { unlink } from "fs"
import { url } from "../staticUrl.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = Router()
const disk = multer.diskStorage({
    destination: (_, _, cb) => {
        cb(null, path.join(__dirname, '/uploads/post'))
    },
    limits: {
        files: 1,
        fileSize: 1024 * 1024
    },
    filename: (req, file, cb) => {
        cb(null, `post-${v4()}${path.extname(file.originalname)}`)
    },
})

const upload = multer({
    storage: disk,
})

router.post('/post', upload.single('image'), async (req, res) => {
    const { filename } = req.file
    const { userId } = getToken(req.headers.authorization.replace('Token ', '')).payload
    const newObject = {
        ...req.body,
        src: `${url}/post/${filename}`,
        user: userId
    }
    await Post.create(newObject)
    res.status(200).json({ message: 'Success make your post' })
})
router.get('/posts', async (req, res) => {
    const posts = await Post.find().populate('user', '_id username src')
    res.status(200).json({ posts })
})

router.get('/post/:id', async (req, res) => {
    const id = req.params.id
    const post = await Post.findById(id)
        .populate('user', '_id username src')
    res.status(200).json(post)
})

router.get('/posts/:id', async (req, res) => {
    const user = req.params.id
    const posts = await Post.find({ user })
        .populate('user', '_id username src')
    res.status(200).json(posts)
})

router.put('/post/like/:id', isHave, async (req, res) => {
    const updated = await Post.findByIdAndUpdate(req.params.id, {
        $push: { likes: req.user._id }
    }, {
        new: true
    })
    res.status(201).json(updated)
})

router.put('/post/unlike/:id', isHave, async (req, res) => {
    const updated = await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    })
    res.status(201).json(updated)
})

router.delete('/post/:id', async (req, res) => {
    const id = req.params.id
    const FoundPost = await Post.findById(id)
    const filepath = path.join(__dirname, 'uploads', 'post', FoundPost.src.replace(`${url}/post/`, ''))
    unlink(filepath)

    await Post.findByIdAndRemove(id, { new: true })
    res.status(202).json({ message: 'Success delete' })
})

router.put('/post', upload.single('image'), async (req, res) => {
    const { filename } = req.file
    const FoundPost = await Post.findById(req.body.id)
    const newSRC = FoundPost.src.replace(`${url}/post/`, '')
    const filepath = path.join(__dirname, 'uploads', 'post', newSRC)
    unlink(filepath, (err) => {
        if (err) {
            res.status(422).json({ error: err })
        }
        res.status(200).json({ message: 'Success update' })
    })
    const updatePost = {
        title: req.body.title,
        body: req.body.body,
        type: req.body.type,
        src: `${url}${filename}`
    }
    await Post.findByIdAndUpdate(req.body.id, updatePost, { new: true })
})
export default router