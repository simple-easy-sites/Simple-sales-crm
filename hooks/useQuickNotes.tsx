import { useState, useEffect, useCallback } from 'react';
import { QuickNote } from '../types';
import { useAuth } from '../contexts/AuthContext';
// import { LOCAL_STORAGE_KEYS } from '../constants'; // Removed
import { supabase } from '../lib/supabaseClient'; // Added

export const useQuickNotes = () => {
  const { currentUser } = useAuth();
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickNotes = useCallback(async () => {
    if (!currentUser) {
      setQuickNotes([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('agentId', currentUser.id)
        .order('createdAt', { ascending: false });

      if (supabaseError) throw supabaseError;
      setQuickNotes(data as QuickNote[]);
    } catch (e: any) {
      console.error("Failed to load quick notes from Supabase", e);
      setError(`Failed to load quick notes: ${e.message}`);
      setQuickNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);
  
  useEffect(() => {
    fetchQuickNotes();
  }, [fetchQuickNotes]);

  const addQuickNote = useCallback(async (text: string) => {
    if (!currentUser || !text.trim()) {
      setError("User not authenticated or text is empty.");
      return undefined;
    }
    setIsLoading(true);
    setError(null);
    const noteToInsert = {
      agentId: currentUser.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending' as QuickNote['status'],
    };
    try {
      const { data, error: supabaseError } = await supabase
        .from('quick_notes')
        .insert([noteToInsert])
        .select();
      
      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const newQuickNote = data[0] as QuickNote;
        setQuickNotes(prev => [newQuickNote, ...prev]); // Add to start for chronological view if sorted by new
        setIsLoading(false);
        return newQuickNote;
      }
      setIsLoading(false);
      return undefined;
    } catch (e: any) {
      console.error("Failed to save quick note to Supabase", e);
      setError(`Failed to save quick note: ${e.message}`);
      setIsLoading(false);
      return undefined;
    }
  }, [currentUser, setIsLoading, setError, setQuickNotes]);

  const updateQuickNoteStatus = useCallback(async (id: string, status: QuickNote['status'], convertedLeadId?: string) => {
    if (!currentUser) {
      setError("User not authenticated to update quick note.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('quick_notes')
        .update({ status, convertedLeadId: status === 'converted' ? convertedLeadId : null })
        .eq('id', id)
        .eq('agentId', currentUser.id)
        .select();

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const updatedNote = data[0] as QuickNote;
        setQuickNotes(prev => prev.map(qn => qn.id === updatedNote.id ? updatedNote : qn));
      }
    } catch (e: any) {
      console.error("Failed to update quick note status in Supabase", e);
      setError(`Failed to update quick note status: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setIsLoading, setError, setQuickNotes]);
  
  const deleteQuickNote = useCallback(async (id: string) => {
    if (!currentUser) {
      setError("User not authenticated to delete quick note.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from('quick_notes')
        .delete()
        .eq('id', id)
        .eq('agentId', currentUser.id);

      if (supabaseError) throw supabaseError;
      setQuickNotes(prev => prev.filter(qn => qn.id !== id));
    } catch (e: any) {
      console.error("Failed to delete quick note from Supabase", e);
      setError(`Failed to delete quick note: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setIsLoading, setError, setQuickNotes]);

  const editQuickNote = useCallback(async (id: string, newText: string) => {
    if (!currentUser || !newText.trim()) {
      setError("User not authenticated or text is empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('quick_notes')
        .update({ text: newText.trim(), status: 'pending' as QuickNote['status'] }) // Reset status to pending on edit
        .eq('id', id)
        .eq('agentId', currentUser.id)
        .select();
      
      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const editedNote = data[0] as QuickNote;
        setQuickNotes(prev => prev.map(qn => qn.id === editedNote.id ? editedNote : qn));
      }
    } catch (e: any) {
      console.error("Failed to edit quick note in Supabase", e);
      setError(`Failed to edit quick note: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setIsLoading, setError, setQuickNotes]);

  return {
    quickNotes,
    addQuickNote,
    updateQuickNoteStatus,
    deleteQuickNote,
    editQuickNote,
    isLoading,
    error,
    setError,
    fetchQuickNotes, // Expose for manual refresh
  };
};
