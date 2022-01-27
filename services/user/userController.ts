import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { User } from '../../models/userModel';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/errorHelper';
import { FactoryHelper } from '../../utils/factoryHelper';
import { upload } from '../../utils/multerHelper';
import { AuthenticatedRequest } from './authController';

export abstract class UserController {
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

  public static getMe = (req: any, res: Response, next: NextFunction) => {
    req.params.id = req.user.id;
    next();
  };

  public static uploadUserPhoto = upload.single('photo');

  public static resizeUserPhoto = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      if (!req.file) return next();

      req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

      await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

      next();
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
      let filteredBody = UserController.filterObj(req.body, 'name', 'email');
      if (req.file) filteredBody.photo = req.file.filename;

      // 3) Update user document
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
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
      await User.findByIdAndUpdate(req.user.id, { active: false });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );

  public static getUser = FactoryHelper.getOne(User);
  public static getAllUsers = FactoryHelper.getAll(User);

  // Do NOT update passwords with this!
  public static updateUser = FactoryHelper.updateOne(User);
  public static deleteUser = FactoryHelper.deleteOne(User);
}
