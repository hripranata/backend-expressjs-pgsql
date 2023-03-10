const router = require('express').Router();

// Controllers
const {
  register, verification, login, getAuthenticatedUser, refreshToken, resendVerification, forgot, reset
} = require('../controllers/authController');

// Middleware
const {
  registerValidation, loginValidation, verifyJwt, rolePerm
} = require('../middlewares/auth');

// Routes
router.post('/auth/register', registerValidation, register);
router.get('/auth/verification/:token', verification);
router.post('/auth/login', loginValidation, login);
router.post('/auth/verification/resend', resendVerification);
router.post('/auth/forgot', forgot);
router.post('/auth/reset/:token', reset);
router.post('/auth/refresh', refreshToken)
router.post('/user', verifyJwt, rolePerm("VIEW_USER"), getAuthenticatedUser);


module.exports = router;
