import {Router} from 'express';
import {
  signIn,
  signUp,
  refresh,
  changeEmail,
  changePasswd,
  deleteUser,
  account,
  resetPasswd,
  confirmResetPasswd,
  emailVerification,
  confirmVerification,
  logout,
  socialSignIn,
  updateUser
} from '../controllers/auth.controller';
import { jwk } from "../controllers/jwk.comtroller";
import passport from "passport";

const router = Router();

// General
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refresh);
router.post('/change-email', passport.authenticate('jwt', { session: false }), changeEmail);
router.post('/change-password', passport.authenticate('jwt', { session: false }), changePasswd);
router.get('/logout', passport.authenticate('jwt', { session: false }), logout);
router.post('/email-verification', emailVerification);
router.post('/confirm-verification', confirmVerification);
router.post('/reset-password', resetPasswd);
router.post('/confirm-password', confirmResetPasswd);
router.get('/jwk/securetoken', jwk);

// Social
router.post('/facebook', passport.authenticate('facebook-token', { session: false }), socialSignIn);
router.post('/google', passport.authenticate('google-token', { session: false, scope: ['profile', 'email', 'name'] }), socialSignIn);

// User
router.delete('/user', passport.authenticate('jwt', { session: false }), deleteUser);
router.get('/user', passport.authenticate('jwt', { session: false }), account);
router.patch('/user', passport.authenticate('jwt', { session: false }), updateUser);

export default router;
