const express = require('express')
const router = require('express').Router()
const cors = require('cors')
const checkAuth = require('./src/middleware/checkAuth');
const errorHandler = require('./src/middleware/errorHandler');
const { addMovie, changeMovie, deleteMovie, getAllMovies, getMovie } = require('./src/controllers/movieController')
const { loginUser, logoutUser, refreshUserToken, registerUser } = require('./src/controllers/authController')
require('dotenv').config()

async function startServer() {

    const app = express()
    app.use(cors())
    app.use(express.json())

    router.post('/auth/register', registerUser)
    router.post('/auth/login', loginUser)
    router.post('/auth/logout', logoutUser)
    router.post('/auth/refresh', refreshUserToken)
    router.get('/', getAllMovies)
    router.get('/movies/:id', getMovie)
    router.post('/movies', checkAuth, addMovie)
    router.put('/movies/:id', checkAuth, changeMovie)
    router.delete('/movies/:id', checkAuth, deleteMovie)

    app.use('/', router)
    app.use(errorHandler);

    const PORT = 3000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

startServer()