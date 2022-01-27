import express from 'express';
import path from 'path';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { ErrorHelper } from './utils/errorHelper';
import tourRouter from './services/tour/tourRoutes';
import userRouter from './services/user/userRoutes';
import reviewRouter from './services/review/reviewRoutes';
import viewRouter from './services/view/viewRoutes';

const app = express();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, Please try again in an hour',
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use('/api', limiter);
app.use(express.json());
app.use(mongoSanitize());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use('/', viewRouter);
app.use('/test', () => {
  console.log(process.env.NODE_ENV);
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', ErrorHelper.handleMissingRoute);
app.use(ErrorHelper.globalErrorHandler);

export default app;
