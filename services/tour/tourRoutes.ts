import express from 'express';
import { tourController } from './tourController';
import { tourValidation } from './tourValidator';

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(tourValidation.validateYear, tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourValidation.validateCreateTour, tourController.createTour);

router
  .route('/:id')
  .get(tourValidation.validateMongoDBid, tourController.getTour)
  .patch(
    tourValidation.validateMongoDBid,
    tourValidation.validateUpdateTour,
    tourController.updateTour
  )
  .delete(tourValidation.validateMongoDBid, tourController.deleteTour);

export default router;
