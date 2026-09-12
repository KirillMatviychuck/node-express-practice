const { rateLimit } = require('express-rate-limit')

const registrationLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
})


module.exports = registrationLimiter;