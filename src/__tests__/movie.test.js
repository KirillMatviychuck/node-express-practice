// src/__tests__/movie.test.js
const request = require('supertest')

jest.mock('../config/db', () => ({
    getDB: jest.fn().mockResolvedValue({
        data: {
            movies: [
                { id: 1, title: 'Inception', year: 2010 },
                { id: 2, title: 'The Matrix', year: 1999 },
            ],
            users: [],
            refreshTokens: [],
        },
        write: jest.fn().mockResolvedValue(undefined),
    }),
}))

const app = require('../app/app')

describe('GET /', () => {
    it('should return a list of movies with status 200', async () => {
        const response = await request(app).get('/')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(2)
    })
})
describe('GET /movies/:id', () => {
    it('should return 404 withot wrong id', async () => {
        const response = await request(app).get('/movies/7')

        expect(response.status).toBe(404)
    })
})

describe('POST /movies', () => {
    it('should return 401 without token', async () => {
        const response = await request(app)
            .post('/movies')
            .send({ id: 3, title: 'Training day', year: 2002 })

        expect(response.status).toBe(401)
    })
})

describe('POST /auth/register', () => {
    it('should register a new user and return 201', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'newuser@test.com', password: 'password123' })

        expect(response.status).toBe(201)
    })

    it('should return 403 when email already exists', async () => {
        await request(app)
            .post('/auth/register')
            .send({ email: 'duplicate@test.com', password: 'password123' })

        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'duplicate@test.com', password: 'password123' })

        expect(response.status).toBe(403)
    })
})