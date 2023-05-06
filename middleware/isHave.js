import { getToken } from "../jwt/token.js";
import User from "../models/User.js"
export default async function (req, res, next) {
    const token = req.headers.authorization.replace('Token ', '')
    const { userId } = getToken(token).payload
    const user = await User.findById(userId)
    req.user = user
    next()
}