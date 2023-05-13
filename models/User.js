const { Schema, model } = require('mongoose')
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    channel: { type: String },
    password: { type: String, required: true },
    src: { type: String, required: true },
    verified: { type: Boolean, default: false },
})

const User = model('User', UserSchema)
module.exports = User