import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/userModel';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/errorHelper';
import { AuthenticatedRequest } from './authController';

export abstract class userController {
  static filterObj = (
    obj: { [x: string]: string },
    ...allowedFields: string[]
  ) => {
    const newObj: { [x: string]: string } = {};
    Object.keys(obj).forEach((el: any) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

  public static getAllUsers = catchAsync(
    async (req: Request, res: Response, next) => {
      const users = await User.find();

      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
          users,
        },
      });
    }
  );

  public static updateMe = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // 1) Create error if user POSTs password data
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
          )
        );
      }

      // 2) Filtered out unwanted fields names that are not allowed to be updated
      const filteredBody = userController.filterObj(req.body, 'name', 'email');

      // 3) Update user document
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser,
        },
      });
    }
  );

  public static deleteMe = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      await User.findByIdAndUpdate(req.user._id, { active: false });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );

  public static getUser = (req: Request, res: Response) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  };
  public static createUser = (req: Request, res: Response) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  };
  public static updateUser = (req: Request, res: Response) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  };
  public static deleteUser = (req: Request, res: Response) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  };
}
