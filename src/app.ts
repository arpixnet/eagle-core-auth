import express, { Application } from 'express'
import passport from 'passport'
import passportMiddleware from './middlewares/passport';
import facebookStrategy from "./middlewares/passport-facebook";
import googleStrategy from "./middlewares/passport-google";
import cors from 'cors';
const cookieParser = require('cookie-parser');
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';

// Init
const server: Application = express();

// Settings
server.set('port', process.env.PORT || 3000);

// Middlewares
server.use(morgan('dev'));
server.use(cors());
server.use(cookieParser());
server.use(express.urlencoded({extended: false}));
server.use(express.json());
server.use(passport.initialize());
passport.use(passportMiddleware);
passport.use(facebookStrategy);
passport.use(googleStrategy);
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// error handler
// app.use((err, req, res, next) => {
// 	if (err) {
// 		console.error(err.message);
// 		console.error(err.stack);
// 		return res.status(err.output.statusCode || 500).json(err.output.payload);
// 	}
// });

// Routes
server.use('/api/v1/auth', authRoutes);

export default server;
