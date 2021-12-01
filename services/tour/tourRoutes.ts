import express from 'express';
import { AuthController } from '../user/authController';
import { TourController } from './tourController';
import { TourValidation } from './tourValidator';
import reviewRouter from '../review/reviewRoutes';

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(TourController.aliasTopTours, TourController.getAllTours);

router.route('/tour-stats').get(TourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    TourValidation.validateYear,
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide', 'guide'),
    TourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(TourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(TourController.getDistances);

router
  .route('/')
  .get(TourController.getAllTours)
  .post(
    TourValidation.validateCreateTour,
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.createTour
  );

router.use(TourValidation.validateMongoDBid);
router
  .route('/:id')
  .get(TourController.getTour)
  .patch(
    TourValidation.validateUpdateTour,
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.uploadTourImages,
    TourController.resizeTourImages,
    TourController.updateTour
  )
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.deleteTour
  );

export default router;
