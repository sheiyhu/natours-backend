import express from 'express';
import { AuthController } from './authController';
import { UserController } from './userController';
import { UserValidation } from './userValidator';

const router = express.Router();

router.post(
  '/signup',
  UserValidation.validateCreateUser,
  AuthController.signup
);
router.post('/login', UserValidation.validateLoginUser, AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

router.use(AuthController.protect);

router.patch('/updateMyPassword', AuthController.updatePassword);
router.get('/me', UserController.getMe, UserController.getUser);
router.patch(
  '/updateMe',
  UserController.uploadUserPhoto,
  UserController.updateMe
);
router.delete('/deleteMe', UserController.deleteMe);

router.use(AuthController.restrictTo('admin'));

router.route('/').get(UserController.getAllUsers);

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

export default router;
