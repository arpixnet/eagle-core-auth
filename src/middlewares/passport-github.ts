import config from "../config/config";
let GitHubTokenStrategy = require('passport-github-token');

const opts = {
    clientID: config.social.githubAppId,
    clientSecret: config.social.githubAppSecret,
    passReqToCallback: true
};

export default new GitHubTokenStrategy(opts, (req:any, accessToken:string, refreshToken:string, payload:any, done:any) => {
    const profile = payload._json || null;
    if (!profile?.email || !profile?.id) return done(null, false);
    payload.accessToken = accessToken
    payload.refreshToken = refreshToken
    return done(null, payload);
})
