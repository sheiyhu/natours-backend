import express from 'express';
import { BookingController } from '../booking/bookingController';
import { AuthController } from '../user/authController';
import { ViewController } from './viewController';

const router = express.Router();

router.get(
  '/',
  BookingController.createBookingCheckout,
  AuthController.isLoggedIn,
  ViewController.getOverview
);
router.get('/tour/:slug', AuthController.isLoggedIn, ViewController.getTour);
router.get('/login', AuthController.isLoggedIn, ViewController.getLoginForm);
router.get('/me', AuthController.protect, ViewController.getAccount);
router.get('/my-tours', AuthController.protect, ViewController.getMyTours);

router.post(
  '/submit-user-data',
  AuthController.protect,
  ViewController.updateUserData
);

export default router;
