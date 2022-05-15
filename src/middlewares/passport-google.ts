import config from "../config/config";
let GoogleStrategyt = require('passport-google-token');

const opts = {
    clientID: config.social.googleAppId,
    clientSecret: config.social.googleAppSecret
};

export default new GoogleStrategyt.Strategy(opts, (accessToken:string, refreshToken:string, payload:any, done:any) => {
    const profile = payload._json || null;
    if (!profile?.email || !profile?.id) return done(null, false);
    return done(null, payload);
})
