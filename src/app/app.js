const express = require('express')
const router = require('express').Router()
const cors = require('cors')
const { checkSchema } = require('express-validator');
const checkAuth = require('../middleware/checkAuth');
const errorHandler = require('../middleware/errorHandler');
const { addMovie, changeMovie, deleteMovie, getAllMovies, getMovie } = require('../controllers/movieController')
const { loginUser, logoutUser, refreshUserToken, registerUser } = require('../controllers/authController')
const { emailValidationSchema,passwordValidationSchema } = require('../utils/validationSchemas')
const validate  = require('../utils/validate')
require('dotenv').config()



const app = express()
app.use(cors())
app.use(express.json())

router.post('/auth/register',
    checkSchema({...emailValidationSchema, ...passwordValidationSchema}),
    validate, 
    registerUser)
router.post('/auth/login', 
    checkSchema({...emailValidationSchema, ...passwordValidationSchema}),
    validate, 
    loginUser)
router.post('/auth/logout', logoutUser)
router.post('/auth/refresh', refreshUserToken)
router.get('/', getAllMovies)
router.get('/movies/:id', getMovie)
router.post('/movies', checkAuth, addMovie)
router.put('/movies/:id', checkAuth, changeMovie)
router.delete('/movies/:id', checkAuth, deleteMovie)

app.use('/', router)
app.use(errorHandler);

module.exports = app