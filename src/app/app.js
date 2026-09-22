const express = require('express')
const router = require('express').Router()
const cors = require('cors')
const { checkSchema } = require('express-validator');
const checkAuth = require('../middleware/checkAuth');
const errorHandler = require('../middleware/errorHandler');
const { addMovie, changeMovie, deleteMovie, getAllMovies, getMovie } = require('../controllers/movieController')
const { loginUser, logoutUser, refreshUserToken, registerUser } = require('../controllers/authController')
const { emailValidationSchema, passwordValidationSchema } = require('../utils/validationSchemas')
const validate = require('../utils/validate')
const loginLimiter = require('../middleware/loginRateLimiter')
const registrationimiter = require('../middleware/registrationRateLimiter');
const { addMoviePoster } = require('../controllers/movieController');
const multer = require('multer')
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});
require('dotenv').config()



const app = express()
app.use(cors())
app.use(express.json())

router.post('/auth/register',
    registrationimiter,
    checkSchema({ ...emailValidationSchema, ...passwordValidationSchema }),
    validate,
    registerUser)
router.post('/auth/login',
    loginLimiter,
    checkSchema({ ...emailValidationSchema, ...passwordValidationSchema }),
    validate,
    loginUser)
router.post('/auth/logout', logoutUser)
router.post('/auth/refresh', refreshUserToken)
router.get('/', getAllMovies)
router.get('/movies/:id', getMovie)
router.post('/movies', checkAuth, addMovie)
router.patch('/movies/:id', checkAuth, changeMovie)
router.delete('/movies/:id', checkAuth, deleteMovie)
router.post('/movies/:id/poster', upload.single('file'), addMoviePoster)

app.use('/', router)
app.use(errorHandler);

module.exports = app