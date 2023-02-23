const router = require('express').Router();

// Controllers
// const { allAccess } = require('../controllers/api/PublicController');
const {
  register, verify, login, getAuthenticatedUser, resendVerification, getAuthenticatedAdmin,
} = require('../controllers/AuthController');
// const { forgot, reset } = require('../controllers/ForgotPasswordController');

// Middleware
const {
  registerValidation, loginValidation, auth, isAdmin,
} = require('../middlewares/auth');

// Routes
router.post('/auth/register', registerValidation, register);
// router.get('/auth/verify/:token', verify);
router.post('/auth/login', loginValidation, login);
// router.post('/auth/verify/resend', resendVerification);
// router.post('/auth/forgot', forgot);
// router.post('/auth/reset/:token', reset);
// router.get('/user', auth, getAuthenticatedUser);
// router.get('/all', allAccess);
// router.get('/admin', auth, isAdmin, getAuthenticatedAdmin);


module.exports = router;
