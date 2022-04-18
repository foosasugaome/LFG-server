require('dotenv').config()
const jwt = require('jsonwebtoken')
const db = require('../models')

async function requiresToken(req, res, next) {
  try {
    // get token from the client
    const token = req.headers.authorization

    // verify the token -- if not verified will wind up in catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded)
    // find the user from the data in the token
    const foundUser = await db.User.findById(decoded.id) //.populate('refs')
    // mount the user on the response for the next middle/route
    res.locals.user = foundUser
    // invoke next to go the the next middleware function
    next()
  } catch (err) {
    // if we are down here -- authentication has fail
    console.log(err)
    res.status(401).json({ msg: 'you are not allowed to be here, move along now' })
  }
}

module.exports = requiresToken