const { getDB } = require('../config/db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function loginUser(req, res) {
    const { email, password } = req.body
    const db = await getDB()
    const currentUser = db.data.users.find(user => user.email === email)
    if (!currentUser) {
        return res.status(401).json('Invalid credentials')
    }

    const isValid = await bcrypt.compare(password, currentUser.password)
    if (!isValid) {
        return res.status(401).json('Wrong email or password')
    }

    const accessToken = jwt.sign({ id: currentUser.id, email }, process.env.ACCESS_SECRET, { expiresIn: '30m' })
    const refreshToken = jwt.sign({ id: currentUser.id, email }, process.env.REFRESH_SECRET, { expiresIn: '3d' })
    const refreshTokenUser = {
        id: currentUser.id,
        email,
        refreshToken
    }
    db.data.refreshTokens.push(refreshTokenUser)
    await db.write()
    res.status(200).json({ accessToken, refreshToken })
}

async function logoutUser(req, res) {
    const db = await getDB()
    const { refreshToken } = req.body
    if (!refreshToken) {
        return res.status(400).json('cannot logout')
    }
    db.data.refreshTokens = db.data.refreshTokens.filter(user => user.refreshToken !== refreshToken)
    await db.write()
    res.status(200).json('Logout succeed')
}

async function registerUser(req, res) {
    const db = await getDB()
    const { email, password } = req.body
    const currentUser = db.data.users?.find(user => user.email === email)
    if (currentUser) {
        return res.status(403).json('Already exist')
    }
    try {
        const hash = await bcrypt.hash(password, 10)
        const registredUser = {
            id: Math.max(...db.data.users?.map(m => m.id), 0) + 1,
            email,
            password: hash
        }
        db.data.users.push(registredUser)
        await db.write()
    } catch (err) {
        return res.status(400).json({ message: 'Registration failed', error: err })
    }
    res.status(201).json({ message: 'User registered' })
}
 
async function refreshUserToken(req, res) {
    const db = await getDB()
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json('Not authorized')
    const tokensUser = db.data.refreshTokens.find(user => user.refreshToken === refreshToken)
    if (!tokensUser) return res.status(403).json('Forbidden')
    try {
        jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    } catch (err) {
        return res.status(403).json('Forbidden')
    }
    const newAccessToken = jwt.sign({ id: tokensUser.id, email: tokensUser.email }, process.env.ACCESS_SECRET, { expiresIn: '30m' })
    res.json(newAccessToken)
}

module.exports = {
    loginUser, logoutUser, registerUser, refreshUserToken
}