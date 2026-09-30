import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as serviceService from '../services/service.service';

const getUserId = (req: Request): string => req.localUser!._id.toString();

const getParam = (req: Request, key: string): string => {
  const value = req.params[key];
  if (!value || typeof value !== 'string') throw new ApiError(400, `Invalid ${key}`);
  return value;
};

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.createService(getUserId(req), getParam(req, 'bikeId'), req.body);
  res.status(201).json(new ApiResponse(201, service, 'Service record created'));
});

export const getServiceList = asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceService.getBikeServices(getUserId(req), getParam(req, 'bikeId'));
  res.status(200).json(new ApiResponse(200, services));
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'serviceId'));
  res.status(200).json(new ApiResponse(200, service));
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.deleteService(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'serviceId'));
  res.status(200).json(new ApiResponse(200, null, 'Service record deleted'));
});