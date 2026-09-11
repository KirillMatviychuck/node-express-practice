
const emailValidationSchema = {
    email: {
        notEmpty: {
            errorMessage: 'Email is required'
        },
        isEmail: {
            errorMessage: 'Invalid email' 
        },
        trim: true
    }
}

const passwordValidationSchema = {
    password: {
        notEmpty: {
            errorMessage: 'Password is required'
        },
        isLength: {
            options: {
                min: 5,
                max: 72
            },
            errorMessage: 'Password should be at least 5 characters with a max of 72 of it'
        }
    }
}


module.exports = {
    emailValidationSchema,
    passwordValidationSchema
}
