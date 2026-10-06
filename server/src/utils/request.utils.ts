import { Request } from 'express';
import { ApiError } from './ApiError';

export const getRequestUserId = (req: Request): string => req.localUser!._id.toString();

export const getRequiredParam = (
  req: Request,
  key: string,
  label = key
): string => {
  const value = req.params[key];
  if (!value || typeof value !== 'string') {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return value;
};
