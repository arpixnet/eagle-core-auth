import dotenv from 'dotenv';
dotenv.config();

export default {
    jwtSecret: process.env.JWT_SECRET || 'arpixsecretkey',
    DB: {
        USER: process.env.DB_USER || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || 'postgres',
        HOST: process.env.DB_HOST || '127.0.0.1',
        PORT: parseInt(process.env.DB_PORT || '5432'),
        DATABASE: process.env.DB_DATA_BASE || 'postgres'
    },
    tokens: {
        connect: process.env.CONNECT_TOKEN_LIFE || 900,
        refresh: process.env.REFRESH_TOKEN_LIFE || 31536000,
        secure: (process.env.SECURE_TOKEN === 'true')
    },
    email: {
        emailVerificationSubject: process.env.EMAIL_VERIFICATION_SUBJECT || 'Verify your email',
        resetPasswordSubject: process.env.RESET_PASSWORD_SUBJECT || 'Reset your password',
        from: process.env.EMAIL_FROM || '',
        config: {
            service: process.env.EMAIL_SERVICE || 'SMTP',
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: (process.env.EMAIL_SECURE === 'true'),
            auth: {
                user: process.env.EMAIL_AUTH_USER || '',
                pass: process.env.EMAIL_AUTH_PASSWORD || '',
                clientId: process.env.CLIENT_ID || '',
                clientSecret: process.env.CLIENT_SECRET || '',
                refreshToken: process.env.REFRESH_TOKEN || '',
                accessToken: process.env.ACCESS_TOKEN || ''
            }
        }
    },
    social : {
        facebook_app_id: process.env.FACEBOOK_APP_ID || 'xx',
        facebook_app_secret: process.env.FACEBOOK_APP_SECRET || 'xx',
        google_app_id: process.env.CLIENT_ID || 'xx',
        google_app_secret: process.env.CLIENT_SECRET || 'xx'
    }
};
