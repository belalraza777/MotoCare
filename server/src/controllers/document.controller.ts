import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { getRequestUserId, getRequiredParam } from '../utils/request.utils';
import * as documentService from '../services/document.service';

// attaches the computed status before the document leaves the API
const withStatus = (doc: any) => ({ ...doc.toObject(), status: documentService.getDocumentStatus(doc) });


export const upsertDocument = asyncHandler(async (req: Request, res: Response) => {
  const doc = await documentService.upsertDocument(getRequestUserId(req), getRequiredParam(req, 'bikeId'), req.body);
  res.status(200).json(new ApiResponse(200, withStatus(doc), 'Document saved'));
});

export const getDocumentList = asyncHandler(async (req: Request, res: Response) => {
  const docs = await documentService.getBikeDocuments(getRequestUserId(req), getRequiredParam(req, 'bikeId'));
  res.status(200).json(new ApiResponse(200, docs.map(withStatus)));
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const doc = await documentService.getDocumentById(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'documentId'));
  res.status(200).json(new ApiResponse(200, withStatus(doc)));
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.deleteDocument(getRequestUserId(req), getRequiredParam(req, 'bikeId'), getRequiredParam(req, 'documentId'));
  res.status(200).json(new ApiResponse(200, null, 'Document deleted'));
});