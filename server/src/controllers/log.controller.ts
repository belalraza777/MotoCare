import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { getLogs as fetchLogs, LogType } from '../services/log.service';

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.localUser!._id.toString();

  const type = ['fuel', 'service', 'maintenance'].includes(String(req.query.type))
    ? (req.query.type as LogType)
    : 'all';
  const bikeId = typeof req.query.bikeId === 'string' ? req.query.bikeId : undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 100); // 100 se zyada kabhi nahi

  const data = await fetchLogs(userId, type, bikeId, limit);
  res.status(200).json(new ApiResponse(200, data));
});