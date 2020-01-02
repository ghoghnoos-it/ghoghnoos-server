import controller from './controller';
import middleware from './middleware';
import express from 'express';
const router = express.Router();

router.post('/register', controller.account.register);
router.post('/login', controller.account.login);
router.post('/re', controller.account.reauth);

router.post('/verify', middleware.auth, controller.account.RequestForEmailVerify); // Request for verify email user account
router.get('/verify/:token', controller.account.VerifyEmailAccount); // Verify email user account

router.post('/phone', middleware.auth, controller.account.RequestForPhoneVerify); // Request for verify phone user account
router.post('/phone/verify', middleware.auth, controller.account.VerifyPhoneAccount); // Verify phone user account

router.post('/forget', controller.account.RequestForForgetPassword); // Request for restart password
router.get('/forget/:token', controller.account.ForgetPasswordAccount); // Change password

router.get('/me', middleware.auth, controller.account.me); // user info
router.put('/me', middleware.auth, controller.account.edit); // edit user info

router.post('/new', middleware.auth, middleware.permission(['superadmin']), controller.account.newAdmin); // Add new admin

export default router;