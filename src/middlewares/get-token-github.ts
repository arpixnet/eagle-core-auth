import { Request, Response } from "express";
import { msgErrors } from "../helpers/status";
import config from "../config/config";
import axios from 'axios'

export default (req:Request, res:Response, done:any) => {
    const code: string = req.body.code || '';
    const referred: string = (req.body.referred) ? `&referred=${req.body.referred}` : '';
    if (code) {
        getToken(code).then(token => {
            const new_url = `/api/v1/auth/github?access_token=${token}${referred}`;
            res.redirect(308, new_url);
            return done();
        }).catch(err => {
            console.error(err);
            res.status(msgErrors.UNEXPECTED_ERROR_TRY_LATER.error.code).json(msgErrors.UNEXPECTED_ERROR_TRY_LATER);
        })
    } else {
        res.status(msgErrors.UNAUTHORIZED.error.code).json(msgErrors.UNAUTHORIZED);
    }
}

const getToken = (code: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const endpoint = config.social.githubUrlToken;
            const body = { client_id: config.social.githubAppId, client_secret: config.social.githubAppSecret, code };
            const opts = { headers: { accept: 'application/json' } };

            axios.post(endpoint, body, opts)
            .then(resp => {
                return resp.data['access_token']
            })
            .then(_token => {
                resolve(_token)
            })
            .catch(err => reject(err))
        } catch (err) {
            reject(err)
        }
    })
}
