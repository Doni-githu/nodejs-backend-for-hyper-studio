import { model, Schema } from "mongoose";

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    src: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    comments: [{
        text: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        active: { type: Boolean, default: false },
        answer: [{
            text: { type: String },
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            active: { type: Boolean, default: false },
            speaking: [{
                text: { type: String },
                user: { type: Schema.Types.ObjectId, ref: 'User' },
            }]
        }]
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, required: true }
}, { timestamps: true })

const Post = model('Post', PostSchema)
export default Post