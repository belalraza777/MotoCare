import { User as UserType } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      localUser?: InstanceType<typeof UserType>;
    }
  }
}