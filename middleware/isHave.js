import { getToken } from "../jwt/token.js";
import User from "../models/User.js"
export default async function (req, res, next) {
    const { userId } = getToken(req.headers.authorization).payload
    const user = await User.findById(userId)
    req.user = user
    next()
}