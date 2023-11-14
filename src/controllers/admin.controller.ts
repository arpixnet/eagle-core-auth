import { Request, Response } from "express";
import { msgErrors } from "../helpers/status";
import { passwordValidation, emailValidation } from '../lib/joi'
import { createToken, createHash, createRefreshToken, verifyToken } from "../lib/tokens";
import { User } from "../controllers/user.controller";
import db from "../database/query";
import { IUser, cureUser, clearData } from "../models/user";

import { startSendEmail } from "../controllers/mail.controller";

const createAdminUser = async (req: Request, res: Response): Promise<Response> => {
    const userId:string = req.body.user_id;
    const userLogged:any = req.user ?? null;

    if (!req.body.email || !req.body.password) {
        return res.status(msgErrors.NOT_EMAIL_OR_PASSWORD.error.code).json(msgErrors.NOT_EMAIL_OR_PASSWORD);
    }

    if (!req.body.role) {
        return res.status(msgErrors.NOT_ROLE.error.code).json(msgErrors.NOT_ROLE);
    }

    const e1 = emailValidation({ email: req.body.email }); // Validation with Joi
    if (e1.error) return res.status(400).json({error: {message:e1.error.message, code: 400}});
    const e2 = passwordValidation({ newPassword: req.body.password }); // Validation with Joi
    if (e2.error) return res.status(400).json({error: {message:e2.error.message, code: 400}});

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
        email_verified: true
    };

    try {
        // Begin the transaction
        await db.query('BEGIN', '');
        const { rows } = await User.insertUser(values);
        let user: IUser = rows[0];

        const roles = await User.insertUserRole(user.id, req.body.role);

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

        // Commit the transaction
        await db.query('COMMIT', '');
        payload.user = clearData(user)

        startSendEmail('register', user.email, { user }, {});
        return res.status(200).send(payload);
    } catch (err:any) {
        await db.query('ROLLBACK', '');
        if (err.routine === '_bt_check_unique') {
            return res.status(msgErrors.EMAIL_EXISTS.error.code).send(msgErrors.EMAIL_EXISTS);
        }
        return res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
    }
}

export {
    createAdminUser
}