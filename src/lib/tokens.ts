import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user";
import config from "../config/config";
import bcrypt from "bcrypt";
import crypto from "crypto";

const pathToPrivKey = path.join(__dirname, '../keys', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');
const pathToPubKey = path.join(__dirname, '../keys', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

const createToken = (user:IUser) => {
    const customClaims = {
        'x-hasura-default-role': "user",
        'x-hasura-allowed-roles': user.roles,
        'x-hasura-user-id': user.id,
        'x-hasura-user-email': user.email
    };
    return jwt.sign({ id: user.id, email: user.email, "https://hasura.io/jwt/claims": customClaims }, PRIV_KEY, {
        expiresIn: parseInt(config.tokens.connect.toString()), 
        algorithm: 'RS256'
    });
}

const createRefreshToken = (user: IUser, refresh_token: string) => {
    return jwt.sign({ id: user.id, refresh_token: refresh_token }, config.jwtSecret, {
        expiresIn: parseInt(config.tokens.refresh.toString())
    });
}

const verifyToken = (token: string) => {
    return jwt.verify(token, PUB_KEY, { algorithms: ['RS256'] }, (err, payload) => {
        if (err?.name === 'TokenExpiredError') return null;
        if (err?.name === 'JsonWebTokenError') return null;
        if (err === null) return payload;
        return null;
    });
}

const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.jwtSecret, (err, payload) => {
        if (err?.name === 'TokenExpiredError') return {error: 'TokenExpired'};
        if (err?.name === 'JsonWebTokenError') return {error: 'TokenError'};
        if (err === null) return payload;
        return null;
    });
}

const createHash = async () => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(crypto.createHash('sha1').digest('hex'), salt);
}

export {
    createToken,
    verifyToken,
    createHash,
    createRefreshToken,
    verifyRefreshToken
}
