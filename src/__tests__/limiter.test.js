const request = require('supertest');
const app = require('../app/app');


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

describe('check auth limiter for login', () => {
    it('over 5 request in 15 minutes', async () => {

        for (let i = 0; i < 5; i++) {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'jonny@gmail.com', password: '555557' })

            expect(response.status).not.toBe(429)
        }

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'jonny@gmail.com', password: '555557' })

        expect(response.status).toBe(429)
    })
})
describe('check auth limiter for registration', () => {
    it('over 5 request in 15 minutes', async () => {

        for (let i = 0; i < 10; i++) {
            const response = await request(app)
                .post('/auth/register')
                .send({ email: 'jonny@gmail.com', password: '555557' })

            expect(response.status).not.toBe(429)
        }

        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'jonny@gmail.com', password: '555557' })

        expect(response.status).toBe(429)
    })
})

