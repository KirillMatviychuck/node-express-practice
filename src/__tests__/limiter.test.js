const request = require('supertest');
const app = require('../app/app');
const UserModel = require('../Schemas/User')

jest.mock('../Schemas/User')

describe('check auth limiter for login', () => {
    it('over 5 request in 15 minutes', async () => {
        UserModel.findOne.mockResolvedValue({
            _id: '1',
            email: 'admin@test.com',
            password: '555557'
        })
        for (let i = 0; i < 5; i++) {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'admin@test.com', password: '555557' })

            expect(response.status).not.toBe(429)
        }

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: '555557' })

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

