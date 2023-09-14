import path from "path";
import fs from "fs";
import jwt, { Algorithm } from "jsonwebtoken";
import { IUser } from "../models/user";
import { ILambdas } from "../models/lambdas";
import config from "../config/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Lambda } from '../controllers/lambda.comtroller'

const pathToPrivKey = path.join(__dirname, '../keys', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');
const pathToPubKey = path.join(__dirname, '../keys', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

const createToken = async (user:IUser, withoutExpiration:boolean = false) => {
    const lambda:ILambdas|null = await Lambda.findByCode(config.auth.lambdaCode)
    let tokenPayload:any = {
        id: user.id,
        email: user.email
    }

    if (lambda && lambda.hasOwnProperty('function')) {
        lambda.function = `${lambda.function.trim()}\n` + ' return populate(jwt, user)';
        const customClaimsFunctions = new Function('jwt', 'user', lambda.function);
        const customClaims = customClaimsFunctions({}, user);
        const index = Object.keys(customClaims);
        tokenPayload[index[0]] = customClaims[index[0]];
    }

    if (withoutExpiration) {
        return jwt.sign(tokenPayload, PRIV_KEY, {
            expiresIn: parseInt(config.auth.tokenWithoutExpirationTime.toString()),
            algorithm: config.auth.jwtAlgorithm as Algorithm
        });
    }

    return jwt.sign(tokenPayload, PRIV_KEY, {
        expiresIn: parseInt(config.tokens.connect.toString()), 
        algorithm: config.auth.jwtAlgorithm as Algorithm
    });
}

const createRefreshToken = (user: IUser, refresh_token: string) => {
    return jwt.sign({ id: user.id, refresh_token: refresh_token }, config.auth.jwtSecret, {
        expiresIn: parseInt(config.tokens.refresh.toString())
    });
}

const verifyToken = (token: string) => {
    return jwt.verify(token, PUB_KEY, { algorithms: [config.auth.jwtAlgorithm as Algorithm] }, (err, payload) => {
        if (err?.name === 'TokenExpiredError') return null;
        if (err?.name === 'JsonWebTokenError') return null;
        if (err === null) return payload;
        return null;
    });
}

const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.auth.jwtSecret, (err, payload) => {
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
