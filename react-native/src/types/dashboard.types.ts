import { Bike } from './bike.types';
import { DocumentStatus, DocumentType } from './document.types';

export interface ServiceDueInfo {
  lastServiceDate: string | null;
  nextDueKm: number;
  remainingKm: number;
  status: 'normal' | 'due_soon' | 'overdue';
}

export interface ExpenseSummary {
  thisMonth: number;
  total: number;
  breakdown: { fuel: number; service: number; maintenance: number };
}

export interface DashboardDocumentSummary {
  _id: string;
  type: DocumentType;
  title?: string;
  expiryDate: string;
  status: DocumentStatus;
}

export interface BikeDashboard {
  bike: Bike;
  serviceDue: ServiceDueInfo;
  expenses: ExpenseSummary;
  documents: DashboardDocumentSummary[];
}