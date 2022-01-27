import { Request, Response, NextFunction } from 'express';
import { FilterHelper } from './filterHelper';
import { catchAsync } from './catchAsync';
import { AppError } from './errorHelper';
import { Model, Document } from 'mongoose';

export abstract class FactoryHelper {
  public static deleteOne = (model: Model<any>) =>
    catchAsync(async (req, res, next) => {
      const doc: Document = await model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    });

  public static updateOne = (model: Model<any>) =>
    catchAsync(async (req, res, next) => {
      const doc: Document = await model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    });

  public static createOne = (model: Model<any>) =>
    catchAsync(async (req, res, next) => {
      const doc: Document = await model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    });

  public static getOne = (model: Model<any>, popOptions?: any) =>
    catchAsync(async (req, res, next) => {
      let query = model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);
      const doc: Document = await query;

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    });

  public static getAll = (model: Model<any>) =>
    catchAsync(async (req, res, next) => {
      // To allow for nested GET reviews on tour (hack)
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      const doc = await FilterHelper.buildQuery(model.find(filter), req.query);

      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        results: doc.length,
        limit: parseInt(req.query.limit),
        page: parseInt(req.query.page),
        data: doc,
      });
    });
}
