import express from 'express';
import { BookingController } from './bookingController';
import { AuthController } from '../user/authController';

const router = express.Router();

router.use(AuthController.protect);

router.get('/checkout-session/:tourId', BookingController.getCheckoutSession);

router.use(AuthController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(BookingController.getAllBookings)
  .post(BookingController.createBooking);

router
  .route('/:id')
  .get(BookingController.getBooking)
  .patch(BookingController.updateBooking)
  .delete(BookingController.deleteBooking);

export default router;
