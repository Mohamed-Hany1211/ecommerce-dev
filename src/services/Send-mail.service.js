import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
const sendEmailService = async ({
    to = '', // 'email1' or 'email1,email2,email3'
    subject = 'no-reply',
    message = '<h1>no-message</h1>',
    attachments = []
}) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // alternative host => smtp.gmail.com
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: `"Google dev Team" <${process.env.EMAIL}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        html : message, // html body
        attachments
    });
    return info.accepted.length? true:false;
}

export default sendEmailService;