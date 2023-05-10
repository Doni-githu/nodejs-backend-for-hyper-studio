import { model, Schema } from "mongoose";

const OnlyChatSchema = new Schema({
    firstUser: { type: Schema.Types.ObjectId },
    secondUser: { type: Schema.Types.ObjectId },
    messages: [
        {
            user: { type: Schema.Types.ObjectId },
            message: {type: String, required: true},
        }
    ]
}, {timestamps: true})

const OnlyChat = model('OnlyChat', OnlyChatSchema)