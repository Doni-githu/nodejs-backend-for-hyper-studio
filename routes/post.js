import { Router } from "express"
import Post from "../models/Post.js"
import path, { dirname } from "path"
import multer from "multer"
import { fileURLToPath } from "url"
import { v4 } from "uuid"
import { getToken } from "../jwt/token.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = Router()
const disk = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/uploads/post'))
    },
    limits: {
        files: 1,
        fileSize: 1024 * 1024
    },
    filename: (req, file, cb) => {
        cb(null, `post-${v4()}${path.extname(file.originalname)}`)
    },
    onFileUploadStart: function (file) {
        const ext = path.extname(file.originalname)
        console.log("Inside uploads");
        if (ext !== '.png' || ext !== '.jpeg' || ext !== '.jfif' || ext !== '.jpg' || ext !== '.mp4' || ext !== 'mkv') {
            return false
        } else {
            return true
        }
    }
})

const upload = multer({
    storage: disk,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpeg' && ext !== '.jfif' && ext !== '.jpg' && ext !== '.mp4' && ext !== 'mkv') {
            cb(new Error('Select right file'), false)
        } else {
            cb(null, true)
        }
    }
})

router.post('/post', upload.single('avatar'), async (req, res) => {
    const { filename } = req.file
    const { userId } = getToken(req.headers.authorization.replace('Token ', '')).payload
    const newObject = {
        ...req.body,
        src: `http://localhost:3000/routes/uploads/post/${filename}`,
        user: userId
    }
    const post = await Post.create(newObject)
    res.status(200).json({ post })
})

router.get('/posts/my', async (req, res) => {
    const { userId } = getToken(req.headers.authorization.replace('Token ', '')).payload
    const posts = await Post.find({ user: userId }).populate('user', '_id username src channel')
    res.status(200).json({ posts })
})

router.get('/post')

export default router