
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMerchants } from '../hooks/useMerchants';
import { Merchant, Filters, LeadStatus, NoteEntry, DocumentStatusType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select as UiSelect } from '../components/ui/Select';
import { ROUTES, LEAD_STATUS_OPTIONS, getStatusColorClasses, DOCUMENT_STATUS_OPTIONS } from '../constants';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/AuthContext';
import { QuickNoteInputModal } from '../components/QuickNoteInputModal'; 

// --- Icons ---
const PlusIcon: React.FC<{}> = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const CalendarDaysIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-1 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 16.5h.008v.008H12v-.008Z" /></svg>;
const ClockIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-1 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
// CurrencyDollarIcon is no longer used directly in this file for widget amounts, but kept for general availability if needed elsewhere.
const CurrencyDollarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-1 ${className || 'text-gray-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536.219-2.121.727H12M4.5 12.75a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 0 1 15 0" /></svg>;
const ExclamationTriangleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className || 'text-gray-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const DocumentCheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className || 'text-gray-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const ArrowTrendingUpIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-1 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>;
const ListBulletIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-1 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const TableCellsIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-1 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>;
const ChevronUpIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>;
const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;
const FunnelIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>;
const PencilSquareIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className || 'text-primary-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;


interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant;
  onSave: (merchantId: string, noteText: string, callbackDate?: string, callbackTime?: string, status?: LeadStatus) => void;
}

