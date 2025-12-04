/**
 * SessionExpiredModal component
 * ----------------------------
 * Displays a modal when the session is closed due to inactivity.
 *
 * Props:
 * @param {boolean} isOpen - Indicates if the modal is visible.
 * @param {() => void} onClose - Function to close the modal.
 *
 * @returns {JSX.Element | null} Modal for session expiration by inactivity.
 */
import React from "react";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-900">Sesión cerrada por inactividad</h2>
        <p className="text-gray-700 mb-6">
          Has estado mucho tiempo inactivo y por seguridad tu sesión fue cerrada.<br />
          Por favor, vuelve a iniciar sesión para continuar usando la plataforma.
        </p>
        <button
          className="bg-[#43A047] text-white px-4 py-2 rounded font-semibold hover:bg-[#388E3C] transition-colors w-full mt-2"
          onClick={onClose}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
