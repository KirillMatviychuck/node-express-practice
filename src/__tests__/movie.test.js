// src/__tests__/movie.test.js
const request = require('supertest')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const app = require('../app/app')


jest.mock('../config/db', () => ({
    getDB: jest.fn().mockResolvedValue({
        data: {
            movies: [
                { id: 1, title: 'Inception', year: 2010 },
                { id: 2, title: 'The Matrix', year: 1999 },
            ],
            users: [
                { id: 1, email: 'admin@test.com', password: '$2b$10$.OLBgajGECqyaTuEwlywx.e1ltDdk/AlVLrjANYofvm9naIrPQH7q' }
            ],
            refreshTokens: [],
        },
        write: jest.fn().mockResolvedValue(undefined),
    }),
}))


describe('GET /', () => {
    it('should return a list of movies with status 200', async () => {
        const response = await request(app).get('/')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(2)
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
describe('GET /movies/:id', () => {
    it('should return 404 with wrong id', async () => {
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

describe('POST /auth/login', () => {
    it('should return return 200 and two tokens', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' })
        const decoded = jwt.verify(response.body.accessToken, process.env.ACCESS_SECRET)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
        expect(response.body).toHaveProperty('refreshToken')
        expect(typeof response.body.accessToken).toBe('string')
        expect(typeof response.body.refreshToken).toBe('string')
        expect(decoded.email).toBe('admin@test.com')
    })
    it('should return return 401', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: 'password321' })

        expect(response.status).toBe(401)
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