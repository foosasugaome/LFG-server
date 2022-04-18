require('dotenv').config()
require('./models')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const db = require('./models')
const cors = require('cors')
const morgan = require('morgan')
const fs = require("fs")
const PORT = process.env.PORT || 3001

// middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const myMiddleWare = async (req, res, next) => {
  const games = JSON.parse(
    fs.readFileSync(`gameSeed.json`, 'utf-8')
  )

  console.log(`Incoming request: ${req.method} - ${req.url}`)
  // move along there
  console.log(games)
  try {
    const gameCheck = await db.Game.find()
    if (gameCheck.length === 0) {
      await db.Game.create(games)
    }
    else
      next()
  } catch (error) {
    res.status(503).json({ msg: "Games already exist" })
  }
  next()
}

app.get('/', (req, res) => {
  res.json({ msg: 'LOOKING FOR GROUP!' })
})

app.get('/seed', myMiddleWare, (req, res) => {
  res.json({ msg: 'database seeded! Good to go!' })
})

// controllers
app.use('/users', require('./controllers/users'))
app.use('/game', require('./controllers/game'))
app.use('/party', require('./controllers/party'))
app.use('/board', require('./controllers/messages'))


app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`)
})