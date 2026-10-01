import { Document, IDocument, DocumentType } from '../models/document.model';
import { ApiError } from '../utils/ApiError';
import { getBikeById } from './bike.service';

//Expiry warning days for each document type — used to determine if a document is expiring soon
const EXPIRY_WARNING_DAYS: Record<DocumentType, number> = {
  [DocumentType.INSURANCE]: 30,
  [DocumentType.PUC]: 15,
  [DocumentType.RC]: 30,
  [DocumentType.OTHER]: 30,
};

// Returns the status of a document based on its expiry date
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

// computed on read, never stored — always accurate, no background job needed
export function getDocumentStatus(doc: IDocument): DocumentStatus {
  const daysLeft = (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= EXPIRY_WARNING_DAYS[doc.type]) return 'expiring_soon';
  return 'valid';
}

//Creates or updates a document for a bike, ensuring that only one of each type (except OTHER) exists per bike. Validates required fields based on document type.
export const upsertDocument = async (userId: string, bikeId: string, data: Partial<IDocument>) => {
  await getBikeById(userId, bikeId);
  if (!data.type) throw new ApiError(400, 'Document type is required');
  if (data.type === DocumentType.OTHER && !data.title?.trim()) {
    throw new ApiError(400, 'Title is required for custom documents');
  }

  // OTHER allows multiple records, so always create new rather than upsert
  if (data.type === DocumentType.OTHER) {
    return Document.create({ ...data, bikeId });
  }

  // Insurance/PUC/RC: one per bike — saving replaces the existing record
  return Document.findOneAndUpdate(
    { bikeId, type: data.type },
    { ...data, bikeId },
    { upsert: true, new: true, runValidators: true }
  );
};

// Retrieves all documents for a bike, sorted by creation date
export const getBikeDocuments = async (userId: string, bikeId: string) => {
  await getBikeById(userId, bikeId);
  return Document.find({ bikeId }).sort({ createdAt: -1 });
};

// Retrieves a specific document by its ID, ensuring it belongs to the specified bike
export const getDocumentById = async (userId: string, bikeId: string, documentId: string) => {
  await getBikeById(userId, bikeId);
  const doc = await Document.findOne({ _id: documentId, bikeId });
  if (!doc) throw new ApiError(404, 'Document not found');
  return doc;
};

// Deletes a document by its ID, ensuring it belongs to the specified bike
export const deleteDocument = async (userId: string, bikeId: string, documentId: string) => {
  const doc = await getDocumentById(userId, bikeId, documentId);
  await doc.deleteOne();
  return doc;
};