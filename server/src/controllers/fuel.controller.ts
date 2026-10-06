import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { getRequestUserId, getRequiredParam } from '../utils/request.utils';
import * as fuelService from '../services/fuel.service';

export const createFuel = asyncHandler(async (req: Request, res: Response) => {
  const record = await fuelService.createFuel(getRequestUserId(req), getRequiredParam(req, 'bikeId'), req.body);
  res.status(201).json(new ApiResponse(201, record, 'Fuel entry added'));
});

export const getFuelList = asyncHandler(async (req: Request, res: Response) => {
  const records = await fuelService.getBikeFuel(getRequestUserId(req), getRequiredParam(req, 'bikeId'));
  res.status(200).json(new ApiResponse(200, records));
});

export const getFuel = asyncHandler(async (req: Request, res: Response) => {
  const record = await fuelService.getFuelById(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'fuelId'));
  res.status(200).json(new ApiResponse(200, record));
});

export const updateFuel = asyncHandler(async (req: Request, res: Response) => {
  const record = await fuelService.updateFuel(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'fuelId'), req.body);
  res.status(200).json(new ApiResponse(200, record, 'Fuel entry updated'));
});

export const deleteFuel = asyncHandler(async (req: Request, res: Response) => {
  await fuelService.deleteFuel(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'fuelId'));
  res.status(200).json(new ApiResponse(200, null, 'Fuel entry deleted'));
});