const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ isOpen, onClose, merchant, onSave }) => {
  const [noteText, setNoteText] = useState('');
  const [callbackDate, setCallbackDate] = useState(merchant.callbackDate || '');
  const [callbackTime, setCallbackTime] = useState(merchant.callbackTime || '');
  const [status, setStatus] = useState<LeadStatus>(merchant.status);

  useEffect(() => {
    setNoteText('');
    setCallbackDate(merchant.callbackDate || new Date().toISOString().split('T')[0]);
    setCallbackTime(merchant.callbackTime || '');
    setStatus(merchant.status);
  }, [isOpen, merchant]);

  const handleSave = () => {
    onSave(merchant.id, noteText, callbackDate, callbackTime, status);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Update for ${merchant.merchantName}`} size="xl">
      <div className="space-y-4">
        <Textarea label="New Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Log call details, next steps..." rows={4}/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Set/Update Callback Date" type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)}/>
          <Input label="Set/Update Callback Time" type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)}/>
        </div>
        <UiSelect label="Update Status" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} options={LEAD_STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}/>
        {merchant.notes && merchant.notes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Previous Notes:</h4>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {merchant.notes.slice().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(note => (
                <div key={note.id} className="text-xs p-2 bg-gray-100 rounded border border-gray-200">
                  <p className="text-gray-700">{note.text}</p>
                  <p className="text-gray-500 mt-0.5">{new Date(note.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Update</Button>
      </div>
    </Modal>
  );
};

interface WidgetWrapperProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actionButton?: React.ReactNode; 
  className?: string;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ title, icon, children, actionButton, className }) => {
  return (
    <div className={`bg-background p-4 rounded-lg shadow-lg flex flex-col border border-border ${className}`}>
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300">
        <div className="flex items-center">
          {icon && <span className="mr-2 text-primary-700">{icon}</span>}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {actionButton}
      </div>
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {children}
      </div>
    </div>
  );
};

interface NextCallbacksWidgetProps { merchants: Merchant[]; onOpenNoteModal: (merchant: Merchant) => void; onViewDetails: (merchantId: string) => void; maxItems?: number; }
const NextCallbacksWidget: React.FC<NextCallbacksWidgetProps> = ({ merchants, onOpenNoteModal, onViewDetails, maxItems = 5 }) => {
  const upcomingCallbacks = useMemo(() => {
    const now = new Date();
    return merchants
      .filter(m => m.callbackDate)
      .map(m => {
        const callbackDateTime = new Date(`${m.callbackDate}T${m.callbackTime || '00:00:00'}`);
        return { ...m, callbackDateTime, isOverdue: callbackDateTime < now && m.status !== 'Closed / Funded' && m.status !== 'Defaults / Delayed' };
      })
      .sort((a, b) => a.callbackDateTime.getTime() - b.callbackDateTime.getTime())
      .slice(0, maxItems);
  }, [merchants, maxItems]);

  if (upcomingCallbacks.length === 0) return <p className="text-gray-500 text-sm p-4 text-center">No upcoming callbacks.</p>;
  return (
    <div className="space-y-3">
      {upcomingCallbacks.map(merchant => {
        const statusClasses = getStatusColorClasses(merchant.status);
        return (
          <div key={merchant.id} className={`p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors ${merchant.isOverdue ? 'border-l-4 border-red-500' : 'border-l-4 border-primary-700'}`}>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-primary-700 text-sm cursor-pointer hover:underline" onClick={() => onViewDetails(merchant.id)}>{merchant.merchantName}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses.textColor} ${statusClasses.bgColor}`}>{merchant.status}</span>
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <CalendarDaysIcon className="text-gray-500"/> {new Date(merchant.callbackDateTime).toLocaleDateString()}
              {merchant.callbackTime && <><ClockIcon className="text-gray-500 ml-1"/> {merchant.callbackTime} </>}
            </p>
            {merchant.isOverdue && <p className="text-xs text-red-600 mt-0.5 font-medium">Overdue</p>}
            {merchant.notes && merchant.notes.length > 0 && (<p className="text-xs text-gray-400 truncate italic mt-1">"{merchant.notes[0].text}"</p>)}
            <p className="text-xs text-gray-700 mt-1">Seeking: ${merchant.amountLookingFor.toLocaleString()}</p>
            <div className="mt-2 text-right">
              <Button size="sm" variant="ghost" className="text-primary-700 hover:bg-gray-200 px-2 py-1 text-xs" onClick={() => onOpenNoteModal(merchant)}>Log/Update</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface PipelineOverviewWidgetProps { merchants: Merchant[]; onUpdateMerchantStatus: (merchantId: string, status: LeadStatus) => void; onViewDetails: (merchantId: string) => void;}
const PipelineOverviewWidget: React.FC<PipelineOverviewWidgetProps> = ({ merchants, onUpdateMerchantStatus, onViewDetails }) => {
  const [expandedStatuses, setExpandedStatuses] = useState<Record<string, boolean>>({});

  const toggleExpand = (statusValue: string) => {
    setExpandedStatuses(prev => ({ ...prev, [statusValue]: !prev[statusValue] }));
  };

  const merchantsByStatus = useMemo(() => {
    const grouped: Record<string, Merchant[]> = {};
    LEAD_STATUS_OPTIONS.forEach(opt => grouped[opt.value] = []);
    merchants.forEach(m => {
      if (grouped[m.status]) {
        grouped[m.status].push(m);
      }
    });
    return grouped;
  }, [merchants]);

  const activeStatusOptions = LEAD_STATUS_OPTIONS.filter(statusOption => (merchantsByStatus[statusOption.value] || []).length > 0);

  if (activeStatusOptions.length === 0 && merchants.length > 0) return <p className="text-gray-500 text-sm p-4 text-center">No leads in active pipeline stages.</p>;
  if (merchants.length === 0) return <p className="text-gray-500 text-sm p-4 text-center">No leads in pipeline.</p>;


  return (
    <div className="space-y-1">
      {LEAD_STATUS_OPTIONS.map(statusOption => {
        const leadsInStatus = merchantsByStatus[statusOption.value] || [];
        const count = leadsInStatus.length;
        const isExpanded = expandedStatuses[statusOption.value];

        if (count === 0) {
          return null; 
        }

        return (
          <div key={statusOption.value} className="py-1">
            <button
              onClick={() => toggleExpand(statusOption.value)}
              className="w-full flex justify-between items-center p-2.5 rounded text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border border-gray-300 bg-white"
              aria-expanded={isExpanded}
            >
              <span className="text-sm font-semibold text-gray-800">{statusOption.label}</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-700 mr-2">{count}</span>
                {isExpanded ? <ChevronUpIcon className="text-gray-600" /> : <ChevronDownIcon className="text-gray-600" />}
              </div>
            </button>
            {isExpanded && (
              <div className="mt-1 pl-2 pr-1 py-1 border-l-2 border-gray-300 bg-gray-50 rounded-b-md">
                {leadsInStatus.length > 0 ? (
                  leadsInStatus.map(merchant => (
                    <div key={merchant.id} className="py-2 px-2 my-1 bg-white rounded shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span 
                          className="text-sm text-primary-700 font-medium cursor-pointer hover:underline"
                          onClick={() => onViewDetails(merchant.id)}
                        >
                          {merchant.merchantName}
                        </span>
                        <div className="w-40"> 
                            <UiSelect
                                value={merchant.status}
                                onChange={(e) => onUpdateMerchantStatus(merchant.id, e.target.value as LeadStatus)}
                                options={LEAD_STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                                className="text-xs py-1"
                            />
                        </div>
                      </div>
                       <p className="text-xs text-gray-500 mt-1">
                           Seeking: ${merchant.amountLookingFor.toLocaleString()}
                           {merchant.callbackDate && ` | Callback: ${new Date(merchant.callbackDate + 'T00:00:00').toLocaleDateString()}`}
                       </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 p-2">No leads in this status.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface HighPriorityLeadsWidgetProps { merchants: Merchant[]; onOpenNoteModal: (merchant: Merchant) => void; onViewDetails: (merchantId: string) => void; maxItems?: number; }
const HighPriorityLeadsWidget: React.FC<HighPriorityLeadsWidgetProps> = ({ merchants, onOpenNoteModal, onViewDetails, maxItems = 5 }) => {
  const highValueLeads = useMemo(() => merchants.filter(m => m.status !== 'Closed / Funded' && m.status !== 'Defaults / Delayed').sort((a, b) => b.amountLookingFor - a.amountLookingFor).slice(0, maxItems), [merchants, maxItems]);
  const leadsAtRisk = useMemo(() => merchants.filter(m => m.hasDefaults && m.status !== 'Closed / Funded').slice(0, maxItems), [merchants, maxItems]);

  if (highValueLeads.length === 0 && leadsAtRisk.length === 0) return <p className="text-gray-500 text-sm p-4 text-center">No high priority leads.</p>;
  return (
    <div className="space-y-4">
      {highValueLeads.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Value Opportunities:</h4>
          {highValueLeads.map(merchant => {
            const statusClasses = getStatusColorClasses(merchant.status);
            return (
              <div key={merchant.id} className="p-2.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors mb-2 border-l-4 border-gray-400"> 
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-primary-700 text-sm cursor-pointer hover:underline" onClick={() => onViewDetails(merchant.id)}>{merchant.merchantName}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses.textColor} ${statusClasses.bgColor}`}>{merchant.status}</span>
                </div>
                <p className="text-xs text-gray-700 mt-1">Seeking: ${merchant.amountLookingFor.toLocaleString()}</p>
                <div className="mt-1.5 text-right"><Button size="sm" variant="ghost" className="text-primary-700 hover:bg-gray-200 px-2 py-1 text-xs" onClick={() => onOpenNoteModal(merchant)}>Log/Update</Button></div>
              </div>
            );
          })}
        </div>
      )}
      {leadsAtRisk.length > 0 && (
         <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Leads with Defaults:</h4>
           {leadsAtRisk.map(merchant => {
             const statusClasses = getStatusColorClasses(merchant.status);
             return (
               <div key={merchant.id} className="p-2.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors mb-2 border-l-4 border-gray-500"> 
                <div className="flex justify-between items-start">
                   <h3 className="font-semibold text-primary-800 text-sm cursor-pointer hover:underline" onClick={() => onViewDetails(merchant.id)}>{merchant.merchantName}</h3>
                   <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses.textColor} ${statusClasses.bgColor}`}>{merchant.status}</span>
                </div>
                <p className="text-xs text-gray-700 flex items-center mt-1"><ExclamationTriangleIcon className="text-gray-600 mr-1"/> Has {merchant.numberOfDefaults || ''} Default(s)</p>
                {merchant.defaultsDescription && <p className="text-xs text-gray-600 italic mt-0.5">"{merchant.defaultsDescription}"</p>}
                <p className="text-xs text-gray-700 mt-1">Seeking: ${merchant.amountLookingFor.toLocaleString()}</p>
                <div className="mt-1.5 text-right"><Button size="sm" variant="ghost" className="text-primary-700 hover:bg-gray-200 px-2 py-1 text-xs" onClick={() => onOpenNoteModal(merchant)}>Log/Update</Button></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface LeadsByDocStatusWidgetProps { merchants: Merchant[]; onOpenNoteModal: (merchant: Merchant) => void; onViewDetails: (merchantId: string) => void; maxItems?: number; }
const LeadsByDocStatusWidget: React.FC<LeadsByDocStatusWidgetProps> = ({ merchants, onOpenNoteModal, onViewDetails, maxItems = 5 }) => {
  const leadsWithRelevantDocs = useMemo(() => 
    merchants.filter(m => 
        (m.documentStatus === 'Bank Statements Submitted' || m.documentStatus === 'Partial Docs Received') 
        && m.status !== 'Closed / Funded'
    ).slice(0, maxItems), 
  [merchants, maxItems]);

  if (leadsWithRelevantDocs.length === 0) return <p className="text-gray-500 text-sm p-4 text-center">No leads with recently submitted/partial docs.</p>;
  
  return (
     <div className="space-y-3">
      {leadsWithRelevantDocs.map(merchant => {
        const statusClasses = getStatusColorClasses(merchant.status);
        return (
          <div key={merchant.id} className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 border-gray-400"> 
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-primary-700 text-sm cursor-pointer hover:underline" onClick={() => onViewDetails(merchant.id)}>{merchant.merchantName}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses.textColor} ${statusClasses.bgColor}`}>{merchant.status}</span>
            </div>
            <p className="text-xs text-gray-700 flex items-center mt-1"><DocumentCheckIcon className="text-gray-600 mr-1" /> {merchant.documentStatus} ({merchant.documentType})</p>
            {merchant.documentNotes && <p className="text-xs text-gray-500 italic mt-0.5 truncate">Notes: "{merchant.documentNotes}"</p>}
            <p className="text-xs text-gray-700 mt-1">Seeking: ${merchant.amountLookingFor.toLocaleString()}</p>
            <div className="mt-2 text-right"><Button size="sm" variant="ghost" className="text-primary-700 hover:bg-gray-200 px-2 py-1 text-xs" onClick={() => onOpenNoteModal(merchant)}>Log/Update</Button></div>
          </div>
        );
      })}
    </div>
  );
};

type SortableLeadTableColumn = 'merchantName' | 'businessName' | 'callbackDate' | 'status' | 'amountLookingFor' | 'monthlyRevenue' | 'location' | 'documentStatus' | 'hasDefaults' | 'creationDate';
interface TableSortConfig { key: SortableLeadTableColumn; direction: 'ascending' | 'descending'; }
interface LeadTableProps { merchants: Merchant[]; onRowClick: (merchantId: string) => void; }
const LeadTable: React.FC<LeadTableProps> = ({ merchants, onRowClick }) => {
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<TableSortConfig | null>({ key: 'creationDate', direction: 'descending' });

  const requestSort = (key: SortableLeadTableColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedMerchants = useMemo(() => {
    let sortableItems = [...merchants];
    if (tableSearchTerm) {
      const lower = tableSearchTerm.toLowerCase();
      sortableItems = sortableItems.filter(m => m.merchantName.toLowerCase().includes(lower) || m.businessName.toLowerCase().includes(lower) || m.email.toLowerCase().includes(lower) || m.status.toLowerCase().includes(lower) || m.documentStatus.toLowerCase().includes(lower) || m.location.toLowerCase().includes(lower));
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key as keyof Merchant];
        let valB = b[sortConfig.key as keyof Merchant];
        
        if (sortConfig.key === 'callbackDate' || sortConfig.key === 'creationDate') {
          valA = a[sortConfig.key as 'callbackDate' | 'creationDate'] ? new Date(a[sortConfig.key as 'callbackDate' | 'creationDate']!).getTime() : 0;
          valB = b[sortConfig.key as 'callbackDate' | 'creationDate'] ? new Date(b[sortConfig.key as 'callbackDate' | 'creationDate']!).getTime() : 0;
          if (sortConfig.direction === 'ascending') { if (valA === 0 && valB !== 0) return 1; if (valA !== 0 && valB === 0) return -1; } 
          else { if (valA === 0 && valB !== 0) return 1; if (valA !== 0 && valB === 0) return -1; }
        } else if (sortConfig.key === 'amountLookingFor' || sortConfig.key === 'monthlyRevenue') {
          valA = a[sortConfig.key as 'amountLookingFor' | 'monthlyRevenue'] as number;
          valB = b[sortConfig.key as 'amountLookingFor' | 'monthlyRevenue'] as number;
        } else if (typeof valA === 'string' && typeof valB === 'string') { 
            valA = valA.toLowerCase(); 
            valB = valB.toLowerCase(); 
        } else if (sortConfig.key === 'hasDefaults') { 
            valA = a.hasDefaults ? 1 : 0; 
            valB = b.hasDefaults ? 1 : 0;
        }
        // documentStatus and location are strings, handled by string comparison

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [merchants, tableSearchTerm, sortConfig]);
  
  const SortableHeader: React.FC<{ columnKey: SortableLeadTableColumn; title: string; textAlign?: 'left' | 'center' | 'right' }> = ({ columnKey, title, textAlign = 'left' }) => {
    let alignmentClass = 'text-left';
    if (textAlign === 'center') alignmentClass = 'text-center';
    else if (textAlign === 'right') alignmentClass = 'text-right';
  
    let flexAlignmentClass = 'justify-start';
    if (textAlign === 'center') flexAlignmentClass = 'justify-center';
    else if (textAlign === 'right') flexAlignmentClass = 'justify-end';

    return (
        <th scope="col" className={`px-4 py-3 ${alignmentClass} text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100`} onClick={() => requestSort(columnKey)}>
            <div className={`flex items-center ${flexAlignmentClass}`}>
            {title}
            {sortConfig && sortConfig.key === columnKey && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
            )}
            </div>
        </th>
    );
  };

  return (
    <WidgetWrapper title="All Leads Grid" icon={<TableCellsIcon className="text-gray-700"/>} className="mt-8">
      <div className="mb-4"><Input placeholder="Search in table..." value={tableSearchTerm} onChange={(e) => setTableSearchTerm(e.target.value)} className="w-full sm:w-1/2 lg:w-1/3"/></div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100"><tr>
              <SortableHeader columnKey="merchantName" title="Merchant Name" />
              <SortableHeader columnKey="businessName" title="Business Name" />
              <SortableHeader columnKey="location" title="Location" />
              <SortableHeader columnKey="callbackDate" title="Callback" />
              <SortableHeader columnKey="status" title="Status" />
              <SortableHeader columnKey="amountLookingFor" title="Amt. Looking For ($)" textAlign="right" />
              <SortableHeader columnKey="monthlyRevenue" title="Monthly Rev ($)" textAlign="right" />
              <SortableHeader columnKey="documentStatus" title="Doc Status" />
              <SortableHeader columnKey="hasDefaults" title="Defaults" textAlign="center" />
              <SortableHeader columnKey="creationDate" title="Created" textAlign="right" />
          </tr></thead>
          <tbody className="bg-background divide-y divide-gray-200">
            {filteredAndSortedMerchants.map((merchant) => {
              const statusClasses = getStatusColorClasses(merchant.status);
              return (
                <tr key={merchant.id} onClick={() => onRowClick(merchant.id)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-700 hover:underline">{merchant.merchantName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{merchant.businessName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{merchant.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{merchant.callbackDate ? new Date(merchant.callbackDate + 'T00:00:00').toLocaleDateString() : '-'}{merchant.callbackTime ? ` ${merchant.callbackTime}`: ''}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm"><span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses.bgColor} ${statusClasses.textColor}`}>{merchant.status}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">${merchant.amountLookingFor.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">${merchant.monthlyRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{merchant.documentStatus}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{merchant.hasDefaults ? <ExclamationTriangleIcon className="text-gray-600 inline-block" /> : <span className="text-gray-500">No</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">{new Date(merchant.creationDate).toLocaleDateString()}</td>
                </tr>);})}
          </tbody>
        </table>
      </div>
      {filteredAndSortedMerchants.length === 0 && (<p className="text-center text-gray-500 py-4">No leads match criteria.</p>)}
    </WidgetWrapper>
  );
};

export const DashboardPage: React.FC = () => {
  const { merchants, isLoading, error, updateMerchant } = useMerchants();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({ 
    searchTerm: '', 
    status: 'all', 
    callbackDateStart: '', callbackDateEnd: '',
    fundingAmountMin: '', fundingAmountMax: '',
    numberOfDefaultsMin: '', numberOfDefaultsMax: '',
    creationDateStart: '', creationDateEnd: '',
    documentStatusFilter: 'all',
  });
  
  const [isLogUpdateModalOpen, setIsLogUpdateModalOpen] = useState(false); 
  const [selectedMerchantForLog, setSelectedMerchantForLog] = useState<Merchant | null>(null); 
  const [showFilters, setShowFilters] = useState(false); 
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false); 

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      searchTerm: '', status: 'all', callbackDateStart: '', callbackDateEnd: '',
      fundingAmountMin: '', fundingAmountMax: '', numberOfDefaultsMin: '', numberOfDefaultsMax: '',
      creationDateStart: '', creationDateEnd: '', documentStatusFilter: 'all'
    });
  };

  const globallyFilteredMerchants = useMemo(() => {
    return merchants.filter(merchant => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch = !filters.searchTerm ||
        merchant.merchantName.toLowerCase().includes(searchTermLower) ||
        merchant.businessName.toLowerCase().includes(searchTermLower) ||
        merchant.email.toLowerCase().includes(searchTermLower) ||
        merchant.location.toLowerCase().includes(searchTermLower);

      const matchesStatus = filters.status === 'all' || merchant.status === filters.status;

      const matchesCallbackDate = (!filters.callbackDateStart || (merchant.callbackDate && merchant.callbackDate >= filters.callbackDateStart)) &&
                                  (!filters.callbackDateEnd || (merchant.callbackDate && merchant.callbackDate <= filters.callbackDateEnd));
      
      const fundingMin = parseFloat(filters.fundingAmountMin || '0');
      const fundingMax = parseFloat(filters.fundingAmountMax || Number.MAX_SAFE_INTEGER.toString());
      const matchesFunding = merchant.amountLookingFor >= fundingMin && merchant.amountLookingFor <= fundingMax;

      const defaultsMin = parseInt(filters.numberOfDefaultsMin || '0', 10);
      const defaultsMax = parseInt(filters.numberOfDefaultsMax || Number.MAX_SAFE_INTEGER.toString(), 10);
      const matchesDefaults = (!merchant.hasDefaults && defaultsMin === 0 && (filters.numberOfDefaultsMax === '' || defaultsMax === Number.MAX_SAFE_INTEGER)) || 
                              (merchant.hasDefaults && (merchant.numberOfDefaults || 0) >= defaultsMin && (merchant.numberOfDefaults || 0) <= defaultsMax) ||
                              (!filters.numberOfDefaultsMin && !filters.numberOfDefaultsMax); 
      
      const matchesCreationDate = (!filters.creationDateStart || merchant.creationDate >= filters.creationDateStart) &&
                                  (!filters.creationDateEnd || merchant.creationDate <= filters.creationDateEnd);
      
      const matchesDocStatus = filters.documentStatusFilter === 'all' || merchant.documentStatus === filters.documentStatusFilter;

      return matchesSearch && matchesStatus && matchesCallbackDate && matchesFunding && matchesDefaults && matchesCreationDate && matchesDocStatus;
    });
  }, [merchants, filters]);

  const handleOpenLogUpdateModal = (merchant: Merchant) => { setSelectedMerchantForLog(merchant); setIsLogUpdateModalOpen(true); };
  const handleSaveLogUpdate = (merchantId: string, noteText: string, callbackDate?: string, callbackTime?: string, status?: LeadStatus) => {
    if (!currentUser) return;
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return;
    let updatedMerchantData = { ...merchant };
    if (noteText.trim()) {
      const newNote: NoteEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), text: noteText.trim(), agentId: currentUser.id };
      updatedMerchantData.notes = [newNote, ...(updatedMerchantData.notes || [])];
    }
    updatedMerchantData.callbackDate = callbackDate || undefined;
    updatedMerchantData.callbackTime = callbackTime || undefined;
    if (status) updatedMerchantData.status = status;
    updateMerchant(updatedMerchantData);
    setIsLogUpdateModalOpen(false);
  };
  const handleViewDetails = (merchantId: string) => navigate(`${ROUTES.MERCHANT_DETAIL.replace(':id', merchantId)}`);

  const handlePipelineStatusUpdate = (merchantId: string, newStatus: LeadStatus) => {
    const merchant = merchants.find(m => m.id === merchantId);
    if (merchant) {
      updateMerchant({ ...merchant, status: newStatus });
    }
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  const statusFilterOptions = [{ value: 'all', label: 'All Lead Statuses' }, ...LEAD_STATUS_OPTIONS];
  const documentStatusFilterOptions = [{ value: 'all' as const, label: 'All Document Statuses' }, ...DOCUMENT_STATUS_OPTIONS];


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <div className="flex space-x-3">
           <Button variant="secondary" size="md" onClick={() => setIsQuickNoteModalOpen(true)}>
            <PencilSquareIcon className="text-gray-700"/> <span className="ml-2">Quick Note</span>
          </Button>
          <Button variant="secondary" size="md" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="text-gray-700"/> <span className="ml-2">Filters</span>
          </Button>
          <Link to={ROUTES.ADD_MERCHANT}>
            <Button variant="primary" size="md"><PlusIcon /> <span className="ml-2">Add New Lead</span></Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 p-4 bg-background rounded-lg shadow-md border border-border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Global Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            <Input name="searchTerm" placeholder="Search name, business, email, location..." value={filters.searchTerm} onChange={handleFilterChange} label="Global Search"/>
            <UiSelect name="status" value={filters.status || 'all'} onChange={handleFilterChange} options={statusFilterOptions} label="Lead Status"/>
            <UiSelect name="documentStatusFilter" value={filters.documentStatusFilter || 'all'} onChange={handleFilterChange} options={documentStatusFilterOptions} label="Document Status"/>
            <Input name="callbackDateStart" type="date" value={filters.callbackDateStart} onChange={handleFilterChange} label="Callback After"/>
            <Input name="callbackDateEnd" type="date" value={filters.callbackDateEnd} onChange={handleFilterChange} label="Callback Before"/>
            <Input name="fundingAmountMin" type="number" placeholder="Min Amount" value={filters.fundingAmountMin} onChange={handleFilterChange} label="Funding Amount Min ($)"/>
            <Input name="fundingAmountMax" type="number" placeholder="Max Amount" value={filters.fundingAmountMax} onChange={handleFilterChange} label="Funding Amount Max ($)"/>
            <Input name="numberOfDefaultsMin" type="number" placeholder="Min Defaults" value={filters.numberOfDefaultsMin} onChange={handleFilterChange} label="Min Defaults"/>
            <Input name="numberOfDefaultsMax" type="number" placeholder="Max Defaults" value={filters.numberOfDefaultsMax} onChange={handleFilterChange} label="Max Defaults"/>
            <Input name="creationDateStart" type="date" value={filters.creationDateStart} onChange={handleFilterChange} label="Lead Created After"/>
            <Input name="creationDateEnd" type="date" value={filters.creationDateEnd} onChange={handleFilterChange} label="Lead Created Before"/>
            <div className="md:col-span-1 flex items-end"> 
               <Button onClick={clearFilters} variant="secondary" className="w-full sm:w-auto">Clear Filters</Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6"><WidgetWrapper title="Next Callbacks" icon={<CalendarDaysIcon className="text-gray-700"/>} className="max-h-[500px] xl:max-h-[600px]"><NextCallbacksWidget merchants={globallyFilteredMerchants} onOpenNoteModal={handleOpenLogUpdateModal} onViewDetails={handleViewDetails}/></WidgetWrapper></div>
        <div className="lg:col-span-1 space-y-6"><WidgetWrapper title="Pipeline Overview" icon={<ListBulletIcon className="text-gray-700"/>} className="max-h-[600px] xl:max-h-[700px]"><PipelineOverviewWidget merchants={globallyFilteredMerchants} onUpdateMerchantStatus={handlePipelineStatusUpdate} onViewDetails={handleViewDetails}/></WidgetWrapper><WidgetWrapper title="Key Document Statuses" icon={<DocumentCheckIcon className="text-gray-700"/>} className="max-h-[400px] xl:max-h-[500px] mt-6"><LeadsByDocStatusWidget merchants={globallyFilteredMerchants} onOpenNoteModal={handleOpenLogUpdateModal} onViewDetails={handleViewDetails}/></WidgetWrapper></div>
        <div className="lg:col-span-1 space-y-6"><WidgetWrapper title="High Priority Leads" icon={<ArrowTrendingUpIcon className="text-gray-700"/>} className="max-h-[calc(1000px-env(safe-area-inset-bottom))]"><HighPriorityLeadsWidget merchants={globallyFilteredMerchants} onOpenNoteModal={handleOpenLogUpdateModal} onViewDetails={handleViewDetails}/></WidgetWrapper></div>
      </div>

      <div className="mt-12"><LeadTable merchants={globallyFilteredMerchants} onRowClick={handleViewDetails} /></div>
      
      {selectedMerchantForLog && (<QuickNoteModal isOpen={isLogUpdateModalOpen} onClose={() => setIsLogUpdateModalOpen(false)} merchant={selectedMerchantForLog} onSave={handleSaveLogUpdate}/>)}
      <QuickNoteInputModal isOpen={isQuickNoteModalOpen} onClose={() => setIsQuickNoteModalOpen(false)} />
    </div>
  );
};

declare global { interface Window { tailwind: any; } }
