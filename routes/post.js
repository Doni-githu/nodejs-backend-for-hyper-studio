const Post = require('../models/Post.js')
const isHave = require('../middleware/isHave.js')
const { unlink } = require('fs');
const Router = require('express').Router
const { getToken } = require('../jwt/token.js')
const bcrypt = require('bcrypt')
const path = require('path')
const multer = require('multer')
const v4 = require('uuid').v4
const url = require('../staticUrl.js')

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
})

const upload = multer({
    storage: disk,
})

router.post('/post', upload.single('image'), async (req, res) => {
    const { filename } = req.file
    const { userId } = getToken(req.headers.authorization.replace('Token ', '')).payload
    const newObject = {
        ...req.body,
        src: `${url}post/${filename}`,
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
        .populate('comments.answer.user', '_id username src')
        .populate('comments.user', '_id username src')
        .populate('comments.answer.speaking.user', '_id username src')
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
    const file = FoundPost.src.replace('https://nodejs-backend-application.onrender.com/routes/uploads/post/', '')
    const filepath = path.join(__dirname, 'uploads', 'post', file)
    unlink(filepath, (err) => {
        if (err) {
            res.status(400).json({
                message: 'Bad request'
            })
        }
    })

    await Post.findByIdAndDelete(id)
    res.status(202).json({ message: 'Success delete' })
})

router.put('/post', upload.single('image'), async (req, res) => {
    const FoundPost = await Post.findById(req.body.id)
    const fileName = FoundPost.src.replace(`${url}post/`, '')
    const filepath = path.join(__dirname, 'uploads', 'post', fileName)
    if (req.file) {
        unlink(filepath, (err) => {
            if (err) {
                res.status(422).json({ error: err })
            }
            res.status(200).json({ message: 'Success update' })
        })
    }
    const updatePost = {
        title: req.body.title ? req.body.title : FoundPost.title,
        body: req.body.body ? req.body.body : FoundPost.body,
        type: req.body.type ? req.body.type : FoundPost.type,
        src: req.file ? `${url}post/${req.file.filename}` : FoundPost.src
    }
    await Post.findByIdAndUpdate(req.body.id, updatePost, { new: true })
    res.status(200).json({ message: 'Success update' })
})

module.exports = router