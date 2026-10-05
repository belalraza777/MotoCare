import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'params';

export const validate = (schema: Joi.ObjectSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      next(new ApiError(400, 'Validation failed', error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }))));
      return;
    }

    req[target] = value;
    next();
  };
};
