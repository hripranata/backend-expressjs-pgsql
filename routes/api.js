const router = require('express').Router();

// Controllers
// const { allAccess } = require('../controllers/api/PublicController');
const {
  register, verification, login, getAuthenticatedUser, refreshToken, resendVerification, getAuthenticatedAdmin,
} = require('../controllers/authController');
// const { forgot, reset } = require('../controllers/ForgotPasswordController');

// Middleware
const {
  registerValidation, loginValidation, verifyJwt, rolePerm, verifyRefresh
} = require('../middlewares/auth');

// Routes
router.post('/auth/register', registerValidation, register);
router.get('/auth/verification/:token', verification);
router.post('/auth/login', loginValidation, login);
router.post('/auth/verification/resend', resendVerification);
// router.post('/auth/forgot', forgot);
// router.post('/auth/reset/:token', reset);
router.post('/user', verifyJwt, rolePerm("VIEW_USER"), getAuthenticatedUser);
// router.get('/all', allAccess);
// router.get('/admin', auth, isAdmin, getAuthenticatedAdmin);
router.post('/auth/refresh', refreshToken)


module.exports = router;
