import nodemailer from "nodemailer";
import config from "../config/config";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface IEmail {
    from:string,
    to:string,
    subject:string,
    text?:string,
    html?:string,
}

const smtpServer = {
    service: config.email.config.service,
    host: config.email.config.host,
    port: config.email.config.port,
    secure: config.email.config.secure,
    auth: {
        user: config.email.config.auth.user,
        pass: config.email.config.auth.pass
    }
}

const gmailServer:SMTPTransport.Options = {
    host: config.email.config.host,
    port: config.email.config.port,
    secure: config.email.config.secure,
    auth: {
        type: 'OAuth2',
        user: config.email.config.auth.user,
        clientId: config.email.config.auth.clientId,
        clientSecret: config.email.config.auth.clientSecret,
        refreshToken: config.email.config.auth.refreshToken,
        accessToken: config.email.config.auth.accessToken,
    }
}

const sendEmail = (contentSendMail:IEmail) => {
    let transporter = nodemailer.createTransport((config.email.config.service == 'Gmail') ? gmailServer : smtpServer); 
    transporter.sendMail(contentSendMail).catch(err => {
        console.error(err);
    })
}

export {
    IEmail,
    sendEmail
}
