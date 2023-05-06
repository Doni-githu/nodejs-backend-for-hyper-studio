import express from "express"
import * as dotenv from "dotenv"
dotenv.config()
import { createServer } from "http"
import UserRoutes from "./routes/user.js"
import PostRoutes from "./routes/post.js"
import mongoose from "mongoose"
import cors from "cors"
import { Server } from "socket.io"
import { fileURLToPath } from "url"
import path, { dirname } from "path"
import GlobalChat from "./models/globalChat.js"
import Post from "./models/Post.js"
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use('/routes/uploads/', express.static('./routes/uploads'))
app.use(express.json())
app.use(cors({
    origin: '*',
    allowedHeaders: '*'
}))


app.use('/api', UserRoutes)
app.use('/api', PostRoutes)



const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT'],
        allowedHeaders: '*'
    },
})


io.on('connection', socket => {
    async function create(model, data2) {
        const result = await model.create(data2)
        return result
    }

    async function updated(data) {
        const updatedPost = await Post.findByIdAndUpdate(data.post, {
            $push: { comments: [{ text: data.text, user: data.user._id }] }
        }, { new: true })
            .populate('comments.answer.user', '_id username src')
            .populate('comments.user', '_id username src')
            .populate('comments.answer.speaking.user', '_id username src')
        return updatedPost
    }
    socket.on('message', data => {
        create(GlobalChat, data)
        socket.broadcast.emit('message:received', data)
    })
    GlobalChat.find()
        .populate('user', '_id username src')
        .then((res) => {
            socket.emit('getAll', res)
        })
    socket.on('comment', data => {
        updated(data)
            .then((res) => {
                socket.broadcast.emit('comment-message', (res.comments))
            })
    })
    socket.on('commentGetAll', id => {
        Post.findById(id)
            .populate('comments.answer.user', '_id username src')
            .populate('comments.user', '_id username src')
            .populate('comments.answer.speaking.user', '_id username src')
            .then(res => {
                socket.broadcast.emit('post', (res.comments))
            })
    })
    socket.on('answer', async (data) => {
        const FoundPost = await Post.findById(data.post)
        for (let i = 0; i < FoundPost.comments.length; i++) {
            const element = FoundPost.comments[i];
            if (element._id.toString() === data.commentsId) {
                element.answer.push({ text: data.text, user: data.user })
            }
        }
        Post.findByIdAndUpdate(data.post, FoundPost, { new: true })
            .populate('comments.answer.user', '_id username src')
            .populate('comments.user', '_id username src')
            .populate('comments.answer.speaking.user', '_id username src')
            .then((res) => {
                socket.broadcast.emit('post', (res.comments))
            })
    })
    socket.on('speaking', async (data) => {
        const FoundPost = await Post.findById(data.post)
        for (let i = 0; i < FoundPost.comments.length; i++) {
            const element = FoundPost.comments[i];
            if (element._id.toString() === data.commentsId) {
                for (let j = 0; j < element.answer.length; j++) {
                    const el = element.answer[j];
                    if (el._id.toString() === data.speakingId) {
                        el.speaking.push({
                            text: data.text,
                            user: data.user
                        })
                    }
                }
            }
        }
        Post.findByIdAndUpdate(data.post, FoundPost, { new: true })
            .populate('comments.answer.user', '_id username src')
            .populate('comments.user', '_id username src')
            .populate('comments.answer.speaking.user', '_id username src')
            .then((res) => {
                console.log(res.comments);
                socket.broadcast.emit('post', (res.comments))
            })
    })
})



function ServerDebug() {
    const PORT = process.env.PORT ?? 3000
    mongoose.connect(process.env.URI_MONGODB)
        .then(() => console.log('MongoDB was connected'))
        .catch((error) => console.log("MongoDB wasn't connect because " + error))
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}

ServerDebug()