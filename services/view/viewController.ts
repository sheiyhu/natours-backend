import { Request, Response, NextFunction } from 'express';
import { Booking } from '../../models/bookingModel';
import { Tour } from './../../models/tourModel';
import { User } from './../../models/userModel';
import { catchAsync } from './../../utils/catchAsync';
import { AppError } from './../../utils/errorHelper';

export abstract class ViewController {
  public static getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  });

  public static getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

    res
      .set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
      .status(200)
      .render('tour', {
        title: `${tour.name} Tour`,
        tour,
      });
  });

  public static getLoginForm = (req: Request, res: Response) => {
    res.status(200).render('login', {
      title: 'Log into your account',
    });
  };

  public static getAccount = (req: Request, res: Response) => {
    res.status(200).render('account', {
      title: 'Your account',
    });
  };

  public static updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser,
    });
  });

  public static getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });

    const tourIDs = bookings.map((el: any) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  });
}
