
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Merchant, LeadStatus, NoteEntry, DocumentStatusType, DocumentTypeType } from '../types';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { ROUTES, LEAD_STATUS_OPTIONS, DOCUMENT_STATUS_OPTIONS, DOCUMENT_TYPE_OPTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface MerchantFormProps {
  initialData?: Merchant; 
  onSubmit: (formData: MerchantFormData, newNoteText?: string) => void; 
}

export type MerchantFormData = Omit<Merchant, 'id' | 'agentId' | 'notes'> & {
    newNoteText?: string; 
};

const getDefaultFormData = (): MerchantFormData => ({
  creationDate: new Date().toISOString().split('T')[0], 
  merchantName: '',
  businessName: '',
  mainPhoneNumber: '',
  secondaryPhoneNumber: '',
  email: '',
  monthlyRevenue: 0,
  amountLookingFor: 0,
  
  hasDefaults: false, 
  numberOfDefaults: undefined,
  defaultsDescription: undefined,

  numberOfPositions: 0,
  positionBalances: '',
  location: '',
  status: 'Needs follow-up' as LeadStatus, 
  callbackDate: '',
  callbackTime: '',
  newNoteText: '',

  // New document fields
  documentStatus: 'No Documents Received' as DocumentStatusType,
  documentType: 'Bank Statements' as DocumentTypeType,
  documentNotes: '',
});

export const MerchantForm: React.FC<MerchantFormProps> = ({ initialData, onSubmit }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!initialData; 

  const [formData, setFormData] = useState<MerchantFormData>(() => {
    if (initialData) { 
      const { notes, creationDate, ...restData } = initialData;
      return {
        ...getDefaultFormData(), 
        ...restData,             
        creationDate: creationDate || getDefaultFormData().creationDate, 
        newNoteText: '',
        hasDefaults: initialData.hasDefaults,
        numberOfDefaults: initialData.numberOfDefaults,
        defaultsDescription: initialData.defaultsDescription,
        // Map new document fields from initialData
        documentStatus: initialData.documentStatus || 'No Documents Received',
        documentType: initialData.documentType || 'Bank Statements',
        documentNotes: initialData.documentNotes || '',
      };
    }
    return getDefaultFormData(); 
  });

  const [existingNotes, setExistingNotes] = useState<NoteEntry[]>(initialData?.notes || []);
  
  const currentEditingMerchantIdRef = useRef<string | undefined>(initialData?.id);

  useEffect(() => {
    if (initialData) { 
      if (initialData.id !== currentEditingMerchantIdRef.current) {
        const { notes, creationDate, ...restData } = initialData;
        setFormData({
          ...getDefaultFormData(),
          ...restData,
          creationDate: creationDate || getDefaultFormData().creationDate,
          newNoteText: '',
          hasDefaults: initialData.hasDefaults,
          numberOfDefaults: initialData.numberOfDefaults,
          defaultsDescription: initialData.defaultsDescription,
          documentStatus: initialData.documentStatus || 'No Documents Received',
          documentType: initialData.documentType || 'Bank Statements',
          documentNotes: initialData.documentNotes || '',
        });
        setExistingNotes(notes || []);
        currentEditingMerchantIdRef.current = initialData.id;
      } else {
        setExistingNotes(initialData.notes || []);
        // If specific fields like status or document status changed externally, update them
        if (initialData.status !== formData.status) {
          setFormData(prev => ({ ...prev, status: initialData.status }));
        }
        if (initialData.hasDefaults !== formData.hasDefaults || 
            initialData.numberOfDefaults !== formData.numberOfDefaults ||
            initialData.defaultsDescription !== formData.defaultsDescription ||
            initialData.documentStatus !== formData.documentStatus ||
            initialData.documentType !== formData.documentType ||
            initialData.documentNotes !== formData.documentNotes
          ) {
            setFormData(prev => ({ 
                ...prev, 
                hasDefaults: initialData.hasDefaults,
                numberOfDefaults: initialData.numberOfDefaults,
                defaultsDescription: initialData.defaultsDescription,
                documentStatus: initialData.documentStatus,
                documentType: initialData.documentType,
                documentNotes: initialData.documentNotes || '', 
            }));
        }
      }
    } else { 
      if (currentEditingMerchantIdRef.current !== undefined) {
        setFormData(getDefaultFormData());
        setExistingNotes([]);
        currentEditingMerchantIdRef.current = undefined; 
      }
    }
  }, [initialData, formData.status, formData.hasDefaults, formData.numberOfDefaults, formData.defaultsDescription, formData.documentStatus, formData.documentType, formData.documentNotes]); 


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: checked,
            ...(name === 'hasDefaults' && !checked && { numberOfDefaults: undefined, defaultsDescription: undefined })
        }));
    } else if (type === 'number') {
        setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'numberOfDefaults') { 
        setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseInt(value,10) }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.hasDefaults) {
        if (formData.numberOfDefaults === undefined || formData.numberOfDefaults <=0) {
            alert("Number of defaults must be a positive integer if 'Has Defaults' is selected.");
            return;
        }
        if (!formData.defaultsDescription?.trim()) {
            alert("Defaults description is required if 'Has Defaults' is selected.");
            return;
        }
    }

    const dataToSubmit: MerchantFormData = { 
        ...formData,   
        numberOfDefaults: formData.hasDefaults ? formData.numberOfDefaults : undefined,
        defaultsDescription: formData.hasDefaults ? formData.defaultsDescription : undefined,
        documentNotes: formData.documentNotes?.trim() || '',
    };
        
    onSubmit(dataToSubmit, formData.newNoteText?.trim());
  };
  
  const FormSection: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-background p-6 rounded-lg shadow-md mb-8 border border-border ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      
      <FormSection title="Lead Information">
        <Input label="Merchant Name *" name="merchantName" id="merchantName" value={formData.merchantName} onChange={handleChange} required />
        <Input label="Business Name *" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} required />
        <Select label="Status *" name="status" id="status" value={formData.status} onChange={handleChange} options={LEAD_STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))} required />
        <Input label="Main Phone Number *" name="mainPhoneNumber" id="mainPhoneNumber" type="tel" value={formData.mainPhoneNumber} onChange={handleChange} required />
        <Input label="Secondary Phone (Optional)" name="secondaryPhoneNumber" id="secondaryPhoneNumber" type="tel" value={formData.secondaryPhoneNumber || ''} onChange={handleChange} />
        <Input label="Email *" name="email" id="email" type="email" value={formData.email} onChange={handleChange} required />
        <Input label="Location (City, State) *" name="location" id="location" value={formData.location} onChange={handleChange} required />
        
        {isEditMode && initialData && ( 
          <div className="mt-0"> 
            <label htmlFor="creationDateDisplay" className="block text-sm font-medium text-gray-700 mb-1">Creation Date</label>
            <p id="creationDateDisplay" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm">
              {new Date(initialData.creationDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </FormSection>

      <FormSection title="Funding & Financials">
        <Input label="Amount Looking For ($) *" name="amountLookingFor" id="amountLookingFor" type="number" value={formData.amountLookingFor.toString()} onChange={handleChange} required />
        <Input label="Monthly Revenue ($) *" name="monthlyRevenue" id="monthlyRevenue" type="number" value={formData.monthlyRevenue.toString()} onChange={handleChange} required />
        <Input label="Number of Positions *" name="numberOfPositions" id="numberOfPositions" type="number" value={formData.numberOfPositions.toString()} onChange={handleChange} required />
        <Input label="Position Balances *" name="positionBalances" id="positionBalances" value={formData.positionBalances} onChange={handleChange} required />
      </FormSection>

      <FormSection title="Defaults">
        <div className="md:col-span-2 mt-2">
          <Checkbox label="Has Defaults?" name="hasDefaults" id="hasDefaults" checked={formData.hasDefaults} onChange={handleChange} />
        </div>
        {formData.hasDefaults && (
          <>
            <Input label="Number of Defaults *" name="numberOfDefaults" id="numberOfDefaults" type="number" value={formData.numberOfDefaults?.toString() || ''} onChange={handleChange} required min="1" step="1"/>
            <Textarea label="Defaults Description *" name="defaultsDescription" id="defaultsDescription" value={formData.defaultsDescription || ''} onChange={handleChange} required className="md:col-span-2"/>
          </>
        )}
      </FormSection>
      
      <FormSection title="Callback">
        <Input label="Callback Date (Optional)" type="date" name="callbackDate" id="callbackDate" value={formData.callbackDate || ''} onChange={handleChange} />
        <Input label="Callback Time (Optional)" type="time" name="callbackTime" id="callbackTime" value={formData.callbackTime || ''} onChange={handleChange} />
      </FormSection>

      <FormSection title="Document Management">
        <Select 
            label="Document Status *" 
            name="documentStatus" 
            id="documentStatus" 
            value={formData.documentStatus} 
            onChange={handleChange} 
            options={DOCUMENT_STATUS_OPTIONS} 
            required 
        />
        <Select 
            label="Primary Document Type *" 
            name="documentType" 
            id="documentType" 
            value={formData.documentType} 
            onChange={handleChange} 
            options={DOCUMENT_TYPE_OPTIONS} 
            required 
        />
        <Textarea 
            label="Document Notes (Optional)" 
            name="documentNotes" 
            id="documentNotes" 
            value={formData.documentNotes || ''} 
            onChange={handleChange} 
            className="md:col-span-2"
            placeholder="e.g., Client sent 3 months, missing May. Follow-up Friday."
        />
      </FormSection>


      <FormSection title="Notes">
        {isEditMode && existingNotes.length > 0 && (
            <div className="md:col-span-2 mb-2 max-h-60 overflow-y-auto bg-gray-100 p-3 rounded border border-gray-300">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Note History:</h4>
            {existingNotes.slice().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((note) => (
                <div key={note.id} className="mb-2 p-2.5 border border-gray-200 rounded text-sm bg-white">
                <p className="text-gray-800">{note.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.timestamp).toLocaleString()} by Agent {note.agentId === currentUser?.id ? currentUser?.username : note.agentId}
                </p>
                </div>
            ))}
            </div>
        )}
       <Textarea
        label={isEditMode ? "Add New Note (Optional)" : "Initial Note (Optional)"}
        name="newNoteText"
        id="newNoteText"
        value={formData.newNoteText || ''}
        onChange={handleChange}
        placeholder="Enter new note here..."
        className="md:col-span-2"
      />
      </FormSection>
       
      {isEditMode && initialData && (
        <div className="bg-background p-6 rounded-lg shadow-md mb-8 border border-border">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">Lead Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                 <p className="text-sm text-gray-700"><span className="font-medium text-gray-800">Lead ID:</span> {initialData.id}</p>
                 <p className="text-sm text-gray-700"><span className="font-medium text-gray-800">Agent ID:</span> {initialData.agentId}</p>
            </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-6 mt-2 pb-4">
        <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEditMode ? "Save Changes" : "Add Lead"}
        </Button>
      </div>
    </form>
  );
};
