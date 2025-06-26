// In a real app, passwords would be hashed and stored securely, not hardcoded.
// export const HARDCODED_USERS = [ // No longer needed, Supabase handles users
//   { id: 'agent1', username: 'agent1', password: 'password123' },
//   { id: 'agent2', username: 'agent2', password: 'password456' },
// ];

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ADD_MERCHANT: '/add-merchant', 
  MERCHANT_DETAIL: '/merchants/:id', 
};

// export const LOCAL_STORAGE_KEYS = { // No longer needed
//   AUTH_USER: 'crm_auth_user',
//   MERCHANTS: 'crm_merchants',
//   QUICK_NOTES: 'crm_quick_notes', 
// };

export const LEAD_STATUS_OPTIONS = [
  { value: 'Needs follow-up', label: 'Needs follow-up', textColor: 'text-status-needs-follow-up-text', bgColor: 'bg-status-needs-follow-up-bg' },
  { value: 'Emailed for Docs', label: 'Emailed for Docs', textColor: 'text-status-emailed-for-docs-text', bgColor: 'bg-status-emailed-for-docs-bg' },
  { value: 'Awaiting Callback', label: 'Awaiting Callback', textColor: 'text-status-awaiting-callback-text', bgColor: 'bg-status-awaiting-callback-bg' },
  { value: 'In progress / Closing', label: 'In progress / Closing', textColor: 'text-status-in-progress-text', bgColor: 'bg-status-in-progress-bg' },
  { value: 'Docs submitted', label: 'Docs submitted', textColor: 'text-status-docs-submitted-text', bgColor: 'bg-status-docs-submitted-bg' }, // This label might be confusing now, consider revising if UI depends on it for something other than badge
  { value: 'Ready to Close', label: 'Ready to Close', textColor: 'text-status-ready-to-close-text', bgColor: 'bg-status-ready-to-close-bg' },
  { value: 'Closed / Funded', label: 'Closed / Funded', textColor: 'text-status-closed-funded-text', bgColor: 'bg-status-closed-funded-bg' },
  { value: 'Defaults / Delayed', label: 'Defaults / Delayed', textColor: 'text-status-defaults-delayed-text', bgColor: 'bg-status-defaults-delayed-bg' },
] as const;

export const LEAD_STATUS_VALUES = LEAD_STATUS_OPTIONS.map(opt => opt.value);

export const DOCUMENT_STATUS_OPTIONS: { value: import('./types').DocumentStatusType; label: string }[] = [
    { value: 'No Documents Received', label: 'No Documents Received' },
    { value: 'Waiting on Documents', label: 'Waiting on Documents' },
    { value: 'Partial Docs Received', label: 'Partial Docs Received' },
    { value: 'Bank Statements Submitted', label: 'Bank Statements Submitted' },
];
export const DOCUMENT_STATUS_VALUES = DOCUMENT_STATUS_OPTIONS.map(opt => opt.value);


export const DOCUMENT_TYPE_OPTIONS: { value: import('./types').DocumentTypeType; label: string }[] = [
    { value: 'Bank Statements', label: 'Bank Statements' },
    { value: 'Other', label: 'Other' },
    { value: 'Unspecified', label: 'Unspecified' },
];
export const DOCUMENT_TYPE_VALUES = DOCUMENT_TYPE_OPTIONS.map(opt => opt.value);


export const getStatusColorClasses = (status: typeof LEAD_STATUS_VALUES[number] | string): {textColor: string, bgColor: string} => {
  const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? { textColor: option.textColor, bgColor: option.bgColor } : { textColor: 'text-gray-700', bgColor: 'bg-gray-200' };
};
