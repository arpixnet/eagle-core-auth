import {Router} from 'express';
import {
  signIn,
  signUp,
  refresh,
  tokenWithoutExpiration,
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
import getTokenGithub from "../middlewares/get-token-github";

const router = Router();

// General
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refresh);
router.post('/token-without-expiration', passport.authenticate('jwt', { session: false }), tokenWithoutExpiration);
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
router.post('/github/token', getTokenGithub, () => {});
router.post('/github', [passport.authenticate('github-token', { session: false })], socialSignIn);
router.post('/bitbucket', passport.authenticate('bitbucket-token', { session: false, scope: ['repository', 'account', 'project', 'email'] }), socialSignIn);

// User
router.delete('/user', passport.authenticate('jwt', { session: false }), deleteUser);
router.get('/user', passport.authenticate('jwt', { session: false }), account);
router.patch('/user', passport.authenticate('jwt', { session: false }), updateUser);

// Admin
// router.post('/admin/role', createRole);
// router.get('/admin/role', readRoles);
// router.get('/admin/role/:id', readRole);
// router.patch('/admin/role', updateRole);
// router.delete('/admin/role', deleteRole);

// router.post('/admin/user/role', addRoleToUser);
// router.get('/admin/user/:id/roles', getUserRoles);
// router.delete('/admin/user/role', removeRoleFromUser);

// router.post('/admin/user', createAdminUser);
// router.get('/admin/user', readAdminUsers);
// router.get('/admin/user/:id', readAdminUser);
// router.patch('/admin/user', updateAdminUser);
// router.delete('/admin/user', deleteAdminUser);
// router.post('/admin/user/reset-password', resetAdminUserPassword);

// router.post('/admin/lambda', createLambda);
// router.get('/admin/lambda', readRLambdas);
// router.get('/admin/lambda/:id', readLambda);
// router.patch('/admin/lambda', updateLambda);
// router.delete('/admin/lambda', deleteLambda);

export default router;
