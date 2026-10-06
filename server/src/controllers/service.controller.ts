import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { getRequestUserId, getRequiredParam } from '../utils/request.utils';
import * as serviceService from '../services/service.service';

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.createService(getRequestUserId(req), getRequiredParam(req, 'bikeId'), req.body);
  res.status(201).json(new ApiResponse(201, service, 'Service record created'));
});

export const getServiceList = asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceService.getBikeServices(getRequestUserId(req), getRequiredParam(req, 'bikeId'));
  res.status(200).json(new ApiResponse(200, services));
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'serviceId'));
  res.status(200).json(new ApiResponse(200, service));
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.deleteService(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'serviceId'));
  res.status(200).json(new ApiResponse(200, null, 'Service record deleted'));
});