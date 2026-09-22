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