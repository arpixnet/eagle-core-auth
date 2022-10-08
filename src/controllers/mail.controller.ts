import nodemailer from "nodemailer";
import config from "../config/config";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { config as awsConf, SES } from "aws-sdk";

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

const transportAWS = () => {
    awsConf.update({
        accessKeyId: config.aws.email_access_key,
        secretAccessKey: config.aws.email_secret_key,
        region: config.aws.email_region
    });

    return nodemailer.createTransport({
        SES: new SES({
            apiVersion: '2010-12-01'
        })
    });
}

const sendEmail = async (contentSendMail:IEmail) => {
    let transporter:any;

    switch (config.email.config.service) {
        case 'Gmail':
            transporter = nodemailer.createTransport(gmailServer)
        break;
        case 'SMTP':
            transporter = nodemailer.createTransport(smtpServer)
        break;
        case 'AWS':
            transporter = transportAWS()
        break;
    }

    await transporter.sendMail(contentSendMail).catch((err:any) => {
        console.error(err);
    })
}

export {
    IEmail,
    sendEmail
}
