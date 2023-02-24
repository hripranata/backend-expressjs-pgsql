require('dotenv').config();
const { validationResult } = require('express-validator');
const { success, error, validation } = require('../helpers/responseApi');
const User = require('../database/models').User;
const Role = require('../database/models').Role;
// const db = require('../database/models/');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(422).json(validation(errors.array())); }
    const { email, password, fullname, phone } = req.body;
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

        Role.findOne({
            where: {
                role_name: 'Admin'
            }
        }).then((role) => {
            console.log(role.id);
            User.create({
                email: email,
                password: password,
                fullname: fullname,
                phone: phone,
                role_id: role.id
            })
            .then((user) => res.status(200).json(success('Register success, please activate your account.', user, res.statusCode)))
            .catch((err) => {
                console.error(err.message);
                res.status(500).json(error('Server error', res.statusCode));
            });
        }).catch((err) => {
            console.error(err.message);
            res.status(500).json(error('Server error', res.statusCode));
        });

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
            const payload = { email: user.email, role_id: user.role_id}
            if (isMatch && !err) {
                const accessToken = jwt.sign(
                    payload, 
                    process.env.ACCESS_TOKEN_PRIVATE_KEY, 
                    { expiresIn: "15m" }
                );
                const refreshToken = jwt.sign(
                    payload, 
                    process.env.REFRESH_TOKEN_PRIVATE_KEY, 
                    { expiresIn: "30d" }
                );

                // jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY, function (err, data) {
                //     console.log(err, data);
                // })
                // jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY, function (err, data) {
                //     console.log(err, data);
                // })
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