const { getDB } = require('../config/db')

async function addMovie(req, res) {
    const db = await getDB()
    const id = Math.max(...db.data.movies.map(m => m.id), 0) + 1
    const newMovie = { id, ...req.body }
    db.data.movies.push(newMovie)
    await db.write()
    res.status(201).json(newMovie)
};

async function changeMovie(req, res) {
    const db = await getDB()
    const id = +req.params.id
    const isExist = db.data.movies.find(movie => movie.id === id)
    if (!isExist) {
        return res.status(404).send('Not found')
    }
    db.data.movies = db.data.movies.map(movie => movie.id === id ? { ...movie, ...req.body } : movie)
    await db.write()
    const response = db.data.movies.find(movie => movie.id === id)
    res.status(200).send(response)
};

async function deleteMovie(req, res) {
    const db = await getDB()
    const id = +req.params.id
    const isExist = db.data.movies.find(movie => movie.id === id)
    if (!isExist) {
        return res.status(404).send('Not found')
    }
    db.data.movies = db.data.movies.filter(movie => movie.id !== id)
    await db.write()
    res.status(204).send('Succeed')
};

async function getMovie(req, res) {
    const db = await getDB()
    const id = +req.params.id
    const result = db.data.movies.find(movie => movie.id === id)
    if (!result) {
        return res.status(404).send('Not found')
    }
    res.send(result)
};

async function getAllMovies(req, res) {
    const db = await getDB()
    res.send(db.data.movies)
}

module.exports = {
    addMovie, getMovie, deleteMovie, changeMovie, getAllMovies

}