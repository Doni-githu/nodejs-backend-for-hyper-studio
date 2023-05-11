import { model, Schema } from "mongoose";

const OnlyChatSchema = new Schema({
    firstUser: { type: Schema.Types.ObjectId, ref: 'User' },
    secondUser: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            message: { type: String, required: true },
        }
    ]
}, { timestamps: true })

const OnlyChat = model('OnlyChat', OnlyChatSchema)
export default OnlyChat