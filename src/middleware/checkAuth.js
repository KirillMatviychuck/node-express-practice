const jwt = require('jsonwebtoken');

async function checkAuth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(401).json('Not verified')
    try {
        const response = jwt.verify(token, process.env.ACCESS_SECRET)
        req.user = response
        next()
    } catch (err) {
        return res.status(401).json('Invalid enter')
    }
}

module.exports = checkAuth
