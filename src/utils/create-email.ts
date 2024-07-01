import expressAsyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import configKey from '../configs/configkeys';
import AppError from './AppError';
import HttpStatus from '../types/constants/http-statuscodes';


const sendEmail = async (email: string, subject: string, url: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: configKey().HOST,
            service: configKey().SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: configKey().MAIL,
                pass: configKey().PASS
            }
        });
        await transporter.sendMail({
            from: configKey().MAIL,
            to: email,
            subject: subject,
            text: url,
            html:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Awesome Email</title>
</head>
<body>
    <h1>Hello User!!! This is from callquaint</h1>
<a href="${url}">
  <button>Click here to verify</button>
</a>
<p>Thank you for reading!</p>
</body>
</html>`
        })
        console.log('email send successfully');
    } catch (error) {
        console.log('email send failed')
        throw new AppError('email send failed',HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export default sendEmail;