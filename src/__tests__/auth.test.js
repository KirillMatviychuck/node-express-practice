const request = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const app = require('../app/app')
const UserModel = require('../Schemas/User')
const RefreshTokenModel = require('../Schemas/RefreshToken')


jest.mock('../Schemas/User')
jest.mock('../Schemas/RefreshToken')

describe('POST /auth/register', () => {

    it('should register a new user and return 201', async () => {
        UserModel.findOne.mockResolvedValue(null)
        UserModel.create.mockResolvedValue({
            _id: '1',
            email: 'newuser@test.com',
            password: 'hashed-password'
        })
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'newuser@test.com', password: 'password123' })

        expect(response.status).toBe(201)
    })

    it('should return 409 when email already exists', async () => {
        UserModel.findOne.mockResolvedValue({
            _id: '1',
            email: 'duplicate@test.com',
            password: 'hashed-password'
        })
        await request(app)
            .post('/auth/register')
            .send({ email: 'duplicate@test.com', password: 'password123' })

        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'duplicate@test.com', password: 'password123' })

        expect(response.status).toBe(409)
    })
})

describe('POST /auth/login', () => {
    it('should return return 200 and two tokens', async () => {

        const hashedPassword = await bcrypt.hash('password123', 10)
        UserModel.findOne.mockResolvedValue({
            _id: '1',
            email: 'admin@test.com',
            password: hashedPassword
        })

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' })
        const decoded = jwt.verify(
            response.body.accessToken,
            process.env.ACCESS_SECRET
        )

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
        expect(response.body).toHaveProperty('refreshToken')
        expect(typeof response.body.accessToken).toBe('string')
        expect(typeof response.body.refreshToken).toBe('string')
        expect(decoded.id).toBe('1')
    })
    it('should return return 401', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: 'password321' })

        expect(response.status).toBe(401)
    })
})