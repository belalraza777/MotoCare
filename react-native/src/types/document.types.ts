export type DocumentType = 'INSURANCE' | 'PUC' | 'RC' | 'OTHER';
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export interface Document {
  _id: string;
  bikeId: string;
  type: DocumentType;
  title?: string;
  issueDate?: string;
  expiryDate: string;
  policyNumber?: string;
  company?: string;
  insuredAmount?: number;
  certificateNumber?: string;
  status: DocumentStatus; // computed by backend
}

export interface SaveDocumentInput {
  type: DocumentType;
  title?: string;
  issueDate?: string;
  expiryDate: string;
  policyNumber?: string;
  company?: string;
  insuredAmount?: number;
  certificateNumber?: string;
}