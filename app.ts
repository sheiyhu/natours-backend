import express from 'express';
import morgan from 'morgan';

import tourRouter from './services/tour/tourRoutes';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/tours', tourRouter);

module.exports = app;
