import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { getRequestUserId, getRequiredParam } from '../utils/request.utils';
import * as maintenanceService from '../services/maintenance.service';

//---Create, Read, Update, Delete (CRUD) operations for Maintenance records---//
export const createMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'bikeId');
  const record = await maintenanceService.createMaintenance(userId, bikeId, req.body);
  res.status(201).json(new ApiResponse(201, record, 'Maintenance record created'));
});

export const getMaintenanceList = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'bikeId');
  const records = await maintenanceService.getBikeMaintenance(userId, bikeId);
  res.status(200).json(new ApiResponse(200, records));
});

export const getMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'bikeId');
  const maintenanceId = getRequiredParam(req, 'maintenanceId');
  const record = await maintenanceService.getMaintenanceById(userId, bikeId, maintenanceId);
  res.status(200).json(new ApiResponse(200, record));
});

export const updateMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'bikeId');
  const maintenanceId = getRequiredParam(req, 'maintenanceId');
  const record = await maintenanceService.updateMaintenance(userId, bikeId, maintenanceId, req.body);
  res.status(200).json(new ApiResponse(200, record, 'Maintenance record updated'));
});

export const deleteMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const userId = getRequestUserId(req);
  const bikeId = getRequiredParam(req, 'bikeId');
  const maintenanceId = getRequiredParam(req, 'maintenanceId');
  await maintenanceService.deleteMaintenance(userId, bikeId, maintenanceId);
  res.status(200).json(new ApiResponse(200, null, 'Maintenance record deleted'));
});