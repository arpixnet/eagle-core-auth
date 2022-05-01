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

// x - Actualizar usuario
// Falta implementar los endpoints para agregar, modificar y eliminar el/los role(s) al usuario.
// SMS y SMS verification.
// Poder implementar plugins.
// Implementar, poder configurar dificultad de la contraseña.
// Templates de email, sms, etc que se extraigan de la base de datos.
// Segundo factor de autenticación, google o sms.
// x - Convertir los claims en claims dinámicos, que pueda agregarlo a la base de datos y aplicarlo al token por medio de lambda.
// Los endpoints adminitrativos para cambiar password, email, roles, verificar email, visualizar, crear y eliminar usuarios.
// Agregar una función que genere una contraseña aleatoria para la creación con endpoint administrativo.
// Webhooks de las acciones signup, signin, change-email, delete.

export default router;
