const express = require('express')
const { JSONFilePreset } = require('lowdb/node')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

async function startServer() {

    const defaultData = { movies: [], users: [] }
    const db = await JSONFilePreset('db.json', defaultData)

    const app = express()
    app.use(express.json())

    async function checkAuth(req, res, next) {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json('Not verified')
        try {
            const response = jwt.verify(token, process.env.SECRET_KEY)
            req.user = response
            next()
        } catch (err) {
            return res.status(401).json('Invalid enter')
        }
    }

    app.post('/auth/register', async (req, res) => {
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
    })

    app.post('/auth/login', async (req, res) => {
        console.log(req.headers)

        const { email, password } = req.body
        const currentUser = db.data.users.find(user => user.email === email)
        if (!currentUser) {
            return res.status(401).json('Invalid credentials')
        }
        const isValid = await bcrypt.compare(password, currentUser.password)
        if (!isValid) {
            return res.status(401).json('Wrong email or password')
        }
        const token = jwt.sign({ id: currentUser.id, email }, process.env.SECRET_KEY, { expiresIn: '30m' })
        res.status(200).json({ token })
    })

    app.get('/', async (req, res) => {
        res.send(db.data.movies)
    })
    app.get('/movies/:id', (req, res) => {
        const id = +req.params.id
        const result = db.data.movies.find(movie => movie.id === id)
        if (!result) {
            return res.status(404).send('Not found')
        }
        res.send(result)
    })

    app.post('/movies', checkAuth, async (req, res) => {
        const id = Math.max(...db.data.movies.map(m => m.id), 0) + 1
        const newMovie = { id, ...req.body }
        db.data.movies.push(newMovie)
        await db.write()
        res.status(201).json(newMovie)
    })

    app.put('/movies/:id', async (req, res) => {
        const id = +req.params.id
        const isExist = db.data.movies.find(movie => movie.id === id)
        if (!isExist) {
            return res.status(404).send('Not found')
        }
        db.data.movies = db.data.movies.map(movie => movie.id === id ? { ...movie, ...req.body } : movie)
        await db.write()
        const response = db.data.movies.find(movie => movie.id === id)
        res.status(200).send(response)
    })

    app.delete('/movies/:id', async (req, res) => {
        const id = +req.params.id
        const isExist = db.data.movies.find(movie => movie.id === id)
        if (!isExist) {
            return res.status(404).send('Not found')
        }
        db.data.movies = db.data.movies.filter(movie => movie.id !== id)
        await db.write()
        res.status(204).send('Succeed')
    })

    app.use((err, req, res, next) => {
        console.log(err)
        res.status(500).json({ error: err.message })
    });

    const PORT = 3000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

startServer()