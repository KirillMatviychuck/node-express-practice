const express = require('express')
const { JSONFilePreset } = require('lowdb/node')



async function startServer() {

    const defaultData = { movies: [] }
    const db = await JSONFilePreset('db.json', defaultData)

    const app = express()
    app.use(express.json())

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

    app.post('/movies', async (req, res) => {
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