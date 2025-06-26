
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { QuickNote } from '../types';
import { useQuickNotes } from '../hooks/useQuickNotes';

interface EditQuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickNoteToEdit: QuickNote;
  onSaveChanges: (id: string, newText: string) => void;
}

export const EditQuickNoteModal: React.FC<EditQuickNoteModalProps> = ({ 
    isOpen, 
    onClose, 
    quickNoteToEdit,
    onSaveChanges,
}) => {
  const [editedText, setEditedText] = useState('');
  const { isLoading } = useQuickNotes(); 

  useEffect(() => {
    if (quickNoteToEdit && isOpen) {
      setEditedText(quickNoteToEdit.text);
    }
  }, [quickNoteToEdit, isOpen]);

  const handleSaveChangesClick = () => {
    if (editedText.trim() && quickNoteToEdit) {
      onSaveChanges(quickNoteToEdit.id, editedText);
      onClose();
    }
  };

  if (!quickNoteToEdit) return null;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`Edit Quick Note`} 
        size="lg"
        footer={
            <div className="w-full flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveChangesClick} isLoading={isLoading} disabled={!editedText.trim()}>Save Changes</Button>
            </div>
        }
    >
      <div className="space-y-4">
        <Textarea
          label="Note Text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Edit your quick note..."
          rows={5}
          autoFocus
        />
         <p className="text-xs text-gray-500">Original creation date: {new Date(quickNoteToEdit.createdAt).toLocaleString()}</p>
      </div>
    </Modal>
  );
};