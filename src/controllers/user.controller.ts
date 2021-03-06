import db from "../database/query";
import { IUser } from "../models/user";
import moment from "moment";

export class User {
    constructor() {}

    static async findById(id: string): Promise<IUser | null> {
        const userQuery = 'SELECT * FROM auth WHERE id = $1';
        const rolesQuery = 'SELECT r.id, r.name FROM role r INNER JOIN auth_role ar ON ar.role_id = r.id WHERE ar.auth_id = $1';
        try {
            const { rows } = await db.query(userQuery, [id]);
            let user:IUser = (rows[0]) ? rows[0] : null;
            if (user) {
                user.roles = [];
                const { rows } = await db.query(rolesQuery, [id]);
                rows.forEach((role:any) => {
                    user.roles?.push(role.name);
                });
                return user;
            } else {
                return null
            }
        } catch (err) {
            console.error(err);
            return null
        }
    }

    static async findByEmailOrUsername(email: string, username: string = ''): Promise<IUser | null> {
        const userQuery = 'SELECT * FROM auth WHERE email = $1 OR username = $2';
        const rolesQuery = 'SELECT r.id, r.name FROM role r INNER JOIN auth_role ar ON ar.role_id = r.id WHERE ar.auth_id = $1';
        try {
            const { rows } = await db.query(userQuery, [email, username]);
            let user:IUser = (rows[0]) ? rows[0] : null;
            if (user) {
                user.roles = [];
                const { rows } = await db.query(rolesQuery, [user.id]);
                rows.forEach((role:any) => {
                    user.roles?.push(role.name);
                });
                return user;
            } else {
                return null
            }
        } catch (err) {
            console.error(err);
            return null
        }
    }

    static async updateEmail(id: string | undefined, newEmail: string): Promise<IUser | null> {
        const updateUserQuery = `UPDATE auth SET email = $2 WHERE id = $1`;
        const row = await db.query(updateUserQuery, [id, newEmail]);
        return (row.rowCount) ? row.rowCount : null;
    }

    static async updatePassword(id: string | undefined, newPassword: string, newSalt: string): Promise<IUser | null> {
        const updateUserQuery = `UPDATE auth SET password = $2, salt = $3 WHERE id = $1`;
        try {
            const row = await db.query(updateUserQuery, [id, newPassword, newSalt]);
            return (row.rowCount) ? row.rowCount : null;
        } catch (err) {
            console.error(err);
            return null
        }
    }

    static async delete(id: string): Promise<IUser | null> {
        const deleteUserQuery = `DELETE FROM auth WHERE id = $1`;
        try {
            const row = await db.query(deleteUserQuery, [id]);
            return (row.rowCount) ? row.rowCount : null;
        } catch (err) {
            console.error(err);
            return null
        }
    }

    static async insertUserRole(id: string | undefined) {
        const insertUserRoleQuery = `INSERT INTO auth_role (
            SELECT $1 AS auth_id, id 
            FROM role
            WHERE name = 'user'
        )`;
        await db.query(insertUserRoleQuery, [id]);
    }

    static async updateEmailVerification(id: string | undefined, code: string): Promise<IUser | null> {
        const expires = moment(Date.now()).add(1, 'day').unix();
        const updateUserQuery = `UPDATE auth SET email_verification_code = $2, email_verification_expiration = $3 WHERE id = $1`;
        try {
            const row = await db.query(updateUserQuery, [id, code, expires]);
            return (row.rowCount) ? row.rowCount : null;
        } catch (err) {
            console.error(err);
            return null
        }
    }

    // Verify
    static async updateEmailVerified(id: string | undefined, status: boolean): Promise<IUser | null> {
        const updateUserQuery = `UPDATE auth SET email_verified = $2 WHERE id = $1`;
        try {
            const row = await db.query(updateUserQuery, [id, status]);
            return (row.rowCount) ? row.rowCount : null;
        } catch (err) {
            console.error(err);
            return null
        }
    }

    static async updateResetPasswordCode(id: string | undefined, code: string): Promise<IUser | null> {
        let expires = null;
        if (code) expires = moment(Date.now()).add(1, 'day').unix();
        const updateUserQuery = `UPDATE auth SET reset_password_code = $2, reset_password_expiration = $3 WHERE id = $1`;
        try {
            const row = await db.query(updateUserQuery, [id, code, expires]);
            return (row.rowCount) ? row.rowCount : null;
        } catch (err) {
            console.error(err);
            return null
        }
    }

    static async insertUser(values:IUser):Promise<any> {
        const createUserQuery = `INSERT INTO
        auth(email, password, salt, username, refresh_token, provider, social_id, photo_url, email_verified)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning *`;
        return await db.query(createUserQuery, values);
    }

    static async updateSignIn(values:any):Promise<any> {
        const updateUserQuery = `UPDATE auth SET last_login_at = $2, refresh_token = $3 WHERE id = $1`;
        return await db.query(updateUserQuery, values);
    }
}
