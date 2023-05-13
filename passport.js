const passport = require("passport");
const GoogleStategy = require('passport-google-oauth20').Strategy;


passport.use(
    new GoogleStategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email']
    },
    function(accessToken, refreshToken, profile, callback){
        callback(null, profile)
    })
)

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})