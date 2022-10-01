import { signatureVerify } from "../lib/tools";
import { Request, Response } from "express";
import { msgErrors } from "../helpers/status";

export default (req:Request, res:Response, done:any) => {
    const signature = (req.headers.hasOwnProperty('authorization')) ? req.headers.authorization?.split(' ')[1] : '';
    if (signatureVerify(signature || '', req.body)) {
        return done(null, req.body);
    } else {
        res.status(msgErrors.UNAUTHORIZED.error.code).json(msgErrors.UNAUTHORIZED);
    }
}