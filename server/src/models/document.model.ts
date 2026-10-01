import { Schema, model, Types } from 'mongoose';

export enum DocumentType {
  INSURANCE = 'INSURANCE',
  PUC = 'PUC',
  RC = 'RC',
  OTHER = 'OTHER',
}

export interface IDocument {
  _id?: Types.ObjectId;
  bikeId: Types.ObjectId;
  type: DocumentType;
  title?: string; // required for OTHER — lets user label what the document is
  issueDate?: Date;
  expiryDate: Date;
  // insurance-only
  policyNumber?: string;
  company?: string;
  insuredAmount?: number;
  // puc / rc / other
  certificateNumber?: string;
}

const documentSchema = new Schema<IDocument>(
  {
    bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
    type: { type: String, enum: Object.values(DocumentType), required: true },
    title: String,
    issueDate: Date,
    expiryDate: { type: Date, required: true, index: true },
    policyNumber: String,
    company: String,
    insuredAmount: Number,
    certificateNumber: String,
  },
  { timestamps: true }
);

// one Insurance/PUC/RC per bike — OTHER is excluded so multiple are allowed
documentSchema.index(
  { bikeId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: { $ne: 'OTHER' } } }
);

export const Document = model<IDocument>('Document', documentSchema);