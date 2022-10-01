import config from "../config/config";
const crypto = require('crypto');

export const getRandom = (min:number, max:number) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

export const signatureVerify = (signature:string, payload:any) => {
    const secret = config.auth.signSecretKey
    const data = JSON.stringify(payload)
    let hash = crypto.createHmac('sha256', secret);
    hash = hash.update(data).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
