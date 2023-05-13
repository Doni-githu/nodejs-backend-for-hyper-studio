const OnlyChat = require('../models/OnlyChat.js')
const Router = require('express').Router
const router = Router()

router.post('/gen', async (req, res, next) => {
    const { first, second } = req.body

    const created = {
        firstUser: first,
        secondUser: second
    }

    const found1 = await OnlyChat.findOne({ firstUser: first, secondUser: second })
    const found2 = await OnlyChat.findOne({ firstUser: second, secondUser: first })

    if (found1) {
        res.status(200).json({ messages: found1 })
        return
    }

    if (found2) {
        res.status(200).json({ messages: found2 })
        return
    }

    const made = await OnlyChat.create(created)
    res.status(200).json({ messages: made })
})

router.get('/gened/:id', async (req, res) => {
    const chat = await OnlyChat.findById(req.params.id)
        .populate('firstUser', '_id username src')
        .populate('secondUser', '_id username src')
        .populate('messages.user', '_id username src')

    res.status(200).json({ messages: chat })
})

module.exports = router