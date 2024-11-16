// /frontend/src/components/shared/ConfirmationDialog.jsx
import React from 'react';
import Modal, { ModalAction } from './Modal';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    actions={<>
      <ModalAction onClick={onClose}>
        {cancelLabel}
      </ModalAction>
      <ModalAction onClick={onConfirm} variant={variant}>
        {confirmLabel}
      </ModalAction>
    </>}
  >
    <p className="text-text-muted dark:text-text-muted-dark">{message}</p>
  </Modal>
);

export default ConfirmationDialog;