import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as maintenanceService from '../services/maintenance.service';

//Helper function to get the user ID from the request object. Assumes that the user has been authenticated and their ID is stored in req.localUser._id. If the user is not authenticated, this function will throw an error.
const getUserId = (req: Request): string => req.localUser!._id.toString();

// Shared param validator — same pattern used in bike.controller.ts
const getParam = (req: Request, key: string): string => {
  const value = req.params[key];
  if (!value || typeof value !== 'string') {
    throw new ApiError(400, `Invalid ${key}`);
  }
  return value;
};

//---Create, Read, Update, Delete (CRUD) operations for Maintenance records---//
export const createMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bikeId = getParam(req, 'bikeId');
  const record = await maintenanceService.createMaintenance(userId, bikeId, req.body);
  res.status(201).json(new ApiResponse(201, record, 'Maintenance record created'));
});

export const getMaintenanceList = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bikeId = getParam(req, 'bikeId');
  const records = await maintenanceService.getBikeMaintenance(userId, bikeId);
  res.status(200).json(new ApiResponse(200, records));
});

export const getMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bikeId = getParam(req, 'bikeId');
  const maintenanceId = getParam(req, 'maintenanceId');
  const record = await maintenanceService.getMaintenanceById(userId, bikeId, maintenanceId);
  res.status(200).json(new ApiResponse(200, record));
});

export const updateMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bikeId = getParam(req, 'bikeId');
  const maintenanceId = getParam(req, 'maintenanceId');
  const record = await maintenanceService.updateMaintenance(userId, bikeId, maintenanceId, req.body);
  res.status(200).json(new ApiResponse(200, record, 'Maintenance record updated'));
});

export const deleteMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const bikeId = getParam(req, 'bikeId');
  const maintenanceId = getParam(req, 'maintenanceId');
  await maintenanceService.deleteMaintenance(userId, bikeId, maintenanceId);
  res.status(200).json(new ApiResponse(200, null, 'Maintenance record deleted'));
});