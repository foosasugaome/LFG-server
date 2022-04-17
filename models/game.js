const mongoose = require('mongoose')

const GameSchema = mongoose.Schema({
    name: String,
    image: String,
    icon: String,
    platform: [String],
    genre: [String],
    developer: String,
    type: String,
    rawgId : String,
    rawgdata: [Object]
},{timestamps: true})

module.exports = mongoose.model('Game', GameSchema) 