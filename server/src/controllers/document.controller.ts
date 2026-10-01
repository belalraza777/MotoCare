import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as documentService from '../services/document.service';

const getUserId = (req: Request): string => req.localUser!._id.toString();

const getParam = (req: Request, key: string): string => {
  const value = req.params[key];
  if (!value || typeof value !== 'string') throw new ApiError(400, `Invalid ${key}`);
  return value;
};

// attaches the computed status before the document leaves the API
const withStatus = (doc: any) => ({ ...doc.toObject(), status: documentService.getDocumentStatus(doc) });


export const upsertDocument = asyncHandler(async (req: Request, res: Response) => {
  const doc = await documentService.upsertDocument(getUserId(req), getParam(req, 'bikeId'), req.body);
  res.status(200).json(new ApiResponse(200, withStatus(doc), 'Document saved'));
});

export const getDocumentList = asyncHandler(async (req: Request, res: Response) => {
  const docs = await documentService.getBikeDocuments(getUserId(req), getParam(req, 'bikeId'));
  res.status(200).json(new ApiResponse(200, docs.map(withStatus)));
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const doc = await documentService.getDocumentById(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'documentId'));
  res.status(200).json(new ApiResponse(200, withStatus(doc)));
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.deleteDocument(getUserId(req), getParam(req, 'bikeId'), getParam(req, 'documentId'));
  res.status(200).json(new ApiResponse(200, null, 'Document deleted'));
});