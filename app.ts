import express from 'express';
import morgan from 'morgan';

import tourRouter from './services/tour/tourRoutes';
import userRouter from './services/user/userRoutes';
import { ErrorHelper } from './utils/errorHelper';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', ErrorHelper.handleMissingRoute);
app.use(ErrorHelper.globalErrorHandler);

export default app;
