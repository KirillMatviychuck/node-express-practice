const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../Schemas/User')
const RefreshTokenModel = require('../Schemas/RefreshToken')

async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(401).json('Invalid credentials')
        }
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json('Wrong email or password')
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: '30m' })
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '3d' })
        await RefreshTokenModel.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        })

        res.status(200).json({ accessToken, refreshToken })
    } catch (error) {
        next(error)
    }
}

async function logoutUser(req, res) {
    const { refreshToken } = req.body
    if (!refreshToken) {
        return res.status(400).json({
            error: 'Refresh token is required'
        })
    }
    try {
        await RefreshTokenModel.findOneAndDelete({
            token: refreshToken
        })
        return res.status(200).json('Logged out successfully')
    } catch (error) {
        return res.status(500).json({ error })
    }
}

async function registerUser(req, res) {
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({ email })
        if (user) {
            return res.status(409).json('Already exists')
        }
        const hash = await bcrypt.hash(password, 10)
        await UserModel.create({
            email,
            password: hash
        })
        return res.status(201).json({
            message: 'User registered'
        })
    } catch (error) {
        next(error)
    }
}

async function refreshUserToken(req, res, next) {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) return res.status(401).json('Not authorized')
        const tokensUser = await RefreshTokenModel.findOne({ token: refreshToken })
        if (!tokensUser) return res.status(403).json('Forbidden')
        try {
            jwt.verify(refreshToken, process.env.REFRESH_SECRET)
        } catch (err) {
            return res.status(403).json('Forbidden')
        }
        const newAccessToken = jwt.sign(
            { id: tokensUser.userId },
            process.env.ACCESS_SECRET,
            { expiresIn: '30m' }
        )
        return res.json(newAccessToken)
    } catch (error) {
        next(error)
    }

}

module.exports = {
    loginUser, logoutUser, registerUser, refreshUserToken
}