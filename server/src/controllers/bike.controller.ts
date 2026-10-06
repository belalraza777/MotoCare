import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { getRequestUserId, getRequiredParam } from '../utils/request.utils';
import * as bikeService from '../services/bike.service';
import { getBikeDashboard } from '../services/dashboard.service';

export const createBike = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bike = await bikeService.createBike(userId, req.body);
  res.status(201).json(new ApiResponse(201, bike, 'Bike created'));
});

export const getBikes = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikes = await bikeService.getUserBikes(userId);
  res.status(200).json(new ApiResponse(200, bikes));
});

export const getBike = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'id', 'bike id');
  const bike = await bikeService.getBikeById(userId, bikeId);
  res.status(200).json(new ApiResponse(200, bike));
});

export const updateBike = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'id', 'bike id');
  const bike = await bikeService.updateBike(userId, bikeId, req.body);
  res.status(200).json(new ApiResponse(200, bike, 'Bike updated'));
});

export const deleteBike = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'id', 'bike id');
  await bikeService.deleteBike(userId, bikeId);
  res.status(200).json(new ApiResponse(200, null, 'Bike deleted'));
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'id', 'bike id');
  const dashboard = await getBikeDashboard(userId, bikeId);
  res.status(200).json(new ApiResponse(200, dashboard));
});