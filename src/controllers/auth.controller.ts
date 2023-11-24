import { Request, Response } from "express";
import { IUser, cureUser, clearData, comparePassword, encryptPassword } from "../models/user";
import { User } from "../controllers/user.controller";
import { msgErrors } from "../helpers/status";
import db from "../database/query";
import moment from 'moment';
import { createToken, createHash, createRefreshToken, verifyToken, verifyRefreshToken } from "../lib/tokens";
import { signinValidation, signupValidation, emailValidation, passwordValidation, userValidation } from '../lib/joi'
import config from "../config/config";
import { getRandom } from "../lib/tools";
import hogan from "hogan.js";
import fs from "fs";
import path from "path";
import { sendEmail, IEmail, startSendEmail } from "../controllers/mail.controller";

// *************************** Methods ***************************

// Login
const login = async (user:IUser, req: Request, res: Response) => {
    try {
        if (user.disabled) {
            return res.status(msgErrors.USER_DISABLED.error.code).send(msgErrors.USER_DISABLED);
        }
        if (config.auth.emailVerification && !user.email_verified) {
            return res.status(msgErrors.EMAIL_NOT_VERIFIED.error.code).send(msgErrors.EMAIL_NOT_VERIFIED);
        }

        const last_login_at = moment(new Date()).format('YYYY-MM-DDTHH:mm:ssZ');

        // A hash is generated to verify the refresh token
        let refresh_token: string = ''
        if (!user.refresh_token) refresh_token = await createHash();
        else refresh_token = user.refresh_token;

        const token = await createToken(user); // Token is generated
        const verify:any = verifyToken(token); // The token is verified to evaluate a possible error and to extract the expiration date
        if (!verify) return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
        const refreshToken = createRefreshToken(user, refresh_token); // Refresh token is generated

        // Begin the transaction
        await db.query('BEGIN', '');
        await User.updateSignIn([
            user.id,
            last_login_at,
            refresh_token
        ]);
        if (config.tokens.refreshOnCookie) {
            res.cookie('eagleRT', refreshToken, {
                httpOnly: true,
                secure: config.tokens.secure,
                sameSite: 'none',
                expires: new Date(Date.now() + parseInt(config.tokens.refresh.toString())),
            });
        }
        // Commit the transaction
        await db.query('COMMIT', '');

        let payload:any = {
            access_token: token,
            access_token_expires: new Date(verify.exp * 1000),
            user: clearData(user), 
            code: 200,
            message: 'success'
        }

        if (!config.tokens.refreshOnCookie) {
            payload.refresh_token = refreshToken;
            payload.refresh_token_expires = new Date(Date.now() + parseInt(config.tokens.refresh.toString()))
        }

        return res.status(200).send(payload);
    } catch (err) {
        await db.query('ROLLBACK', '');
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Register
const register = async (values:any, social:any, req:Request, res:Response) => {
    try {
        // Begin the transaction
        await db.query('BEGIN', '');
        const { rows } = await User.insertUser(values);
        let user: IUser = rows[0];
        let token: any;
        let verify: any;

        const roles = await User.insertUserRoleDefault(user.id);
        if (roles.rows.length > 0) {
            let urole:any = []
            roles.rows.forEach((role:any) => {
                urole.push({
                    id: role.auth_id,
                    code: role.role_code,
                    main: role.main
                })
            });
            user.roles = urole
        }

        let payload:any = {
            code: 200,
            message: 'success'
        }

        if (config.auth.loginAfterRegister) {
            token = await createToken(user); // Token is generated
            verify = verifyToken(token); // The token is verified to evaluate a possible error and to extract the expiration date
            payload.access_token = token;
            payload.access_token_expires = new Date(verify.exp * 1000);
            const refreshToken = createRefreshToken(user, values[4]); // Refresh token is generated
            if (!verify) return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER); 
            if (config.tokens.refreshOnCookie) {
                res.cookie('eagleRT', refreshToken, {
                    httpOnly: true,
                    secure: config.tokens.secure,
                    sameSite: 'none',
                    expires: new Date(Date.now() + parseInt(config.tokens.refresh.toString())),
                });
            } else {
                payload.refresh_token = refreshToken;
                payload.refresh_token_expires = new Date(Date.now() + parseInt(config.tokens.refresh.toString()))
            }
        }
        // Commit the transaction
        await db.query('COMMIT', '');
        payload.user = clearData(user)

        if (values[5] != 'local') payload.social = social;

        startSendEmail('register', user.email, { user }, {})
        return res.status(200).send(payload);
    } catch (err:any) {
        await db.query('ROLLBACK', '');
        if (err.routine === '_bt_check_unique') {
            return res.status(msgErrors.EMAIL_EXISTS.error.code).send(msgErrors.EMAIL_EXISTS);
        }
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// *************************** End Points ***************************

// SignUp method
const signUp = async (req: Request, res: Response): Promise<Response> => {
    const referred = req.query.referred || null;
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(msgErrors.NOT_EMAIL_OR_PASSWORD.error.code).json(msgErrors.NOT_EMAIL_OR_PASSWORD);
        }

        if (!config.auth.allowRegistration) {
            return res.status(msgErrors.OPERATION_NOT_ALLOWED.error.code).json(msgErrors.OPERATION_NOT_ALLOWED);
        }
    
        const { error } = signupValidation(req.body); // Validation with Joi
        if (error) return res.status(400).json({error: {message:error.message, code: 400}});
        let { email, password, salt, username } = cureUser(req.body); // Curating user data
        const refresh_token = await createHash(); // A hash is generated to verify the refresh token
    
        const values: any = {
            email,
            password,
            salt,
            username,
            refresh_token,
            provider: 'local',
            social_id: null,
            photo_url: null,
            email_verified: false
        };

        if(referred) values.referred = referred
        return await register(values, null, req, res);
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
};

// SignIn method
const signIn = async (req: Request, res: Response): Promise<Response> => {
    if ((!req.body.email && !req.body.username) || !req.body.password) {
        return res.status(msgErrors.NOT_EMAIL_OR_PASSWORD.error.code).json(msgErrors.NOT_EMAIL_OR_PASSWORD);
    }

    const { error } = signinValidation(req.body); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    try {
        const user = await User.findByEmailOrUsername(req.body.email, req.body.username);
        if (!user) {
            return res.status(msgErrors.USER_NOT_FOUND.error.code).send(msgErrors.USER_NOT_FOUND);
        }
        const respCompare = comparePassword(req.body.password, user.password, user.salt);
        if (!respCompare) {
            return res.status(msgErrors.INVALID_PASSWORD.error.code).send(msgErrors.INVALID_PASSWORD);
        }
        return await login(user, req, res);
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
};

// Refresh method
const refresh = async (req: Request, res: Response): Promise<Response> => {
    let req_payload: any = ''

    if (config.tokens.refreshOnCookie) {
        const eagleRT = await req.cookies.eagleRT;
        if (!eagleRT) return res.status(msgErrors.INVALID_ID_TOKEN.error.code).json(msgErrors.INVALID_ID_TOKEN);
        req_payload = verifyRefreshToken(eagleRT);
    } else {
        req_payload = verifyRefreshToken(req.body.refresh_token);
    }

    if (!req_payload) {
        if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
        return res.status(msgErrors.INVALID_ID_TOKEN.error.code).json(msgErrors.INVALID_ID_TOKEN);
    }
    else if (req_payload?.error == 'TokenExpired') return res.status(msgErrors.TOKEN_EXPIRED.error.code).json(msgErrors.TOKEN_EXPIRED);
    else if (req_payload?.error == 'TokenError') return res.status(msgErrors.INVALID_ID_TOKEN.error.code).json(msgErrors.INVALID_ID_TOKEN);

    const {id, refresh_token} = req_payload;

    try {
        const user = await User.findById(id);
        if (!user) {
            if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
            return res.status(msgErrors.INVALID_ID_TOKEN.error.code).send(msgErrors.INVALID_ID_TOKEN);
        }
        if (user.refresh_token != refresh_token) {
            if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
            return res.status(msgErrors.INVALID_ID_TOKEN.error.code).send(msgErrors.INVALID_ID_TOKEN);
        }
        if (user.disabled) {
            if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
            return res.status(msgErrors.USER_DISABLED.error.code).send(msgErrors.USER_DISABLED);
        }

        const token = await createToken(user);
        const verify:any = verifyToken(token);
        if (!verify) return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);

        let payload: any = {
            access_token: token,
            access_token_expires: new Date(verify.exp * 1000),
            user: clearData(user), 
            message: 'success', 
            code: 200
        }

        return res.status(200).send(payload);
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
};

// Token Without Expiration method
const tokenWithoutExpiration = async (req: Request, res: Response): Promise<Response> => {
    const userId:string = req.body.user_id;
    const userLogged:any = req.user ?? null;
    
    if (!userId) {
        return res.status(msgErrors.USER_NOT_FOUND.error.code).json(msgErrors.USER_NOT_FOUND);
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(msgErrors.USER_NOT_FOUND.error.code).send(msgErrors.USER_NOT_FOUND);
        }
        if (user.disabled) {
            return res.status(msgErrors.USER_DISABLED.error.code).send(msgErrors.USER_DISABLED);
        }
        if (userLogged && userLogged.hasOwnProperty('roles') && userLogged.roles) {
            const hasAdminRole = userLogged.roles.some((role:any) => (role.code === 'admin' || role.code === 'manager'));
            if (!hasAdminRole) {
                return res.status(msgErrors.UNAUTHORIZED.error.code).json(msgErrors.UNAUTHORIZED);
            }
        }

        const token = await createToken(user, true);
        const verify:any = verifyToken(token);
        if (!verify) return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);

        let payload: any = {
            access_token: token,
            access_token_expires: new Date(verify.exp * 1000),
            user: clearData(user), 
            message: 'success', 
            code: 200
        }

        return res.status(200).send(payload);
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
};

// Change my email
const changeEmail = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.email) return res.status(msgErrors.INVALID_EMAIL.error.code).json(msgErrors.INVALID_EMAIL);

    const user: any = req.user;
    const newEmail: string = req.body.email.toLowerCase().trim();
    const password: string = req.body.password;

    const { error } = signinValidation(req.body); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    const respCompare = comparePassword(password, user.password, user.salt);
    if (!respCompare) return res.status(msgErrors.INVALID_PASSWORD.error.code).send(msgErrors.INVALID_PASSWORD);

    try {
        const updateUser = await User.updateEmail(user.id, newEmail);
        if (updateUser) {
            user.email = newEmail;
            const token = await createToken(user); // Token is generated
            const verify: any = verifyToken(token); // The token is verified to evaluate a possible error and to extract the expiration date
            if (!verify) return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);

            return res.status(200).send({
                access_token: token,
                access_token_expires: new Date(verify.exp * 1000),
                user: clearData(user), 
                code: 200,
                message: 'success'
            });
        } else {
            return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
        }
    } catch (err:any) {
        if (err.routine === '_bt_check_unique') {
            return res.status(msgErrors.EMAIL_EXISTS.error.code).send(msgErrors.EMAIL_EXISTS);
        }
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
};

