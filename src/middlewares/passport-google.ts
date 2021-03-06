import config from "../config/config";
let GoogleStrategyt = require('passport-google-token');

const opts = {
    clientID: config.social.google_app_id,
    clientSecret: config.social.google_app_secret
};

export default new GoogleStrategyt.Strategy(opts, (accessToken:string, refreshToken:string, payload:any, done:any) => {
    const profile = payload._json || null;
    if (!profile?.email || !profile?.id) return done(null, false);
    return done(null, payload);
})
