import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const pem2jwk = require('pem-jwk').pem2jwk

const jwk = async (req: Request, res: Response): Promise<Response> => {
    const pathToPubKey = path.join(__dirname, '../keys', 'id_rsa_pub.pem');
    const pem = fs.readFileSync(pathToPubKey, 'utf8');
    var jwkJson = await pem2jwk(pem)
    return res.status(200).send({keys: [jwkJson]});
}

export {jwk}
