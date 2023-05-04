import express from "express"
import * as dotenv from "dotenv"
dotenv.config()
import UserRoutes from "./routes/user.js"
import PostRoutes from "./routes/post.js"
import mongoose from "mongoose"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { fileURLToPath } from "url"
import path, { dirname } from "path"
import GlobalChat from "./models/globalChat.js"
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use('/routes/uploads/', express.static('./routes/uploads'))
app.use(express.json())
app.use(cors({ origin: '*' }))


app.use('/api', UserRoutes)
app.use('/api', PostRoutes)



const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})
io.on('connection', socket => {
    socket.on('message', data => {
        async function create(data2) {
            const result = await GlobalChat.create(data2)
            return result
        }
        create(data)
        socket.broadcast.emit('message:received', data)
    })
    GlobalChat.find()
        .populate('user', '_id username src')
        .then((res) => {
            socket.emit('getAll', res)
        })
})



function ServerDebug() {
    const PORT = process.env.PORT ?? 3000
    mongoose.connect('mongodb://localhost:27017/two')
        .then(() => console.log('MongoDB was connected'))
        .catch((error) => console.log("MongoDB wasn't connect because " + error))
    server.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
}

ServerDebug()