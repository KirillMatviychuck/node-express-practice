// src/__tests__/movie.test.js
const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app/app')
const fs = require('fs/promises');
const MovieModel = require('../Schemas/Movie')


jest.mock('../Schemas/Movie')


describe('GET /', () => {
    it('should return a list of movies with status 200', async () => {
        MovieModel.find.mockResolvedValue([
            {
                _id: '1',
                title: 'Inception',
                year: 2010
            },
            {
                _id: '2',
                title: 'The Matrix',
                year: 1999
            }
        ])

        const response = await request(app).get('/')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(2)

        expect(MovieModel.find).toHaveBeenCalled()
    })
})

describe('GET / with pagination', () => {
    it('should return correct pagination metadata', async () => {
        const movies = [
            {
                _id: '1',
                title: 'Inception',
                year: 2010
            },
            {
                _id: '2',
                title: 'The Matrix',
                year: 1999
            }
        ]

        MovieModel.find.mockReturnValue({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(movies)
        })

        MovieModel.countDocuments.mockResolvedValue(2)

        const response = await request(app)
            .get('/')
            .query({
                page: 1,
                limit: 10
            })

        expect(response.status).toBe(200)

        expect(response.body).toEqual(
            expect.objectContaining({
                data: expect.any(Array),
                currentPage: 1,
                totalPages: 1,
                totalItems: 2
            })
        )
    })
})

describe('GET / with query params', () => {
    it('check correct return of meta data', async () => {
        const response = await request(app)
            .get('/')
            .query({
                page: 1,
                limit: 10
            })
        console.log(response.body)

        expect(response.body).toEqual(
            expect.objectContaining({
                data: expect.any(Array),
                currentPage: expect.any(Number),
                totalPages: expect.any(Number),
                totalItems: expect.any(Number),
            })
        )
        expect(response.body.currentPage).toBe(1)
        expect(response.body.totalPages).toBe(1)
        expect(response.body.totalItems).toBe(2)
    })
})

describe('PATCH /movies/:id', () => {
    it('should update movie', async () => {
        MovieModel.findByIdAndUpdate.mockResolvedValue({
            _id: '1',
            title: 'Inception Updated',
            year: 2011
        })

        const response = await request(app)
            .patch('/movies/1')
            .send({
                title: 'Inception Updated',
                year: 2011
            })

        expect(response.status).toBe(200)

        expect(response.body).toEqual(
            expect.objectContaining({
                title: 'Inception Updated',
                year: 2011
            })
        )

        expect(MovieModel.findByIdAndUpdate)
            .toHaveBeenCalledWith(
                '1',
                {
                    title: 'Inception Updated',
                    year: 2011
                },
                {
                    new: true
                }
            )
    })

    it('should return 404 if movie does not exist', async () => {
        MovieModel.findByIdAndUpdate.mockResolvedValue(null)

        const response = await request(app)
            .patch('/movies/999')
            .send({
                title: 'Unknown',
                year: 2000
            })

        expect(response.status).toBe(404)
    })
})

describe('GET /movies/:id', () => {
    it('should return movie by id', async () => {
        MovieModel.findById.mockResolvedValue({
            _id: '1',
            title: 'Inception',
            year: 2010
        })

        const response = await request(app)
            .get('/movies/1')

        expect(response.status).toBe(200)

        expect(response.body).toEqual(
            expect.objectContaining({
                title: 'Inception',
                year: 2010
            })
        )

        expect(MovieModel.findById)
            .toHaveBeenCalledWith('1')
    })

    it('should return 404 if movie does not exist', async () => {
        MovieModel.findById.mockResolvedValue(null)

        const response = await request(app)
            .get('/movies/999')

        expect(response.status).toBe(404)
    })
})

describe('POST /movies', () => {
    it('should create a movie', async () => {
        MovieModel.create.mockResolvedValue({
            _id: '3',
            title: 'Interstellar',
            year: 2014
        })

        const response = await request(app)
            .post('/movies')
            .send({
                title: 'Interstellar',
                year: 2014
            })

        expect(response.status).toBe(201)

        expect(response.body).toEqual(
            expect.objectContaining({
                title: 'Interstellar',
                year: 2014
            })
        )

        expect(MovieModel.create)
            .toHaveBeenCalledWith({
                title: 'Interstellar',
                year: 2014
            })
    })
})


describe('POST /movies', () => {
    it('should return 201 with valid token and correct body', async () => {
        const accessToken = jwt.sign({ id: 2, email: 'burunduk@gmail.com' }, process.env.ACCESS_SECRET, { expiresIn: '3m' })

        const response = await request(app)
            .post('/movies')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: "Kill Bill",
                year: 2001
            })

        expect(response.status).toBe(201)
        expect(response.body).toEqual({
            id: expect.any(Number),
            title: "Kill Bill",
            year: 2001
        })
    })
})

describe('DELETE /movies/:id', () => {
    const accessToken = jwt.sign({ id: 2, email: 'burunduk@gmail.com' }, process.env.ACCESS_SECRET, { expiresIn: '3m' })

    it('should return 204 with existed id', async () => {

        const response = await request(app)
            .delete('/movies/1')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(204)
    })
    it('should return 204 with existed id', async () => {

        const response = await request(app)
            .delete('/movies/5')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(404)
    })
})

describe('POST /movies/:id/poster', () => {
    let uploadedFile;

    it('must return movie with moviePoster field when request was successful', async () => {

        const response = await request(app)
            .post('/movies/2/poster')
            .attach('file', Buffer.from('fake image'), {
                filename: 'file.jpg',
                contentType: 'image/jpeg'
            });
        uploadedFile = response.body.response.moviePoster;
        const filePath = `${response.body.response.moviePoster}`;

        expect(response.status).toBe(200)
        expect(response.body.response).toHaveProperty('id');
        expect(response.body.response).toHaveProperty('title');
        expect(response.body.response).toHaveProperty('moviePoster');
        expect(response.body.response.moviePoster).toBeTruthy();
        expect(response.body.response.id).toBe(2);
        await expect(fs.access(filePath)).resolves.toBeUndefined();
    })

    afterEach(async () => {
        if (uploadedFile) {
            await fs.unlink(uploadedFile);
            uploadedFile = null;
        }
    })
})