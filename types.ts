
import { LEAD_STATUS_VALUES } from './constants';

export type LeadStatus = typeof LEAD_STATUS_VALUES[number];

export type DocumentStatusType = 'Bank Statements Submitted' | 'Waiting on Documents' | 'Partial Docs Received' | 'No Documents Received';
export type DocumentTypeType = 'Bank Statements' | 'Other' | 'Unspecified';

export interface User {
  id: string;
  username: string;
}

export interface NoteEntry {
  id: string;
  timestamp: string; // ISO string
  text: string;
  agentId: string; // ID of the agent who made the note
}

export interface Merchant {
  id: string;
  agentId: string;
  creationDate: string; // YYYY-MM-DD
  merchantName: string;
  businessName: string;
  mainPhoneNumber: string;
  secondaryPhoneNumber?: string;
  email: string;
  monthlyRevenue: number;
  amountLookingFor: number;
  
  hasDefaults: boolean;
  numberOfDefaults?: number;
  defaultsDescription?: string;

  numberOfPositions: number;
  positionBalances: string;
  location: string;
  
  // New document status fields
  documentStatus: DocumentStatusType;
  documentType: DocumentTypeType;
  documentNotes?: string;
  // documentsSubmitted: string[]; // Removed

  notes: NoteEntry[]; 
  status: LeadStatus;
  callbackDate?: string; // YYYY-MM-DD
  callbackTime?: string; // HH:MM
}

export type KanbanSortKey = 'callbackDate' | 'amountLookingFor' | 'creationDate';

export interface KanbanSortConfig {
  key: KanbanSortKey;
  direction: 'ascending' | 'descending';
}

export interface Filters {
  searchTerm: string; // For merchant name, business name
  status?: LeadStatus | 'all';
  callbackDateStart?: string;
  callbackDateEnd?: string;
  fundingAmountMin?: string; 
  fundingAmountMax?: string; 
  numberOfDefaultsMin?: string; 
  numberOfDefaultsMax?: string; 
  creationDateStart?: string;
  creationDateEnd?: string;
  documentStatusFilter?: DocumentStatusType | 'all'; // Updated filter
}

export interface QuickNote {
  id: string;
  agentId: string;
  text: string;
  createdAt: string; // ISO string
  status: 'pending' | 'converting' | 'converted'; 
  convertedLeadId?: string; 
}
