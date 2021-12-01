import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { Tour } from '../../models/tourModel';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/errorHelper';
import { FactoryHelper } from '../../utils/factoryHelper';
import { upload } from '../../utils/multerHelper';

export abstract class TourController {
  public static aliasTopTours = (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

  public static uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]);

  public static resizeTourImages = catchAsync(
    async (req, _res, next: NextFunction) => {
      if (!req.files.imageCover || !req.files.images) return next();

      // Cover Image
      req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

      req.body.images = [];

      await Promise.all(
        req.files.images.map(async (file: any, i: number) => {
          const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

          req.body.images.push(filename);
        })
      );

      next();
    }
  );

  public static getAllTours = FactoryHelper.getAll(Tour);
  public static getTour = FactoryHelper.getOne(Tour, { path: 'reviews' });
  public static createTour = FactoryHelper.createOne(Tour);
  public static updateTour = FactoryHelper.updateOne(Tour);
  public static deleteTour = FactoryHelper.deleteOne(Tour);

  public static getTourStats = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
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
    async (req: Request, res: Response, _next: NextFunction) => {
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

  // /tours-within/:distance/center/:latlng/unit/:unit
  // /tours-within/233/center/34.111745,-118.113491/unit/mi
  public static getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  });

  public static getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  });
}
