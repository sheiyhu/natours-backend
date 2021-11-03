import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import { ErrorHelper } from './utils/errorHelper';
import tourRouter from './services/tour/tourRoutes';
import userRouter from './services/user/userRoutes';

const app = express();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, Please try again in an hour',
});

app.use(helmet);
app.use(morgan('dev'));
app.use('/api', limiter);
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
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

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', ErrorHelper.handleMissingRoute);
app.use(ErrorHelper.globalErrorHandler);

export default app;
