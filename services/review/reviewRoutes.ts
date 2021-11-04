import express from 'express';
import { AuthController } from '../user/authController';
import { ReviewController } from './reviewController';
// import { ReviewValidation } from './reviewValidator';

const router = express.Router({ mergeParams: true });

router.use(AuthController.protect);

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(
    AuthController.restrictTo('user'),
    ReviewController.setTourUserIds,
    ReviewController.createReview
  );

router
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(
    AuthController.restrictTo('user', 'admin'),
    ReviewController.updateReview
  )
  .delete(
    AuthController.restrictTo('user', 'admin'),
    ReviewController.deleteReview
  );

export default router;
