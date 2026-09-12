const request = require('supertest')
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

describe('/auth/register', () => {
    it('POST with wrong email ', async () => {
        const response = await request(app)
        .post('/auth/register')
        .send({email: 'not-email', password: 12345678})

        expect(response.status).toBe(400)
        expect(response.body.errors[0].msg).toBe('Invalid email')
    })

    it('POST with wrong password ', async () => {
        const response = await request(app)
        .post('/auth/register')
        .send({email: 'johnny@gmail.com', password: 4444})

        expect(response.status).toBe(400)
        expect(response.body.errors[0].msg).toBe('Password should be at least 5 characters with a max of 72 of it')
    })

    it('POST with correct data', async () => {
         const response = await request(app)
        .post('/auth/register')
        .send({email: 'johnny@gmail.com', password: '123456'})

        expect(response.status).toBe(201)
    })
})