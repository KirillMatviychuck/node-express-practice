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

    const page = Number(req.query.page)
    const limit = Number(req.query.limit)

    if (page && limit) {
        const start = (page - 1) * limit
        const end = start + limit

        const moviesResponse = db.data.movies.slice(start, end)

        return res.send({
            data: moviesResponse,
            currentPage: page,
            totalPages: Math.ceil(db.data.movies.length / limit),
            totalItems: db.data.movies.length
        })
    }
    res.send(db.data.movies)
}


async function addMoviePoster(req, res) {
    const id = Number(req.params.id)
    const poster = req.file
    console.log(poster)

    const db = await getDB()
    if (!id) {
        return res.status(400).json({ error: 'ID is required' })
    }

    const targetMovie = db.data.movies.find(movie => movie.id === id)
    if (!targetMovie) {
        return res.status(404).json({ error: 'Such movie is missing' })
    }

    db.data.movies = db.data.movies.map(movie => movie.id === id ? { ...movie, moviePoster: poster.path } : movie)
    await db.write()
    const response = db.data.movies.find(movie => movie.id === id)
    res.json({ response })
}

module.exports = {
    addMovie, getMovie, deleteMovie, changeMovie, getAllMovies, addMoviePoster

}