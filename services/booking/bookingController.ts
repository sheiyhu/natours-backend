import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Tour } from '../../models/tourModel';
import { Booking } from '../../models/bookingModel';
import { catchAsync } from '../../utils/catchAsync';
import { FactoryHelper } from '../../utils/factoryHelper';
import { AuthenticatedRequest } from '../user/authController';

const stripeKey = process.env.STRIPE_SECRET_KEY as string;

const stripe = new Stripe(stripeKey, {
  apiVersion: '2020-08-27',
  typescript: true,
});

export abstract class BookingController {
  public static getCheckoutSession = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      // 1) Get the currently booked tour
      const tour = await Tour.findById(req.params.tourId);
      console.log(tour);

      // 2) Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
          req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
          {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1,
          },
        ],
      });

      // 3) Create session as response
      res.status(200).json({
        status: 'success',
        session,
      });
    }
  );

  public static createBookingCheckout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
      const { tour, user, price } = req.query;

      if (!tour && !user && !price) return next();
      await Booking.create({ tour, user, price });

      res.redirect(req.originalUrl.split('?')[0]);
    }
  );
  public static createBooking = FactoryHelper.createOne(Booking);
  public static getBooking = FactoryHelper.getOne(Booking);
  public static getAllBookings = FactoryHelper.getAll(Booking);
  public static updateBooking = FactoryHelper.updateOne(Booking);
  public static deleteBooking = FactoryHelper.deleteOne(Booking);
}
