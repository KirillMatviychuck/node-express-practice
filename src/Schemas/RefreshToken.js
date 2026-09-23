const mongoose = require('mongoose')
const { Schema } = mongoose

const refreshTokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
})

const RefreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshTokenModel;