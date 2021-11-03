import express from 'express';
import { authController } from './authController';
import { userController } from './userController';
import { userValidation } from './userValidator';

const router = express.Router();

router.post(
  '/signup',
  userValidation.validateCreateUser,
  authController.signup
);
router.post('/login', userValidation.validateLoginUser, authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
