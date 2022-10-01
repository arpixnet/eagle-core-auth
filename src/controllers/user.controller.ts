import db from "../database/query";
import { IUser } from "../models/user";
import moment from "moment";

export class User {
    constructor() {}

    // Find User by ID
    static async findById(id: string): Promise<IUser | null> {
        const userQuery = 'SELECT * FROM auth WHERE id = $1';
        const rolesQuery = 'SELECT r.id, r.code, r.name, ar.main FROM role r INNER JOIN auth_role ar ON ar.role_code = r.code WHERE ar.auth_id = $1';
        try {
            const { rows } = await db.query(userQuery, [id]);
            let user:IUser = (rows[0]) ? rows[0] : null;
            if (user) {
                user.roles = [];
                const { rows } = await db.query(rolesQuery, [id]);
                rows.forEach((role:any) => {
                    user.roles?.push(role);
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

    // Find User by email or username
    static async findByEmailOrUsername(email: string, username: string = ''): Promise<IUser | null> {
        const userQuery = 'SELECT * FROM auth WHERE email = $1 OR username = $2';
        const rolesQuery = 'SELECT r.id, r.code, r.name, ar.main FROM role r INNER JOIN auth_role ar ON ar.role_code = r.code WHERE ar.auth_id = $1';
        try {
            const { rows } = await db.query(userQuery, [email, username]);
            let user:IUser = (rows[0]) ? rows[0] : null;
            if (user) {
                user.roles = [];
                const { rows } = await db.query(rolesQuery, [user.id]);
                rows.forEach((role:any) => {
                    user.roles?.push(role);
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

    // Update User's email
    static async updateEmail(id: string | undefined, newEmail: string): Promise<IUser | null> {
        const updateUserQuery = `UPDATE auth SET email = $2 WHERE id = $1`;
        const row = await db.query(updateUserQuery, [id, newEmail]);
        return (row.rowCount) ? row.rowCount : null;
    }

    // Update User
    static async updateUser(id: string | undefined, newData: any): Promise<IUser | null> {
        let set = '';
        const n = Object.keys(newData).length
        
        Object.keys(newData).forEach((key: string, index: number) => {
            set += `${key} = '${newData[key]}'`;
            if (index < n - 1 && n > 1) set += ', ';
        })

        const updateUserQuery = `UPDATE auth SET ${set} WHERE id = $1`;
        const row = await db.query(updateUserQuery, [id]);
        return (row.rowCount) ? row.rowCount : null;
    }

    // Update User's password
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

    // Delete User
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

    // Add Role default to User
    static async insertUserRoleDefault(id: string | undefined) {
        const insertUserRoleQuery = `INSERT INTO auth_role (
            SELECT $1 AS auth_id, code 
            FROM role
            WHERE by_default = true
        )`;
        await db.query(insertUserRoleQuery, [id]);
    }

    // Update email verification code
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

    // Update Reset Password Code
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

    // Create User
    static async insertUser(values:any):Promise<any> {
        let i = 1;
        let queryParameters = '';
        let queryValues = '';
        let parameters = Object.values(values);
        
        for (let index in values){
            queryParameters += `${index}${(i < parameters.length) ? ', ' : ''}`;
            queryValues += `$${i}${(i < parameters.length) ? ', ' : ''}`;
            i++;
        }

        const createUserQuery = `INSERT INTO
        auth(${queryParameters})
        VALUES(${queryValues})
        returning *`;
        return await db.query(createUserQuery, parameters);
    }

    // Update refresh_token and last_login after login
    static async updateSignIn(values:any):Promise<any> {
        const updateUserQuery = `UPDATE auth SET last_login_at = $2, refresh_token = $3 WHERE id = $1`;
        return await db.query(updateUserQuery, values);
    }
}
