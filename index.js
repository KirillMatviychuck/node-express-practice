const express = require('express')
let movies = [
    { id: 1, title: 'Inception', year: 2010 },
    { id: 2, title: 'The Matrix', year: 1999 },
]

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.send(movies)
})
app.get('/movies/:id', (req, res) => {
    const id = +req.params.id
    const result = movies.find(movie => movie.id === id)
    if (!result) {
        return res.status(404).send('Not found')
    }
    res.send(result)
})

app.post('/movies', (req, res) => {
    console.log(req.body)
    const id = movies.length + 1
    const newMovie = { id, ...req.body }
    movies.push(newMovie)
    res.status(201).json(newMovie)
})

app.put('/movies/:id', (req, res) => {
    const id = +req.params.id
    const isExist = movies.find(movie => movie.id === id)
    if (!isExist) {
        return res.status(404).send('Not found')
    }
    movies = movies.map(movie => movie.id === id ? { ...movie, ...req.body } : movie)
    const response = movies.find(movie => movie.id === id)
    res.status(200).send(response)
})

app.delete('/movies/:id', (req, res) => {
    const id = +req.params.id
    const isExist = movies.find(movie => movie.id === id)
    if (!isExist) {
        return res.status(404).send('Not found')
    }
    movies = movies.filter(movie => movie.id !== id)
    res.status(204).send('Succeed')
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).json({ error: err.message })
});

const PORT = 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))