// Change my password
const changePasswd = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.password || !req.body.newPassword) return res.status(msgErrors.INVALID_PASSWORD.error.code).json(msgErrors.INVALID_PASSWORD);

    const user: any = req.user;
    const password: string = req.body.password;
    const newPassword: string = req.body.newPassword;

    const { error } = passwordValidation({newPassword}); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    const respCompare = comparePassword(password, user.password, user.salt);
    if (!respCompare) return res.status(msgErrors.INVALID_PASSWORD.error.code).send(msgErrors.INVALID_PASSWORD);
    const { hash, salt } = encryptPassword(newPassword);

    try {
        const updatePasswd = await User.updatePassword(user.id, hash, salt);
        if (updatePasswd) {
            const token = await createToken(user); // Token is generated
            const verify: any = verifyToken(token); // The token is verified to evaluate a possible error and to extract the expiration date
            if (!verify) return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);

            return res.status(200).send({
                access_token: token,
                access_token_expires: new Date(verify.exp * 1000),
                user: clearData(user), 
                code: 200,
                message: 'success'
            });
        } else {
            return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
        }
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
} 

// Delete me
const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.password) return res.status(msgErrors.INVALID_PASSWORD.error.code).json(msgErrors.INVALID_PASSWORD);

    const user: any = req.user;
    const password: string = req.body.password;

    const respCompare = comparePassword(password, user.password, user.salt);
    if (!respCompare) return res.status(msgErrors.INVALID_PASSWORD.error.code).send(msgErrors.INVALID_PASSWORD);

    try {
        const delUser = await User.delete(user.id);
        if (delUser) {
            if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1})
            return res.status(200).send({message: 'success', code: 200});
        } else {
            return res.status(msgErrors.USER_NOT_FOUND.error.code).json(msgErrors.USER_NOT_FOUND);
        }
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Get my account
const account = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user: any = req.user;
        return res.status(200).send({
            user: clearData(user), 
            code: 200,
            message: 'success'
        });
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Logout method
const logout = async (req: Request, res: Response): Promise<Response> => {
    if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
    return res.status(200).send({message: 'success', code: 200});
}

