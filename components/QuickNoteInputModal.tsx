
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/Modal';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { useQuickNotes } from '../hooks/useQuickNotes';
import { QuickNote } from '../types';
import { EditQuickNoteModal } from './EditQuickNoteModal';
import { ROUTES } from '../constants';

const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className || 'text-red-500 hover:text-red-700'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const ArrowPathIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className || 'text-primary-700 hover:text-primary-900'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a.75.75 0 0 1 .75.75c0 .414-.336.75-.75.75h-4.992v5.04a.75.75 0 0 1-1.5 0v-5.04h-4.992a.75.75 0 0 1 0-1.5h4.992v-5.04a.75.75 0 0 1 1.5 0v5.04Z" /></svg>;
const PencilIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className || 'text-gray-600 hover:text-gray-800'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>;

interface QuickNoteInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickNoteInputModal: React.FC<QuickNoteInputModalProps> = ({ isOpen, onClose }) => {
  const { quickNotes, addQuickNote, deleteQuickNote, editQuickNote, isLoading, error } = useQuickNotes();
  const navigate = useNavigate();
  const [newNoteText, setNewNoteText] = useState('');
  
  const [showEditQuickNoteModal, setShowEditQuickNoteModal] = useState(false);
  const [selectedQuickNoteForEdit, setSelectedQuickNoteForEdit] = useState<QuickNote | null>(null);


  const handleSaveQuickNote = () => {
    if (newNoteText.trim()) {
      addQuickNote(newNoteText);
      setNewNoteText(''); 
    }
  };
  
  const openEditModal = (note: QuickNote) => {
    setSelectedQuickNoteForEdit(note);
    setShowEditQuickNoteModal(true);
  };

  const closeEditModal = () => {
    setSelectedQuickNoteForEdit(null);
    setShowEditQuickNoteModal(false);
  };

  const handleSaveEditedNote = (id: string, text: string) => {
    editQuickNote(id, text);
  };

  const handleConvertToLead = (note: QuickNote) => {
    navigate(ROUTES.ADD_MERCHANT, { 
      state: { 
        quickNoteText: note.text,
        quickNoteId: note.id 
      } 
    });
    onClose(); // Close the quick note modal after navigating
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Quick Notes" size="xl">
        <div className="space-y-4">
          <Textarea
            label="New Quick Note"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Jot down quick notes here... Texas, $50K, 2 defaults, callback tomorrow..."
            rows={3}
          />
          <Button onClick={handleSaveQuickNote} isLoading={isLoading} disabled={!newNoteText.trim()}>
            Save Quick Note
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Pending Quick Notes</h3>
            {isLoading && quickNotes.length === 0 && <p className="text-sm text-gray-500">Loading notes...</p>}
            {!isLoading && quickNotes.filter(qn => qn.status === 'pending').length === 0 && <p className="text-sm text-gray-500">No pending quick notes.</p>}
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {quickNotes.filter(qn => qn.status === 'pending').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(note)} aria-label="Edit note">
                        <PencilIcon />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteQuickNote(note.id)} aria-label="Delete note">
                      <TrashIcon />
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => handleConvertToLead(note)} aria-label="Convert to Lead">
                      <ArrowPathIcon className="text-white"/> <span className="ml-1">Convert to Lead</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      
      {selectedQuickNoteForEdit && (
        <EditQuickNoteModal
            isOpen={showEditQuickNoteModal}
            onClose={closeEditModal}
            quickNoteToEdit={selectedQuickNoteForEdit}
            onSaveChanges={handleSaveEditedNote}
        />
      )}
    </>
  );
};