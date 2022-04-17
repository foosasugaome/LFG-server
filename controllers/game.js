const express = require('express')
const res = require('express/lib/response')
const db = require('../models')
const requiresToken = require('./requiresToken')
const router = express.Router()

// CREATE A GAME
router.post('/', async (req, res) => {
    try {

        const checkGame = await db.Game.findOne({
            name: req.body.name
        })

        if (checkGame) return res.status(409).json({ msg: 'That game is already in the database' })

        const newGame = await db.Game.create({
            name: req.body.name,
            image: req.body.image,
            icon: req.body.icon,
            platform: req.body.platform,
            genre: req.body.genre,
            developer: req.body.developer,
            type: req.body.type,
            rawgId: req.body.rawgId,
            rawgdata : req.body.rawgdata
        })

        res.json(newGame)
    } catch (err) {
        res.status(503).json({ msg: "server error" })
    }

})


// View all games
router.get('/', async (req, res) => {
    try {
        const allgames = await db.Game.find()
        res.json(allgames)
    } catch (err) {
        res.status(503).json({ msg: "There are no games in the DB" })
    }
})

// View the specific game
router.get('/:id', async (req, res) => {
    try {
        const foundGame = await db.Game.findOne({
            _id: req.params.id
        })
        res.json(foundGame)
    } catch (err) {
        res.status(503).json({ msg: "Ooops, we don't have that game here! Now, git!" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const gameToUpdate = await db.Game.findByIdAndUpdate(req.params.id, req.body)
        const foundGame = await db.Game.findById(req.params.id)
        res.json(foundGame)
    } catch (err) {
        res.status(503).json({ msg: "What are you doing? Now, git!" })
    }
})

module.exports = router