// Get code for verify email
const emailVerification = async (req: Request, res: Response): Promise<Response> => {
    const email = req.body.email;

    if (!email) return res.status(msgErrors.INVALID_EMAIL.error.code).json(msgErrors.INVALID_EMAIL);

    const { error } = emailValidation({email}); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    try {
        const user = await User.findByEmailOrUsername(email);
        if (user) {
            const code = getRandom(123456, 999999);
            const updateCode = await User.updateEmailVerification(user.id, code.toString());
            if (updateCode) {
                startSendEmail('email-verification', email, {user, code, subject: 'email-verification'}, {})
            }
        }
        return res.status(200).send({message: 'success', code: 200});
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Confirm verification of email
const confirmVerification = async (req: Request, res: Response): Promise<Response> => {
    const email = req.body.email;
    const code = req.body.code;

    if (!email) return res.status(msgErrors.INVALID_EMAIL.error.code).json(msgErrors.INVALID_EMAIL);
    if (!code) return res.status(msgErrors.INVALID_OOB_CODE.error.code).json(msgErrors.INVALID_OOB_CODE);

    const { error } = emailValidation({email}); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    try {
        const user = await User.findByEmailOrUsername(email);
        const expires = moment(Date.now()).unix();
        const verification_time = (user?.email_verification_expiration) ? user?.email_verification_expiration : 0;

        if (verification_time <= expires) return res.status(msgErrors.EXPIRED_OOB_CODE.error.code).json(msgErrors.EXPIRED_OOB_CODE);

        if (user && user.email_verification_code == code) {
            if (user.disabled) {
                if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
                return res.status(msgErrors.USER_DISABLED.error.code).send(msgErrors.USER_DISABLED);
            }
            const updateEmailVerified = await User.updateEmailVerified(user.id, true);
            if (updateEmailVerified) {
                return res.status(200).send({message: 'success', code: 200, email, emailVerified: true});
            }
        }

        return res.status(200).send({message: 'success', code: 200, email, emailVerified: false});
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Get code for reset password
const resetPasswd = async (req: Request, res: Response): Promise<Response> => {
    const email = req.body.email;

    if (!email) return res.status(msgErrors.INVALID_EMAIL.error.code).json(msgErrors.INVALID_EMAIL);

    const { error } = emailValidation({email}); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    try {
        const user:IUser | null = await User.findByEmailOrUsername(email);
        if (user) {
            if (user.disabled) {
                if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
                return res.status(msgErrors.USER_DISABLED.error.code).send(msgErrors.USER_DISABLED);
            }
            const code = getRandom(123456, 999999);
            const updateCode = await User.updateResetPasswordCode(user.id, code.toString());
            if (updateCode) {
                startSendEmail('reset-password', email, {user, code, subject: 'reset-password'}, {})
            }
        }
        return res.status(200).send({message: 'success', code: 200});
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Confirm Reset Password
const confirmResetPasswd = async (req: Request, res: Response): Promise<Response> => {
    const email = req.body.email;
    const newPassword = req.body.password;
    const code = req.body.code;

    if (!newPassword) return res.status(msgErrors.INVALID_PASSWORD.error.code).json(msgErrors.INVALID_PASSWORD);
    if (!code) return res.status(msgErrors.INVALID_OOB_CODE.error.code).json(msgErrors.INVALID_OOB_CODE);

    const { error } = passwordValidation({newPassword}); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    try {
        const user:IUser | null = await User.findByEmailOrUsername(email);
        const expires = moment(Date.now()).unix();
        const verification_time = (user?.reset_password_expiration) ? user?.reset_password_expiration : 0;

        if (user) {
            if (verification_time <= expires) return res.status(msgErrors.EXPIRED_OOB_CODE.error.code).json(msgErrors.EXPIRED_OOB_CODE);
            if (user.disabled) {
                if (config.tokens.refreshOnCookie) res.cookie('eagleRT', '', {maxAge: -1});
                return res.status(msgErrors.USER_DISABLED.error.code).send(msgErrors.USER_DISABLED);
            }
            if (user.reset_password_code != code) return res.status(msgErrors.INVALID_OOB_CODE.error.code).send(msgErrors.INVALID_OOB_CODE);
            const { hash, salt } = encryptPassword(newPassword);

            await db.query('BEGIN', '');
            const updatePasswd = await User.updatePassword(user.id, hash, salt);
            await User.updateResetPasswordCode(user.id, '');
            await db.query('COMMIT', '');

            if (updatePasswd) {
                return res.status(200).send({
                    message: 'success',
                    code: 200,
                    email: user.email
                });
            } else {
                return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
            }
        }
        return res.status(msgErrors.USER_NOT_FOUND.error.code).json(msgErrors.USER_NOT_FOUND);
    } catch (err) {
        await db.query('ROLLBACK', '');
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Social signin (Facebook and Google)
const socialSignIn = async (req: Request, res: Response): Promise<Response> =>  {
    const profile: any = req.user;
    const referred = req.query.referred || null;
    try {
        const user:IUser | null = await User.findByEmailOrUsername(profile._json.email);
        if (user) {
            return login(user, req, res);
        } else {
            const provider = profile.provider;
            const social_id = profile.id;
            const social_json = profile._json;
            const email = social_json.email, password = '', salt = '', email_verified = true;
            let username = null
            let photo_url = null;
            const refresh_token = await createHash(); // A hash is generated to verify the refresh token

            if (provider == 'facebook') {
                if (social_json.picture.data.is_silhouette == false) photo_url = social_json.picture.data.url;
            } 
            else if (provider == 'google') photo_url = social_json.picture;
            else if (provider == 'github') {
                photo_url = social_json.avatar_url;
                username = social_json.login
            }
            else if (provider == 'bitbucket') {

            }

            const values:any = {
                email,
                password,
                salt,
                username,
                refresh_token,
                provider,
                social_id,
                photo_url,
                email_verified, 
                social_json
            };
            if(referred) values.referred = referred
            return register(values, social_json, req, res);
        }
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

// Update User
const updateUser = async (req: Request, res: Response): Promise<Response> => {
    const user: any = req.user;
    let data: any = { };

    if (req.body.hasOwnProperty('username')) req.body.username = req.body.username.trim().replace(/\s+/g, '_');

    const { error } = userValidation(req.body); // Validation with Joi
    if (error) return res.status(400).json({error: {message:error.message, code: 400}});

    Object.keys(req.body).forEach((key: string) => {
        data[key] = req.body[key];
    });

    try {
        const updateUser = (Object.keys(data).length > 0) ? await User.updateUser(user.id, data) : null;

        if (updateUser) {
            if (data.hasOwnProperty('username')) user.username = data.username;
            if (data.hasOwnProperty('photo_url')) user.photo_url = data.photo_url;
            if (data.hasOwnProperty('mobile')) user.mobile = data.mobile;
        }

        return res.status(200).send({
            user: clearData(user),
            code: 200,
            message: 'success'
        });
    } catch (err) {
        console.error(err);
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

export {
    signUp,
    signIn,
    refresh,
    tokenWithoutExpiration,
    changeEmail,
    changePasswd,
    deleteUser, 
    account, 
    logout,
    emailVerification,
    confirmVerification,
    resetPasswd,
    confirmResetPasswd,
    socialSignIn,
    updateUser
}
