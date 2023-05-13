const express = require('express')
require('dotenv').config()
const { createServer } = require('http')
const UserRoutes = require('./routes/user')
const PostRoutes = require('./routes/post')
const mongoose = require('mongoose')
const cors = require('cors')
const { Server } = require('socket.io')
const GlobalChat = require('./models/globalChat')
const Post = require('./models/Post.js')
const ChatRoutes = require('./routes/chat.js')
const OnlyChat = require('./models/OnlyChat.js')

const app = express()

app.use('/routes/uploads/', express.static('./routes/uploads'))
app.use(express.json())
app.use(cors({
    origin: 'https://hyper-studio.onrender.com,https://hyper-studio.netlify.app',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.use('/api', UserRoutes)
app.use('/api', PostRoutes)
app.use('/api', ChatRoutes)


const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'https://hyper-studio.onrender.com,https://hyper-studio.netlify.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    socket.on("join-message", async (data) => {
        const chat = await OnlyChat.findByIdAndUpdate(data.chatId, {
            $push: { messages: [{ message: data.message, user: data.user }] }
        }, { new: true })
            .populate('firstUser', '_id username src')
            .populate('secondUser', '_id username src')
            .populate('messages.user', '_id username src')

        socket.broadcast.emit('post2', chat)
    })
})



async function ServerDebug() {
    const PORT = process.env.PORT ?? 3000
    mongoose.connect(process.env.URI_MONGODB)
        .then((res) => {
            console.log('Mongo DB connected')
        }).catch((err) => {
            console.log("Mongo DB couldn't connected, because " + err)
        })
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}

ServerDebug()