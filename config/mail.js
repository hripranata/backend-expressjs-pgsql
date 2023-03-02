const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

module.exports.sendConfirmationEmail = (name, email, token) => {
  transport.sendMail({
    from: `no-reply@${process.env.APP_NAME}`,
    to: email,
    subject: 'Please confirm your account',
    html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=${process.env.CLIENT_ORIGIN}/verify/${token}> Click here</a>
        </div>`,
  }).catch((err) => console.log(err));
};

module.exports.sendResetPassword = (email, token) => {
  transport.sendMail({
    from: `no-reply@${process.env.APP_NAME}`,
    to: email,
    subject: 'Reset Password',
    html: `<h1>Reset Password</h1>
    <p>To reset your password please visit the following address</p>
    <a href=${process.env.CLIENT_ORIGIN}/reset/${token}> Reset Password</a>
    </div>`,
  }).catch((err) => console.log(err));
};
