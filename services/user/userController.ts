import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { User } from '../../models/userModel';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/errorHelper';
import { FactoryHelper } from '../../utils/factoryHelper';
import { AuthenticatedRequest } from './authController';

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req: AuthenticatedRequest, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

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
    req.params.id = req.user._id;
    next();
  };

  public static uploadUserPhoto = upload.single('photo');

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
      const filteredBody = UserController.filterObj(req.body, 'name', 'email');

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

  public static getUser = FactoryHelper.getOne(User);
  public static getAllUsers = FactoryHelper.getAll(User);

  // Do NOT update passwords with this!
  public static updateUser = FactoryHelper.updateOne(User);
  public static deleteUser = FactoryHelper.deleteOne(User);
}
