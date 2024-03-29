import nodemailer from "nodemailer";
import config from "../config/config";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import hogan from "hogan.js";
import fs from "fs";
import path from "path";

let aws = require("@aws-sdk/client-ses");

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
    const ses = new aws.SES({
        apiVersion: "2010-12-01",
        region: config.aws.email_region,
        credentials: {
            accessKeyId: config.aws.email_access_key,
            secretAccessKey: config.aws.email_secret_key
        }
    });

    return nodemailer.createTransport({
        SES: { ses, aws },
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

const startSendEmail = (template:string, email:string, payloadContent:any, payloadSubject:any = {}) => {
    try {
        const pathToContent = path.join(__dirname, `../views/${template}/content.hjs`);
        const pathToSubject = path.join(__dirname, `../views/${template}/subject.hjs`);
        const content = fs.readFileSync(pathToContent, 'utf8');
        const subject = fs.readFileSync(pathToSubject, 'utf8');
        let compiledContent = hogan.compile(content);
        let compiledSubject = hogan.compile(subject);

        let payload:IEmail = {
            from: config.email.from,
            to: email,
            subject: compiledSubject.render(payloadSubject),
            html: compiledContent.render(payloadContent)
        }
        sendEmail(payload);
    } catch (err) {
        console.error(err);
    }
}

export {
    IEmail,
    sendEmail,
    startSendEmail
}
