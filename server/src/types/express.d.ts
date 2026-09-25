import { IUser } from '../models/user.model';

declare module "express-serve-static-core" {
    interface Request {
      localUser?: IUser;
    }
  }


export {};