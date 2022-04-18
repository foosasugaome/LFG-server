require('dotenv').config()
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../models')
const requiresToken = require('./requiresToken')
const user = require('../models/user')

//GET / -- view all users
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.User.find()

    res.json(allUsers)
  } catch (err) {
    res.state(503).json({ msg: 'there are no users' })
  }
})

//GET /:id -- view all details about user

router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.find({
      _id: req.params.id
    })
    res.json(user)
  } catch (err) {}
})

// POST /users/register -- CREATE a new user
router.post('/register', async (req, res) => {
  try {
    // check if the user exist already -- dont allow them to sign up again
    const emailCheck = await db.User.findOne({
      email: req.body.email
    })

    if (emailCheck)
      return res.status(409).json({ msg: 'Email already registered.' })
    // check if the user exist already -- dont allow them to sign up again
    const userCheck = await db.User.findOne({
      username: req.body.username
    })

    if (userCheck)
      return res.status(409).json({ msg: 'Username already registered.' })
      
  
      // hash the pass (could validate if we wanted)
      const salt = 12
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      // create a user in th db
      const newUser = await db.User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      })

      // create a jwt payload to send back to the client
      const payload = {
        username: newUser.username,
        email: newUser.email,
        id: newUser.id,
        parties: newUser.parties,
        games: newUser.games
      }
      // sign the jwt and send it (log them in)
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 60
      })
      res.json({ token })
  } catch (err) {
    console.log(err)
    res.status(503).json({ msg: 'oops server error 503 🔥😭' })
  }
})

// Add a game username to profile
router.put('/edit', async (req,res)=>{
try{

  if(req.body.username == "" || req.body.game_fk == ""){
    return res.status(503).json({ msg: 'input a username and/or game' })
  }
  if(!req.body.id){
    return res.status(503).json({ msg: 'no one is logged in' })
  }
  const foundUser = await db.User.findOne({
    _id: req.body.id
  })
  const foundUserIndex = foundUser.games.findIndex((elem, idx)=>{
    return elem.game_fk === req.body.game_fk
  })
  console.log(foundUserIndex)
  if(foundUserIndex == -1){


    foundUser.games.push({
      game_fk: req.body.game_fk,
      username: req.body.username,
      gameName: req.body.gameName
    })
    await foundUser.save()

    res.json({foundUser})

  } else {

    foundUser.games[foundUserIndex] = {
      game_fk: req.body.game_fk,
      username: req.body.username,
      gameName: req.body.gameName
    }
      
      await foundUser.save()
      
      res.json({foundUser})
    }
} catch(err){
  console.log(err)
}

})
// POST /users/login -- validate login credentials
router.post('/login', async (req, res) => {
  // try to find the use in the db that is logging in
  const foundUser = await db.User.findOne({
    username: req.body.username
  })

  // if the user is not found -- return and send back a message that the user needs to sign up
  if (!foundUser)
    return res.status(400).json({ msg: 'bad login credentials 😢' })

  // check the password from the req.body again the password in the db
  const matchPasswords = await bcrypt.compare(
    req.body.password,
    foundUser.password
  )

  // if the provided info does not match -- send back an error message and return
  if (!matchPasswords)
    return res.status(400).json({ msg: 'bad login credentials 😢' })

  // create a jwt payload
  const payload = {
    username: foundUser.username,
    email: foundUser.email,
    id: foundUser.id,
    games: foundUser.games,
    parties: foundUser.parties
  }

  // sign the jwt
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 60 * 60
  })

  // send it back
  res.json({ token })
})

// GET /users/auth-locked -- example of checking an jwt and not serving data unless the jwt is valid
router.get('/auth-locked', requiresToken, (req, res) => {
  // here we have acces to the user on the res.locals
  console.log('logged in user', res.locals.user)
  res.json({
    msg:
      'welcome to the auth locked route, congrats on geting thru the middleware 🎉'
  })
})

module.exports = router
