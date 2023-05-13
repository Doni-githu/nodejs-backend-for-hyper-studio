const getToken = require('../jwt/token.js').getToken
const User = require('../models/User.js')
module.exports = async function (req, res, next) {
    const token = req.headers.authorization.replace('Token ', '')
    const { userId } = getToken(token).payload
    const user = await User.findById(userId)
    req.user = user
    next()
}