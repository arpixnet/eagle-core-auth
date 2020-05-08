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
  socialSignIn
} from '../controllers/auth.controller';
import { jwk } from "../controllers/jwk.comtroller";
import passport from "passport";

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refresh);
router.post('/change-email', passport.authenticate('jwt', { session: false }), changeEmail);
router.post('/change-password', passport.authenticate('jwt', { session: false }), changePasswd);
router.delete('/delete', passport.authenticate('jwt', { session: false }), deleteUser);
router.get('/account', passport.authenticate('jwt', { session: false }), account);
router.get('/logout', passport.authenticate('jwt', { session: false }), logout);
router.post('/email-verification', emailVerification);
router.post('/confirm-verification', confirmVerification);
router.post('/reset-password', resetPasswd);
router.post('/confirm-password', confirmResetPasswd);
router.get('/jwk/securetoken', jwk);

// Social
router.post('/facebook', passport.authenticate('facebook-token', { session: false }), socialSignIn);
router.post('/google', passport.authenticate('google-token', { session: false, scope: ['profile', 'email', 'name'] }), socialSignIn);

export default router;
