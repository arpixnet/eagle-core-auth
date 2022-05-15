import express, { Application } from 'express'
import passport from 'passport'
import passportMiddleware from './middlewares/passport';
import facebookStrategy from "./middlewares/passport-facebook";
import googleStrategy from "./middlewares/passport-google";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';

// Init
const server: Application = express();

// Settings
server.set('port', process.env.PORT || 3000);
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: (process.env.CORS_CREDENTIALS === 'true')
};

// Middlewares
server.use(morgan('dev'));
server.use(cors(corsOptions));
server.use(cookieParser());
server.use(express.urlencoded({extended: false}));
server.use(express.json());
server.use(passport.initialize());
passport.use(passportMiddleware);
passport.use(facebookStrategy);
passport.use(googleStrategy);
passport.serializeUser((user:any, done) => {
    done(null, user);
});
passport.deserializeUser((user:any, done) => {
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
server.use('/api/auth', authRoutes);

export default server;
