import crypto from "crypto";

export interface IUser extends Document {
    id?: string;
    email: string;
    password?: string;
    salt?: string;
    username?: string;
    email_verified?: boolean;
    provider?: string;
    photo_url?: string;
    disabled?: boolean;
    last_login_at?: string;
    refresh_token?: string;
    created_at?: string;
    updated_at?: string;
    roles?: [string?];
    email_verification_code?: string;
    email_verification_expiration?: number;
    reset_password_code?: string;
    reset_password_expiration?: string;
    social_id?: string;
    role?: string;
};

export const encryptPassword = function(password: string) {
    const salt: string = crypto.randomBytes(32).toString('hex');
    const hash: string = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
};

export const cureUser = function(user: IUser) {
    let email = user.email;
    let password = user.password;
    let username = (user.username) ? user.username : null;
    let salt = '';
    email = email.toLowerCase().trim();
    if(username) username = username.toLowerCase().trim();
    if(password) {
        const combined =  encryptPassword(password);
        password = combined.hash;
        salt = combined.salt;
    }
    return { email, password, salt, username };
}

export const comparePassword = function(password: string, hash: string = '', salt: string = ''): Boolean {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
};

export const clearData = (user: IUser) => {
    delete user.password;
    delete user.salt;
    delete user.disabled;
    delete user.last_login_at;
    delete user.refresh_token;
    delete user.created_at;
    delete user.updated_at;
    delete user.roles;
    delete user.email_verification_code;
    delete user.email_verification_expiration;
    delete user.reset_password_code;
    delete user.reset_password_expiration;
    delete user.social_id;
    return user;
}
