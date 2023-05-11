import { Router } from "express";
import User from "../models/User.js";
import { generateToken, getToken } from "../jwt/token.js"
import bcrypt from "bcrypt"
import multer from "multer"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { v4 } from "uuid"
import sendEmail from "../utils/sendEmail.js"
import { url } from "../staticUrl.js";
const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const disk = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/uploads/avatar/'))
    },
    filename: (req, file, cb) => {
        cb(null, `image-${v4()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: disk,
})

router.post('/user', upload.single('image'), async (req, res) => {
    const { filename } = req.file
    const { username, email, password } = req.body
    const isHaveUsername = await User.findOne({ username: username })
    if (isHaveUsername) {
        res.status(400).json({ message: 'User name is taken' })
        return
    }
    const isHaveEmail = await User.findOne({ email: email })
    if (isHaveEmail) {
        res.status(400).json({ message: 'Email is taken' })
        return
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const newObject = {
        username,
        email,
        channel: `@${username}`,
        password: hashPassword,
        src: `${url}avatar/${filename}`
    }

    const { _id } = await User.create(newObject)
    const urlToEmail = `http://localhost:5173/users/${_id}/verify`
    await sendEmail(email, "Verify Email", urlToEmail)
    res.status(200).json({ messsage: 'Check your email' })
})

router.get('/:id/verify', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const token = generateToken(req.params.id)
        if (!user) {
            res.status(400).json({ message: 'User not found' })
        }
        const response = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true })
        const userInfo = {
            response,
            token
        }
        res.status(201).json({ user: userInfo })
    } catch (error) {
        if (error) {
            res.status(500).json({ message: error })
        }
    }
})

router.post('/user/login', async (req, res) => {
    const { email, password } = req.body
    const isExistAccount = await User.findOne({ email })
    if (!isExistAccount) {
        res.status(404).json({ message: 'User not found' })
        return
    }

    const compare = await bcrypt.compare(password, isExistAccount.password)
    if (!compare) {
        res.status(400).json({ message: 'Password is wrong' })
        return
    }

    if (!isExistAccount.verified) {
        console.log(isExistAccount)
        const urlToEmail = `https://hyper-studio.onrender.com/users/${isExistAccount._id}/verify`
        await sendEmail(email, "Verify Email", urlToEmail)
        res.status(200).json({ message: 'Check your email' })
        return
    }

    const token = generateToken(isExistAccount._id)
    res.status(200).json({
        user: {
            username: isExistAccount.username,
            token,
            src: isExistAccount.src
        }
    })
})

router.get('/user', async (req, res) => {
    const token = req.headers.authorization.replace('Token ', '')
    const { userId } = getToken(token).payload
    const user = await User.findById(userId)
    res.status(200).json({ user })
})

router.get('/user/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    res.status(200).json({ user })
})

router.get('/users', async (req, res) => {
    const users = await User.find().select('_id username src')
    res.status(200).json({ users })
})

export default router
