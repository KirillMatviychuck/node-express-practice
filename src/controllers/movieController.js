const { getDB } = require('../config/db')
const MovieModel = require('../Schemas/Movie')

async function addMovie(req, res, next) {
    try {
        const { title, year } = req.body

        const checkMovie = await MovieModel.findOne({ title })

        if (checkMovie) {
            return res.status(409).json({ error: 'Such movie already exists' })
        }

        const movie = await MovieModel.create({
            title,
            year
        })
        return res.status(201).json(movie)

    } catch (error) {
        next(error)
    }
};

async function changeMovie(req, res, next) {
    try {
        const { title, year } = req.body
        const response = await MovieModel.findOneAndUpdate(
            { title },
            { year },
            { new: true }
        )

        if (!response) {
            return res.status(404).json('Not found')
        }
        res.status(200).json(response)
    } catch (error) {
        next(error)
    }
};

async function deleteMovie(req, res, next) {
    try {
        const id = req.params.id

        const response = await MovieModel.findByIdAndDelete(id)

        if (!response) {
            return res.status(404).json({ error: 'Movie with such id does not exist' })
        }
        res.status(200).json(response)
    } catch (error) {
        next(error)
    }

};

async function getMovie(req, res, next) {
    try {
        const id = req.params.id
        const response = await MovieModel.findById(id)
        if (!response) {
            return res.status(404).send('Not found')
        }
        res.json(response)
    } catch (error) {
        next(error)
    }
};

async function getAllMovies(req, res, next) {
    try {
        const page = Number(req.query.page)
        const limit = Number(req.query.limit)

        if (page && limit) {
            const skip = (page - 1) * limit
            const moviesResponse = await MovieModel
                .find()
                .skip(skip)
                .limit(limit)

            const totalItems = await MovieModel.countDocuments()

            return res.json({
                data: moviesResponse,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems
            })
        }
        const response = await MovieModel.find()
        res.send(response)
    } catch (error) {
        next(error)
    }
}


async function addMoviePoster(req, res, next) {
    const id = req.params.id
    const poster = req.file

    if (!id) {
        return res.status(400).json({ error: 'ID is required' })
    }
    try {
        const updatedMovie = await MovieModel.findByIdAndUpdate(id,
            {
                poster: poster.path
            },
            {
                new: true
            }
        )

        if (!updatedMovie) {
            return res.status(404).json({ error: 'Such movie is missing' })
        }

        res.json({ updatedMovie })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addMovie, getMovie, deleteMovie, changeMovie, getAllMovies, addMoviePoster

}