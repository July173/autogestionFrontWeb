/**
 * CancelModal component
 * ----------------------
 * Simple modal to display information and close/cancel with a single button.
 * Props:
 * - isOpen: boolean           // Whether the modal is open or closed
 * - title?: string            // Modal title (optional)
 * - message: string           // Main message to display
 * - buttonText?: string       // Button text (optional, default "Cerrar")
 * - onClose: () => void       // Function to execute on close/cancel
 */

import React from "react";

interface CancelModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  title = "Información",
  message,
  buttonText = "Cerrar",
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-center">
          <button
            className="bg-red-300 hover:bg-red-400 text-gray-700 py-2 px-8 rounded font-semibold"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
