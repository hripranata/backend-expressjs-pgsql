require('dotenv').config();
const { check } = require('express-validator');
const jwt = require('jsonwebtoken');
const { error } = require('../helpers/responseApi');
const Permission = require('../database/models').Permission;
const RolePermission = require('../database/models').RolePermission;

exports.registerValidation = [
  check('fullname', 'Fullname is required').not().isEmpty(),
  check('email', 'Email is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
];

exports.loginValidation = [
  check('email', 'Email is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
];

exports.verifyJwt = async (req, res, next) => {
  const authorizationHeader = req.header('Authorization');
  // if header empty
  if (!authorizationHeader) { return res.status(401).json(error('Unauthorized', res.statusCode)); }

  // Split the authorization header value
  const splitAuthorizationHeader = authorizationHeader.split(' ');

  // Get the type of token and actual token
  const bearer = splitAuthorizationHeader[0];
  const token = splitAuthorizationHeader[1];

  // Check the type
  if (bearer !== 'Bearer') {
    return res
      .status(400)
      .json(error('The type is must be a Bearer', res.statusCode));
  }

  // Check the token
  if (!token) return res.status(404).json(error('No token found'));

  try {
    const jwtData = await jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);

    // Check the JWT token
    if (!jwtData) { return res.status(401).json(error('Unauthorized', res.statusCode)); }

    // If is a valid token that JWT verify
    // Insert the data to the request
    req.role = jwtData.role_id;
    
    // Continue the action
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json(error('Unauthorized', res.statusCode));
  }

  return false;
};

exports.rolePerm = (permName) => {
  return (req,res,next) => {
    const roleId = req.role;

    Permission.findOne({
        where: {
            perm_name: permName
        }
    }).then((perm) => {
        RolePermission.findOne({
            where: {
                role_id: roleId,
                perm_id: perm.id
            }
        }).then((rolePermission) => {
            // console.log(rolePermission);
            if(rolePermission) {
                next()
            } else {
                res.status(403).json(error('Forbidden', res.statusCode));
            }
        }).catch(() => {
            res.status(403).json(error('Forbidden', res.statusCode));
        });
    }).catch(() => {
        res.status(403).json(error('Forbidden', res.statusCode));
    });
  }

}