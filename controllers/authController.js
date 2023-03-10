require('dotenv').config();
const { Op } = require("sequelize");
const { validationResult } = require('express-validator');
const { success, error, validation } = require('../helpers/responseApi');
const { randomString, expiredDateByAddHour } = require('../helpers/common');
const User = require('../database/models').User;
const Role = require('../database/models').Role;
const Verification = require('../database/models').Verification;
const jwt = require('jsonwebtoken');
const mail = require('../config/mail');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(422).json(validation(errors.array())); }
    const { email, password, fullname, phone } = req.body;
    console.log(req);
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        })

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
                role_name: 'admin'
            }
        })
        if (!role) {
            res.status(500).json(error('Server error', res.statusCode));
        }
        const newUser = await User.create({
            email: email,
            password: password,
            fullname: fullname,
            phone: phone,
            role_id: role.id
        })

        const token = randomString(50);
        await Verification.create({
            user_id: newUser.id,
            token: token,
            token_type: 'REGISTER_ACCOUNT',
            expiredAt: expiredDateByAddHour(1)
        });

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

    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) return res.status(401).json(error('Authentication failed. User not found.', res.statusCode));

        if (user.verified === false) return res.status(401).json(error('Authentication failed. User not verified.', res.statusCode));

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
    } catch(err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
}

exports.getAuthenticatedUser = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        })

        if (!user) {
          return res.status(422).json(validation({ msg: 'User not found!' }));
        }
  
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

exports.verification = async (req, res) => {
    const { token } = req.params;

    try {
        const verification = await Verification.findOne({
            where: {
                token: token,
                active: true
            }
        })

        if (!verification) return res.status(404).json(error('No verification data found', res.statusCode));

        const dateNow = new Date();
        if (dateNow > verification.expiredAt) { 
            verification.active = false;
            await verification.save();
            return res.status(404).json(error('Verification token was expired', res.statusCode))
        };

        await User.update({
            verified: true,
            verifiedAt: new Date()
        },{
            where: { 
                id: verification.user_id 
            }
        })

        verification.active = false;
        await verification.save();

        res.status(200).json(success('Your successfully verificating your account', { verified: true }, res.statusCode))

    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }

    return false;
}

exports.resendVerification = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(422).json(validation([{ msg: 'Email is required' }]));
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        if (!user) return res.status(404).json(error('Email not found', res.statusCode));

        if (user.verified === true) return res.status(422).json(validation([{ msg: 'Account is verified' }]));

        const verification = await Verification.findOne({
            where: {
                user_id: user.id,
                active: true
            }
        })
        if (verification) return res.status(404).json(error('Please try again later', res.statusCode));

        const token = randomString(50);
        await Verification.create({
            user_id: user.id,
            token: token,
            token_type: 'REGISTER_ACCOUNT',
            expiredAt: expiredDateByAddHour(1)
        });

        await mail.sendConfirmationEmail(
            user.fullname,
            user.email,
            token,
        );

        res.status(200).json(success('Verification has been sent', res.statusCode))

    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
}

exports.forgot = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(422).json(validation([{ msg: 'Email is required' }]));
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        if (!user) return res.status(404).json(error('Email not found', res.statusCode));

        const dateNow = new Date();
        const verification = await Verification.findOne({
            where: {
                user_id: user.id,
                active: true,
                expiredAt: {
                    [Op.gt]: dateNow
                }
            }
        })
        if (verification) return res.status(404).json(error('Please try again later', res.statusCode));

        const token = randomString(50);
        await Verification.create({
            user_id: user.id,
            token: token,
            token_type: 'FORGOT_PASSWORD',
            expiredAt: expiredDateByAddHour(1)
        });

        await mail.sendResetPassword(
            email,
            token,
        );

        res.status(200).json(success('Forgot Password verification has been sent', res.statusCode))
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
}

exports.reset = async (req, res) => {
    const { password } = req.body;
    if (!password) { return res.status(422).json(validation([{ msg: 'Password is required' }])); }
    const { token } = req.params;
    if (!token) { return res.status(422).json(validation([{ msg: 'Token is required' }])); }

    try {
        const verification = await Verification.findOne({
            where: {
                token: token,
                active: true
            }
        })

        if (!verification) return res.status(404).json(error('No verification data found', res.statusCode));

        const dateNow = new Date();
        if (dateNow > verification.expiredAt) { 
            verification.active = false;
            await verification.save();
            return res.status(404).json(error('Verificatiion token was expired', res.statusCode)) 
        };

        await User.update({
            password: password
        },{
            where: { 
                id: verification.user_id,
            },
            individualHooks: true
        })

        verification.active = false;
        await verification.save();

        res.status(200).json(success('Password has been update', res.statusCode))
    } catch (error) {
        console.error(err.message);
        res.status(500).json(error('Server error', res.statusCode));
    }
}