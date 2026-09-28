import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as fuelService from '../services/fuel.service';

const getUserId = (req: Request): string => req.localUser!._id.toString();

const getParam = (req: Request, key: string): string => {
  const value = req.params[key];
  if (!value || typeof value !== 'string') throw new ApiError(400, `Invalid ${key}`);
  return value;
};


export const createFuel = asyncHandler(async (req: Request, res: Response) => {
  const record = await fuelService.createFuel(getUserId(req), getParam(req, 'bikeId'), req.body);
  res.status(201).json(new ApiResponse(201, record, 'Fuel entry added'));
});

export const getFuelList = asyncHandler(async (req: Request, res: Response) => {
  const records = await fuelService.getBikeFuel(getUserId(req), getParam(req, 'bikeId'));
  res.status(200).json(new ApiResponse(200, records));
});

export const getFuel = asyncHandler(async (req: Request, res: Response) => {
  const record = await fuelService.getFuelById(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'fuelId'));
  res.status(200).json(new ApiResponse(200, record));
});

export const updateFuel = asyncHandler(async (req: Request, res: Response) => {
  const record = await fuelService.updateFuel(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'fuelId'), req.body);
  res.status(200).json(new ApiResponse(200, record, 'Fuel entry updated'));
});

export const deleteFuel = asyncHandler(async (req: Request, res: Response) => {
  await fuelService.deleteFuel(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'fuelId'));
  res.status(200).json(new ApiResponse(200, null, 'Fuel entry deleted'));
});