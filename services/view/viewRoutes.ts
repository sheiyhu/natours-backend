import express from 'express';
import { AuthController } from '../user/authController';
import { ViewController } from './viewController';

const router = express.Router();

router.get('/', AuthController.isLoggedIn, ViewController.getOverview);
router.get('/tour/:slug', AuthController.isLoggedIn, ViewController.getTour);
router.get('/login', AuthController.isLoggedIn, ViewController.getLoginForm);
router.get('/me', AuthController.protect, ViewController.getAccount);

router.post(
  '/submit-user-data',
  AuthController.protect,
  ViewController.updateUserData
);

export default router;
