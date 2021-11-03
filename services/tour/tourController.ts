import { Request, Response, NextFunction } from 'express';
import { filterHelper } from '../../utils/filterHelper';
import { Tour } from '../../models/tourModel';
import { catchAsync } from '../../utils/catchAsync';

export abstract class tourController {
  public static aliasTopTours = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

  public static getAllTours = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tours = await filterHelper.buildQuery(Tour.find(), req.query);

      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
    }
  );

  public static getTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tour = await Tour.findById(req.params.id);

      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    }
  );

  public static createTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );

  public static updateTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    }
  );

  public static deleteTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      await Tour.findByIdAndDelete(req.params.id);

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );

  public static getTourStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
          },
        },
        {
          $sort: { avgPrice: 1 },
        },
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          stats,
        },
      });
    }
  );

  public static getMonthlyPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const year = (req.params.year as unknown as number) * 1;

      const plan = await Tour.aggregate([
        {
          $unwind: '$startDates',
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' },
          },
        },
        {
          $addFields: { month: '$_id' },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $sort: { numTourStarts: -1 },
        },
        {
          $limit: 12,
        },
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          plan,
        },
      });
    }
  );
}
