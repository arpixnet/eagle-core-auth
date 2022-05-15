import config from "../config/config";
import Strategy from "passport-facebook-token";

const opts = {
    clientID: config.social.facebookAppId,
    clientSecret: config.social.facebookAppSecret,
    profileFields: ['id', 'photos', 'email', "name"]
};

export default new Strategy(opts, (accessToken:string, refreshToken:string, payload:any, done:any) => {
    const profile = payload._json || null;
    if (!profile?.email || !profile?.id) return done(null, false);
    return done(null, payload);
})
