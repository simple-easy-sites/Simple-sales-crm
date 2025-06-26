

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMerchants } from '../hooks/useMerchants';
import { useQuickNotes } from '../hooks/useQuickNotes'; 
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ROUTES, LEAD_STATUS_OPTIONS, DOCUMENT_STATUS_OPTIONS, DOCUMENT_TYPE_OPTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { LeadStatus, Merchant, DocumentStatusType, DocumentTypeType } from '../types';
import { Checkbox } from '../components/ui/Checkbox';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';

interface LocationState {
  quickNoteText?: string;
  quickNoteId?: string;
}

export const AddLeadMerchantPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addMerchant, isLoading } = useMerchants();
  const { updateQuickNoteStatus } = useQuickNotes(); 
  const { currentUser } = useAuth();

  const locationState = location.state as LocationState | null;
  
  // Lead Information
  const [merchantName, setMerchantName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [status, setStatus] = useState<LeadStatus>('Needs follow-up');
  const [mainPhoneNumber, setMainPhoneNumber] = useState('');
  const [secondaryPhoneNumber, setSecondaryPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [locationText, setLocationText] = useState(''); 

  // Funding & Financials
  const [amountLookingFor, setAmountLookingFor] = useState('0');
  const [monthlyRevenue, setMonthlyRevenue] = useState('0');
  const [numberOfPositions, setNumberOfPositions] = useState('0');
  const [positionBalances, setPositionBalances] = useState('');
  
  // Defaults
  const [hasDefaults, setHasDefaults] = useState(false);
  const [numberOfDefaults, setNumberOfDefaults] = useState('');
  const [defaultsDescription, setDefaultsDescription] = useState('');

  // Callback
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');

  // New Document Fields
  const [documentStatus, setDocumentStatus] = useState<DocumentStatusType>('No Documents Received');
  const [documentType, setDocumentType] = useState<DocumentTypeType>('Bank Statements');
  const [documentNotes, setDocumentNotes] = useState('');
  
  // Notes
  const [initialNote, setInitialNote] = useState('');
  
  const [error, setError] = useState('');

  useEffect(() => {
    if (locationState?.quickNoteText) {
      setInitialNote(locationState.quickNoteText);
    }
  }, [locationState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("User not authenticated.");
      return;
    }
    if (!merchantName.trim()) { setError("Merchant name cannot be empty."); return; }
    if (!mainPhoneNumber.trim()) { setError("Main phone number cannot be empty."); return; }
    if (!email.trim()) { setError("Email cannot be empty."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!locationText.trim()) { setError("Location cannot be empty."); return; }

    const parsedAmountLookingFor = parseFloat(amountLookingFor);
    if (isNaN(parsedAmountLookingFor) || parsedAmountLookingFor < 0) { setError("Amount Looking For must be a valid positive number."); return; }
    
    const parsedMonthlyRevenue = parseFloat(monthlyRevenue);
    
    const parsedNumberOfPositions = parseInt(numberOfPositions, 10);
    if (isNaN(parsedNumberOfPositions) || parsedNumberOfPositions < 0) { setError("Number of Positions must be a valid positive integer."); return; }
    
    if (!positionBalances.trim()) { setError("Position Balances cannot be empty."); return; }

    let parsedNumberOfDefaults: number | undefined = undefined;
    if (hasDefaults) {
        if (!numberOfDefaults.trim()) { setError("Number of defaults is required if 'Has Defaults' is Yes."); return;}
        parsedNumberOfDefaults = parseInt(numberOfDefaults, 10);
        if (isNaN(parsedNumberOfDefaults) || parsedNumberOfDefaults <= 0) { setError("Number of defaults must be a positive integer."); return; }
        if (!defaultsDescription.trim()) { setError("Defaults description is required if 'Has Defaults' is Yes."); return; }
    }

    setError('');

    const merchantPayload: Omit<Merchant, 'id' | 'agentId' | 'notes'> & { latestNotes?: string } = {
      merchantName: merchantName.trim(),
      businessName: businessName.trim(),
      status: status,
      mainPhoneNumber: mainPhoneNumber.trim(),
      secondaryPhoneNumber: secondaryPhoneNumber.trim() || undefined,
      email: email.trim(),
      location: locationText.trim(),
      creationDate: new Date().toISOString().split('T')[0],
      monthlyRevenue: isNaN(parsedMonthlyRevenue) ? 0 : parsedMonthlyRevenue,
      
      amountLookingFor: parsedAmountLookingFor,
      numberOfPositions: parsedNumberOfPositions,
      positionBalances: positionBalances.trim(),
      
      hasDefaults: hasDefaults,
      numberOfDefaults: parsedNumberOfDefaults,
      defaultsDescription: hasDefaults ? defaultsDescription.trim() : undefined,

      callbackDate: callbackDate || undefined,
      callbackTime: callbackTime || undefined,
      
      documentStatus: documentStatus,
      documentType: documentType,
      documentNotes: documentNotes.trim() || undefined,
      
      latestNotes: initialNote.trim() || undefined,
    };

    const newMerchant = await addMerchant(merchantPayload);
    if (newMerchant && newMerchant.id) { // Check for newMerchant and newMerchant.id
      if (locationState?.quickNoteId) {
        updateQuickNoteStatus(locationState.quickNoteId, 'converted', newMerchant.id);
      }
      navigate(ROUTES.DASHBOARD);
    } else {
      setError("Failed to add lead. Please try again.");
    }
  };

  const formSectionTitleClass = "text-xl font-semibold text-gray-800 pt-4 pb-1 border-b border-gray-300";

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-background p-6 sm:p-8 rounded-lg shadow-xl border border-border">
        <div className="mb-6 pb-4 border-b border-gray-300">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Lead</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}
          
          <h2 className={formSectionTitleClass}>Lead Information</h2>
          <Input label="Merchant Name *" id="merchantName" name="merchantName" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} required autoFocus />
          <Input label="Business Name (Optional)" id="businessName" name="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <Select label="Status *" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} options={LEAD_STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))} required />
          <Input label="Main Phone Number *" id="mainPhoneNumber" name="mainPhoneNumber" type="tel" value={mainPhoneNumber} onChange={(e) => setMainPhoneNumber(e.target.value)} required />
          <Input label="Secondary Phone (Optional)" id="secondaryPhoneNumber" name="secondaryPhoneNumber" type="tel" value={secondaryPhoneNumber} onChange={(e) => setSecondaryPhoneNumber(e.target.value)} />
          <Input label="Email *" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Location (City, State) *" id="locationText" name="locationText" value={locationText} onChange={(e) => setLocationText(e.target.value)} required />

          <h2 className={formSectionTitleClass}>Funding & Financials</h2>
          <Input label="Amount Looking For ($) *" id="amountLookingFor" name="amountLookingFor" type="number" value={amountLookingFor} onChange={(e) => setAmountLookingFor(e.target.value)} required min="0" />
          <Input label="Monthly Revenue ($) (Optional)" id="monthlyRevenue" name="monthlyRevenue" type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} min="0" />
          <Input label="Number of Positions *" id="numberOfPositions" name="numberOfPositions" type="number" value={numberOfPositions} onChange={(e) => setNumberOfPositions(e.target.value)} required min="0" step="1" />
          <Input label="Position Balances *" id="positionBalances" name="positionBalances" value={positionBalances} onChange={(e) => setPositionBalances(e.target.value)} required />
          
          <h2 className={formSectionTitleClass}>Defaults</h2>
          <Checkbox label="Has Defaults?" id="hasDefaults" name="hasDefaults" checked={hasDefaults} onChange={(e) => setHasDefaults(e.target.checked)} />
          {hasDefaults && (
            <>
              <Input label="How many defaults? *" id="numberOfDefaults" name="numberOfDefaults" type="number" value={numberOfDefaults} onChange={(e) => setNumberOfDefaults(e.target.value)} required min="1" step="1" />
              <Textarea label="Defaults Description *" id="defaultsDescription" name="defaultsDescription" value={defaultsDescription} onChange={(e) => setDefaultsDescription(e.target.value)} required />
            </>
          )}

          <h2 className={formSectionTitleClass}>Callback</h2>
          <Input label="Callback Date (Optional)" id="callbackDate" name="callbackDate" type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} />
          <Input label="Callback Time (Optional)" id="callbackTime" name="callbackTime" type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} />

          <h2 className={formSectionTitleClass}>Document Management</h2>
          <Select 
            label="Document Status *" 
            id="documentStatus" 
            name="documentStatus" 
            value={documentStatus} 
            onChange={(e) => setDocumentStatus(e.target.value as DocumentStatusType)} 
            options={DOCUMENT_STATUS_OPTIONS} 
            required 
          />
          <Select 
            label="Primary Document Type *" 
            id="documentType" 
            name="documentType" 
            value={documentType} 
            onChange={(e) => setDocumentType(e.target.value as DocumentTypeType)} 
            options={DOCUMENT_TYPE_OPTIONS} 
            required 
          />
          <Textarea 
            label="Document Notes (Optional)" 
            id="documentNotes" 
            name="documentNotes" 
            value={documentNotes} 
            onChange={(e) => setDocumentNotes(e.target.value)}
            placeholder="e.g., Client to send 3 months of bank statements by EOD." 
          />
          
          <h2 className={formSectionTitleClass}>Notes</h2>
          <Textarea label="Initial Note (Optional)" id="initialNote" name="initialNote" value={initialNote} onChange={(e) => setInitialNote(e.target.value)} />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>Save Lead</Button>
          </div>
        </form>
        {isLoading && <div className="text-center mt-4 p-4 bg-primary-50 text-primary-700 rounded-md">Adding lead...</div>}
      </div>
    </div>
  );
};
