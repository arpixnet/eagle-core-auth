import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import path from "path";
import fs from "fs";
import { User } from "../controllers/user.controller";
import { IUser } from "../models/user";

const pathToPubKey = path.join(__dirname, '../keys', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY
};

export default new Strategy(opts, async (payload, done) => {
    try {
        const user: IUser | null = await User.findById(payload.id);
        if (user && !user.disabled) {
            return done(null, user);
        }
        return done(null, false);
    } catch (err) {
        console.error(err);
        return done(err, false);
    }
});
