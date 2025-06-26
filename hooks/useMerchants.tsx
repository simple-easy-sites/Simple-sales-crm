import { useState, useEffect, useCallback } from 'react';
import { Merchant, LeadStatus, NoteEntry, DocumentStatusType, DocumentTypeType } from '../types';
import { useAuth } from '../contexts/AuthContext';
// import { LOCAL_STORAGE_KEYS, LEAD_STATUS_VALUES } from '../constants'; // Removed LOCAL_STORAGE_KEYS
import { LEAD_STATUS_VALUES } from '../constants';
import { supabase } from '../lib/supabaseClient'; // Added

export const useMerchants = () => {
  const { currentUser } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchants = useCallback(async () => {
    if (!currentUser) {
      setMerchants([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('merchants')
        .select('*')
        .eq('agentId', currentUser.id)
        .order('creationDate', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }
      // Ensure notes is always an array, even if null from DB
      const processedData = data.map(merchant => ({
        ...merchant,
        notes: merchant.notes || [], 
      }))
      setMerchants(processedData as Merchant[]);
    } catch (e: any) {
      console.error("Failed to load merchants from Supabase", e);
      setError(`Failed to load merchants: ${e.message}`);
      setMerchants([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);


  const addMerchant = useCallback(async (merchantData: Omit<Merchant, 'id' | 'agentId' | 'notes'> & { latestNotes?: string }) => {
    if (!currentUser) {
      setError("User not authenticated to add merchant.");
      return undefined;
    }
    setIsLoading(true);
    setError(null);
    
    const { latestNotes, ...restOfData } = merchantData;
    const initialNoteText = latestNotes || '';
    const newNotes: NoteEntry[] = [];
    if (initialNoteText) {
      newNotes.push({
        id: Date.now().toString(), // Temporary ID for client-side, Supabase might generate its own for sub-objects if structured
        timestamp: new Date().toISOString(),
        text: initialNoteText,
        agentId: currentUser.id,
      });
    }

    const merchantToInsert = {
      ...restOfData,
      agentId: currentUser.id,
      notes: newNotes, // Ensure notes is an array
      // Default values if not provided
      creationDate: restOfData.creationDate || new Date().toISOString().split('T')[0],
      merchantName: restOfData.merchantName || '',
      businessName: restOfData.businessName || '',
      mainPhoneNumber: restOfData.mainPhoneNumber || '',
      email: restOfData.email || '',
      monthlyRevenue: restOfData.monthlyRevenue || 0,
      amountLookingFor: restOfData.amountLookingFor || 0,
      hasDefaults: restOfData.hasDefaults || false,
      numberOfPositions: restOfData.numberOfPositions || 0,
      positionBalances: restOfData.positionBalances || '',
      location: restOfData.location || '',
      status: restOfData.status || 'Needs follow-up' as LeadStatus,
      documentStatus: restOfData.documentStatus || 'No Documents Received',
      documentType: restOfData.documentType || 'Bank Statements',
      documentNotes: restOfData.documentNotes || '',
    };
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('merchants')
        .insert([merchantToInsert])
        .select();

      if (supabaseError) throw supabaseError;
      
      if (data && data.length > 0) {
        const newMerchant = {...data[0], notes: data[0].notes || [] } as Merchant;
        setMerchants(prev => [newMerchant, ...prev]);
        setIsLoading(false);
        return newMerchant;
      }
      setIsLoading(false);
      return undefined;

    } catch (e: any) {
      console.error("Failed to save merchant to Supabase", e);
      setError(`Failed to save merchant: ${e.message}`);
      setIsLoading(false);
      return undefined;
    }
  }, [currentUser, setIsLoading, setError, setMerchants]);

  const updateMerchant = useCallback(async (updatedMerchantData: Merchant) => {
    if (!currentUser || updatedMerchantData.agentId !== currentUser.id) {
      setError("User not authenticated or permission denied to update merchant.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const merchantToSave: Omit<Merchant, 'id'> & { id: string } = { // id must be present
        ...updatedMerchantData,
        notes: Array.isArray(updatedMerchantData.notes) ? updatedMerchantData.notes : [],
        numberOfDefaults: updatedMerchantData.hasDefaults ? updatedMerchantData.numberOfDefaults : undefined,
        defaultsDescription: updatedMerchantData.hasDefaults ? updatedMerchantData.defaultsDescription : undefined,
        documentStatus: updatedMerchantData.documentStatus || 'No Documents Received',
        documentType: updatedMerchantData.documentType || 'Bank Statements',
        documentNotes: updatedMerchantData.documentNotes || '',
    };
    
    // Supabase typically uses 'id' for primary key. Ensure 'id' is part of merchantToSave for the .eq('id', ...)
    // And ensure we don't try to update 'id' itself in the payload
    const { id, ...updatePayload } = merchantToSave;

    try {
      const { data, error: supabaseError } = await supabase
        .from('merchants')
        .update(updatePayload)
        .eq('id', id)
        .eq('agentId', currentUser.id)
        .select();

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const updatedFromServer = {...data[0], notes: data[0].notes || []} as Merchant;
        setMerchants(prev => prev.map(m => (m.id === updatedFromServer.id ? updatedFromServer : m)));
      }
    } catch (e: any) {
      console.error("Failed to update merchant in Supabase", e);
      setError(`Failed to update merchant: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setIsLoading, setError, setMerchants]);

  const deleteMerchant = useCallback(async (merchantId: string) => {
    if (!currentUser) {
      setError("User not authenticated to delete merchant.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from('merchants')
        .delete()
        .eq('id', merchantId)
        .eq('agentId', currentUser.id);

      if (supabaseError) throw supabaseError;
      setMerchants(prev => prev.filter(m => m.id !== merchantId));
    } catch (e: any) {
      console.error("Failed to delete merchant from Supabase", e);
      setError(`Failed to delete merchant: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setIsLoading, setError, setMerchants]);

  const getMerchantById = useCallback((merchantId: string): Merchant | undefined => {
    if (!currentUser) return undefined;
    return merchants.find((m) => m.id === merchantId && m.agentId === currentUser.id);
  }, [merchants, currentUser]);

  const addNoteToMerchant = useCallback(async (merchantId: string, noteText: string): Promise<Merchant | undefined> => {
    if (!currentUser || !noteText.trim()) {
      setError("User not authenticated or note text is empty.");
      return undefined;
    }
    
    const merchant = getMerchantById(merchantId);
    if (!merchant) {
      setError("Merchant not found to add note.");
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    const newNote: NoteEntry = {
      id: Date.now().toString() + Math.random().toString().substring(2,8), // Client-side temp ID
      timestamp: new Date().toISOString(),
      text: noteText.trim(),
      agentId: currentUser.id,
    };
    
    const updatedNotes = [newNote, ...(merchant.notes || [])];

    try {
      const { data, error: supabaseError } = await supabase
        .from('merchants')
        .update({ notes: updatedNotes })
        .eq('id', merchantId)
        .eq('agentId', currentUser.id)
        .select();
      
      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const updatedMerchant = {...data[0], notes: data[0].notes || []} as Merchant;
        setMerchants(prev => prev.map(m => m.id === updatedMerchant.id ? updatedMerchant : m));
        setIsLoading(false);
        return updatedMerchant;
      }
      setIsLoading(false);
      return undefined;
    } catch (e: any) {
      console.error("Failed to add note to merchant in Supabase", e);
      setError(`Failed to add note: ${e.message}`);
      setIsLoading(false);
      return undefined;
    }
  }, [getMerchantById, currentUser, setIsLoading, setError, setMerchants]);

  return {
    merchants,
    addMerchant,
    updateMerchant,
    deleteMerchant,
    getMerchantById,
    addNoteToMerchant,
    isLoading,
    error,
    setError,
    fetchMerchants, // Expose fetchMerchants for potential manual refresh
  };
};
