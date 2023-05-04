import { model, Schema } from "mongoose";

const GlobalChatSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
}, { timestamps: true })

const GlobalChat = model('GlobalChat', GlobalChatSchema)
export default GlobalChat