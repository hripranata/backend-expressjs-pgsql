const { check } = require('express-validator');
// const jwt = require('jsonwebtoken');
// const { error } = require('../helpers/responseApi');
// const config = require('../config/auth');

/**
 * Register Validation
 */
exports.registerValidation = [
  check('fullname', 'Fullname is required').not().isEmpty(),
  check('email', 'Email is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
];

/**
 * Login Validation
*/
exports.loginValidation = [
  check('email', 'Email is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
];