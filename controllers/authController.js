require('dotenv').config();
const { validationResult } = require('express-validator');
const { success, error, validation } = require('../helpers/responseApi');
const { randomString } = require('../helpers/common');
const User = require('../database/models').User;
const Role = require('../database/models').Role;
const Verification = require('../database/models').Verification;
// const db = require('../database/models/');
const jwt = require('jsonwebtoken');
const mail = require('../config/mail');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(422).json(validation(errors.array())); }
    const { email, password, fullname, phone } = req.body;
    console.log(req);
    try {
        // const user = await db.sequelize.query('SELECT * FROM "public"."Users" WHERE email = :email', {
        //     replacements: {email: email},
        //     type: db.sequelize.QueryTypes.SELECT
        // });

        const user = await User.findOne({
            where: {
                email: email
            }
        })
        // console.log(user);

        if (user) {
          return res.status(422).json(validation({ msg: 'Email already registered' }));
        }

        // Role.findOne({
        //     where: {
        //         role_name: 'Admin'
        //     }
        // }).then((role) => {
        //     // console.log(role.id);
        //     User.create({
        //         email: email,
        //         password: password,
        //         fullname: fullname,
        //         phone: phone,
        //         role_id: role.id
        //     })
        //     .then((user) => {
        //         res.status(200).json(success('Register success, please activate your account.', user, res.statusCode))
        //     })
        //     .catch((err) => {
        //         console.error(err.message);
        //         res.status(500).json(error('Server error', res.statusCode));
        //     });
        // }).catch((err) => {
        //     console.error(err.message);
        //     res.status(500).json(error('Server error', res.statusCode));
        // });

        const role = await Role.findOne({
            where: {
                role_name: 'Admin'
            }
        })
        if (!role) {
            console.log("Find role : " + role);
            res.status(500).json(error('Server error', res.statusCode));
        }
        const newUser = await User.create({
            email: email,
            password: password,
            fullname: fullname,
            phone: phone,
            role_id: role.id
        })
        if (!newUser) {
            console.log("New User : " + newUser);
            res.status(500).json(error('Server error', res.statusCode));
        }
        const token = randomString(50);
        const verification = await Verification.create({
            user_id: newUser.id,
            token: token,
            token_type: 'Register New Account',
        });
        if (!verification) {
            console.log("Verification : " + verification);
            res.status(500).json(error('Server error', res.statusCode));
        }

        await mail.sendConfirmationEmail(
            fullname,
            email,
            token,
        );

        res.status(200).json(success('Register success, please activate your account.', newUser, res.statusCode))

    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
}

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(422).json(validation(errors.array())); }
    const { email, password } = req.body;

    User.findOne({
        where: {
            email: email
        }
    })
    .then((user) => {
        if (!user) {
            return res.status(401).json(error('Authentication failed. User not found.', res.statusCode));
        }
        user.comparePassword(password, (err, isMatch) => {
            const payload = { email: user.email, role_id: user.role_id};
            if (isMatch && !err) {
                const accessToken = jwt.sign(
                    payload, 
                    process.env.ACCESS_TOKEN_PRIVATE_KEY, 
                    { expiresIn: "30m" }
                );
                const refreshToken = jwt.sign(
                    payload, 
                    process.env.REFRESH_TOKEN_PRIVATE_KEY, 
                    { expiresIn: "30d" }
                );

                res.json({
                    success: true,
                    data: payload,
                    access_token: 'Bearer ' + accessToken,
                    refresh_token: 'Bearer ' + refreshToken
                });
            } else {
                res.status(401).json(error('Authentication failed. Wrong password.', res.statusCode));
            }
        })
    })
    .catch((err) => {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    });
}

exports.getAuthenticatedUser = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        // console.log(user);

        if (!user) {
          return res.status(422).json(validation({ msg: 'User not found!' }));
        }
  
      // Send the response
      res.status(200).json(success(`Hello ${user.fullname}`, { data: [user] }, res.statusCode));
    } catch (err) {
      console.error(err.message);
      res.status(500).json(error('Server error', res.statusCode));
    }
  
    return false;
};

exports.refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    const splitRefreshToken = refresh_token.split(' ');
    const bearer = splitRefreshToken[0];
    const token = splitRefreshToken[1];
  
    if (bearer !== 'Bearer') {
      return res.status(400).json(error('The type is must be a Bearer', res.statusCode));
    }
  
    if (!token) return res.status(404).json(error('No token found'));

    const jwtData = await jwt.verify(token, process.env.REFRESH_TOKEN_PRIVATE_KEY);

    if (!jwtData) { return res.status(401).json(error('Unauthorized', res.statusCode)); }

    const payload = { email: jwtData.email, role_id: jwtData.role_id}

    try {
        const accessToken = jwt.sign(
            payload, 
            process.env.ACCESS_TOKEN_PRIVATE_KEY, 
            { expiresIn: "30m" }
        );
    
        res.json({
            success: true,
            data: payload,
            access_token: 'Bearer ' + accessToken,
            refresh_token: 'Bearer ' + refresh_token
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }

    return false;
}