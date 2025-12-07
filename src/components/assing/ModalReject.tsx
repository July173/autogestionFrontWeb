import React, { useState, useEffect } from "react";
import LoadingOverlay from "../LoadingOverlay";
import ConfirmModal from "../ConfirmModal";


/**
 * Props for ModalReject component.
 * @typedef {Object} ModalRejectProps
 * @property {string} apprenticeName - Apprentice's name
 * @property {number} requestId - Request ID
 * @property {function} onClose - Function to close the modal
 * @property {function} onConfirm - Function to confirm rejection with a message
 */
interface ModalRejectProps {
  apprenticeName: string;
  requestId: number;
  onClose: () => void;
  // onConfirm can be sync or async; return a Promise if async
  onConfirm: (rejectionMessage: string) => void | Promise<void>;
  // Optional customization props
  title?: string;
  description?: string; // paragraph under the title; may include the apprenticeName placeholder
  reasonLabel?: string; // label for the textarea
  reasonPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Modal for rejecting a follow-up request.
 * Allows entering a rejection reason and confirms the action.
 * @param {ModalRejectProps} props
 */
const ModalReject: React.FC<ModalRejectProps> = ({
  apprenticeName,
  requestId,
  onClose,
  onConfirm,
  title = '¿Rechazar Solicitud?',
  description = `Esta acción rechazará la solicitud de seguimiento para ${apprenticeName}. Esta acción no se puede deshacer.`,
  reasonLabel = 'Motivo del rechazo (obligatorio)',
  reasonPlaceholder = 'Describe el motivo del rechazo',
  confirmText = 'Rechazar solicitud',
  cancelText = 'Cancelar',
}) => {
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // track mounted state to avoid setting state after unmount
  const [mounted, setMounted] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  /**
   * Handles the submit action for rejection.
   * Only proceeds if a rejection message is provided.
   */
  const handleSubmit = async () => {
    // This handler is triggered when the user confirms the inner ConfirmModal
    if (!rejectionMessage.trim()) {
      // Safety: should not happen because button is disabled, but double-check
      setShowConfirm(false);
      return;
    }
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const result = onConfirm(rejectionMessage);
      if (result && typeof (result as Promise<void>).then === 'function') {
        await (result as Promise<any>);
      } else {
        console.log('[ModalReject] onConfirm returned synchronously', { result });
      }
    } catch (err) {
      console.error('[ModalReject] error awaiting onConfirm:', err);
      throw err;
    } finally {
      // only set state if still mounted
      if (mounted) setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
  <LoadingOverlay isOpen={isSubmitting} message={isSubmitting ? 'Rechazando...' : undefined} />
  {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
  {/* Modal */}
      <div className="bg-white rounded-[10px] shadow-lg max-w-lg w-full mx-4 p-6 relative z-[91]">
  {/* Header with red X icon */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-black text-2xl font-bold font-['Roboto'] mb-1 text-left">
              {title}
            </h3>
            <p className="text-gray-600 text-base font-normal font-['Roboto'] text-left">
              {description}
            </p>
          </div>
        </div>

  {/* Text field for rejection reason */}
        <div className="mb-6">
          <label className="text-black text-base font-semibold font-['Roboto'] mb-2 block text-left">
            {reasonLabel.includes('(obligatorio)') ? (
              <>{reasonLabel.split('(obligatorio)')[0].trim()} <span className="text-red-500">(obligatorio)</span></>
            ) : (
              reasonLabel
            )}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-normal font-['Roboto'] resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={4}
            placeholder={reasonPlaceholder}
            value={rejectionMessage}
            onChange={(e) => setRejectionMessage(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

  {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            className="px-6 py-2 rounded-[10px] border border-gray-400 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
          <button
            className="px-6 py-2 rounded-[10px] bg-red-500 text-white font-bold hover:bg-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting || !rejectionMessage.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" className="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
            {isSubmitting ? 'Rechazando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title={title.includes('Rechazar') ? `Confirmar rechazo` : `Confirmar`}
          message={`¿Estás seguro de que deseas rechazar la solicitud? Esta acción no se puede deshacer.`}
          confirmText={confirmText}
          cancelText={cancelText}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
          zIndex={1000}
          errorMessage={null}
        />
      )}
    </>
  );
};

export default ModalReject;
