const express = require('express')
const movies = [
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
const PORT = 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))