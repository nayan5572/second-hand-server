import nodemailer from 'nodemailer';;
import { loadEmailTemplate } from './loadEmailTemplate';

export const sendEmail = async (to: string, subject: string, templateName: string, replacements: { [key: string]: string }) => {
    const htmlContent = loadEmailTemplate(templateName, replacements);


    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'web.moniruzzaman1@gmail.com',
            pass: 'vaaj rsoe mppc elde',
        },
    });

    const mailOptions = {
        from: 'web.moniruzzaman1@gmail.com',
        to,
        subject: subject,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};
