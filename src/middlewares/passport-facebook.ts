import config from "../config/config";
import Strategy from "passport-facebook-token";

const opts = {
    clientID: config.social.facebook_app_id,
    clientSecret: config.social.facebook_app_secret,
    profileFields: ['id', 'photos', 'email', "name"]
};

export default new Strategy(opts, (accessToken:string, refreshToken:string, payload:any, done:any) => {
    const profile = payload._json || null;
    if (!profile?.email || !profile?.id) return done(null, false);
    return done(null, payload);
})
