import { Request, Response } from "express";
import fs from "fs";
import path from "path";

var rsaPemToJwk = require('rsa-pem-to-jwk');

const jwk = async (req: Request, res: Response): Promise<Response> => {
    const pathToPubKey = path.join(__dirname, '../keys', 'id_rsa_pub.pem');
    const pem = fs.readFileSync(pathToPubKey, 'utf8');
    var jwkJson = rsaPemToJwk(pem, {use: 'sig', alg: 'RS256'}, 'public');
    return res.status(200).send({
        keys: [jwkJson]
    });
}

export {jwk}
