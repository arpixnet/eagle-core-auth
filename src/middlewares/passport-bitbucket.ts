import config from "../config/config";
let BitbucketTokenStrategy = require('passport-bitbucket-token');

const opts = {
    clientID: config.social.bitbucketAppId,
    clientSecret: config.social.bitbucketAppSecret,
    profileWithEmail: true,
    apiVersion: '2.0'
};

export default new BitbucketTokenStrategy(opts, (accessToken:string, refreshToken:string, payload:any, done:any) => {
    const profile = payload._json || null;
    if (!profile?.email || !profile?.id) return done(null, false);
    payload.accessToken = accessToken
    payload.refreshToken = refreshToken
    return done(null, payload);
})
