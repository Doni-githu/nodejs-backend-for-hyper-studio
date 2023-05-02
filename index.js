import express from "express"
import * as dotenv from "dotenv"
dotenv.config()
import UserRoutes from "./routes/user.js"
import PostRoutes from "./routes/post.js"
import mongoose from "mongoose"
import cors from "cors"

const app = express()

app.use('/routes/uploads/', express.static('./routes/uploads'))
app.use(express.json())
app.use(cors({ origin: '*' }))

app.use('/api', UserRoutes)
app.use('/api', PostRoutes)

function Server() {
    const PORT = process.env.PORT ?? 3000
    mongoose.connect('mongodb://localhost:27017/two')
        .then(() => console.log('MongoDB was connected'))
        .catch((error) => console.log("MongoDB wasn't connect because " + error))
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
}

Server()