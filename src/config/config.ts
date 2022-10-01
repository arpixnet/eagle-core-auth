import dotenv from 'dotenv';
dotenv.config();

export default {
    db: {
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_DATA_BASE || "postgres"
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || "arpixsecretkey",
        jwtAlgorithm: process.env.JWT_ALGORITHM || "RS512",
        passwdAlgorithm: process.env.PASSWD_ALGORITHM || "sha512",
        lambdaCode: process.env.LAMBDA_CODE || "hasura_claim",
        allowRegistration: (process.env.ALLOW_REGISTRATION) ? (process.env.ALLOW_REGISTRATION === "true") : true,
        passwordMin: parseInt(process.env.PASSWORD_MIN || "6"),
        passwordStrong: (process.env.PASSWORD_STRONG) ? (process.env.PASSWORD_STRONG === "true") : true,
        loginAfterRegister: (process.env.LOGIN_AFTER_REGISTER) ? (process.env.LOGIN_AFTER_REGISTER === "true") : false,
        emailVerification: (process.env.EMAIL_VERIFICATION) ? (process.env.EMAIL_VERIFICATION === "true") : true,
        signSecretKey: process.env.SIGN_SECRET_KEY || 'xx'
    },
    tokens: {
        connect: parseInt(process.env.CONNECT_TOKEN_LIFE || "900"),
        refresh: parseInt(process.env.REFRESH_TOKEN_LIFE || "31536000"),
        secure: (process.env.SECURE_TOKEN === "true")
    },
    email: {
        emailVerificationSubject: process.env.EMAIL_VERIFICATION_SUBJECT || "Verify your email",
        resetPasswordSubject: process.env.RESET_PASSWORD_SUBJECT || "Reset your password",
        from: process.env.EMAIL_FROM || "",
        config: {
            service: process.env.EMAIL_SERVICE || "SMTP",
            host: process.env.EMAIL_HOST || "smtp.ethereal.email",
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: (process.env.EMAIL_SECURE === "true"),
            auth: {
                user: process.env.EMAIL_AUTH_USER || "",
                pass: process.env.EMAIL_AUTH_PASSWORD || "",
                clientId: process.env.CLIENT_ID || "",
                clientSecret: process.env.CLIENT_SECRET || "",
                refreshToken: process.env.REFRESH_TOKEN || "",
                accessToken: process.env.ACCESS_TOKEN || ""
            }
        }
    },
    social : {
        facebookAppId: process.env.FACEBOOK_APP_ID || "xx",
        facebookAppSecret: process.env.FACEBOOK_APP_SECRET || "xx",
        googleAppId: process.env.CLIENT_ID || "xx",
        googleAppSecret: process.env.CLIENT_SECRET || "xx",
        githubAppId: process.env.GITHUB_APP_ID || "xx",
        githubAppSecret: process.env.GITHUB_APP_SECRET || "xx",
        githubUrlToken: process.env.GITHUB_URL_TOKEN || "https://github.com/login/oauth/access_token",
        bitbucketAppId: process.env.BITBUCKET_APP_ID || "xx",
        bitbucketAppSecret: process.env.BITBUCKET_APP_SECRET || "xx"
    }
};
