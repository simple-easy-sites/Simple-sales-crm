import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMerchants } from '../hooks/useMerchants';
import { Merchant, NoteEntry } from '../types';
import { MerchantForm, MerchantFormData } from '../components/MerchantForm';
import { ROUTES } from '../constants';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';


export const MerchantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getMerchantById, updateMerchant, deleteMerchant, isLoading: merchantsLoading, error: merchantsError } = useMerchants();
  const [merchant, setMerchant] = useState<Merchant | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) {
      // console.log("MerchantDetailPage: No ID, navigating to dashboard.");
      navigate(ROUTES.DASHBOARD);
      return;
    }
    const foundMerchant = getMerchantById(id);
    if (foundMerchant) {
      // Only update if it's a different merchant or merchant is not set yet
      if (!merchant || merchant.id !== foundMerchant.id) {
        // console.log("MerchantDetailPage: Found merchant, setting state:", foundMerchant.id);
        setMerchant(foundMerchant);
      }
    } else if (!merchantsLoading && id) {
      // This means initial merchant list is loaded, but this specific one wasn't found.
      // console.warn(`MerchantDetailPage: Merchant with id ${id} not found after global merchants loaded. Navigating to dashboard.`);
      navigate(ROUTES.DASHBOARD);
    }
  }, [id, getMerchantById, navigate, merchantsLoading, merchant]);


  const handleSubmit = (formData: MerchantFormData, newNoteText?: string) => {
    if (!currentUser || !merchant) return; 

    let merchantDataForUpdate: Merchant = {
        ...merchant, 
        ...formData,  
    };

    if (newNoteText && newNoteText.trim() !== "") {
      const newNote: NoteEntry = {
        id: Date.now().toString() + Math.random().toString().substring(2,8),
        timestamp: new Date().toISOString(),
        text: newNoteText.trim(),
        agentId: currentUser.id,
      };
      merchantDataForUpdate.notes = [newNote, ...(merchantDataForUpdate.notes || [])];
    }
    
    updateMerchant(merchantDataForUpdate);
    navigate(ROUTES.DASHBOARD);
  };
  
  const handleDelete = () => {
    if (merchant) {
      deleteMerchant(merchant.id);
      navigate(ROUTES.DASHBOARD);
      setShowDeleteModal(false);
    }
  };

  // Render logic:
  if (merchantsLoading && !merchant) {
    // Still loading the main list of merchants AND we haven't identified our specific merchant yet.
    return <div className="p-6 text-center text-gray-500">Loading merchant details...</div>;
  }

  if (!id) { 
    // This should ideally be caught by useEffect earlier and navigate.
    // If it reaches here, it's an unexpected state.
    // console.log("MerchantDetailPage: Render - No ID, navigating.");
    // useEffect will handle navigation, but this is a fallback display.
    return <div className="p-6 text-center text-gray-500">Error: Merchant ID is missing. Redirecting...</div>;
  }

  if (merchantsError) { 
    return <div className="p-6 text-center text-red-600">Error loading merchants: {merchantsError}</div>; 
  }

  // At this point, merchantsLoading is false (or merchant is already found if loading was quick)
  // and id is present and no error.
  if (!merchant) {
    // If merchantsLoading is false, id is present, no error, but merchant is STILL not set by the useEffect.
    // This implies the useEffect concluded it's not found (and should have navigated) or is in an intermediate state.
    // This message might appear briefly before navigation if the merchant is truly not found after load.
    return <div className="p-6 text-center text-gray-500">Finalizing merchant details or merchant not found. You may be redirected.</div>;
  }

  // If all checks pass, 'merchant' is available.
  const pageTitle = "Edit Lead Details"; 

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{pageTitle}</h1>
        {merchant && ( 
            <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="mt-4 sm:mt-0">
                Delete Merchant
            </Button>
        )}
      </div>
      
      <MerchantForm
        initialData={merchant} 
        onSubmit={handleSubmit}
      />

      {merchant && (
         <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title={`Delete ${merchant.merchantName}?`}
            footer={
                <>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete} className="ml-3">Confirm Delete</Button>
                </>
            }
        >
            <p className="text-sm text-gray-700">Are you sure you want to delete this merchant? This action is permanent.</p>
        </Modal>
      )}
    </div>
  );
};