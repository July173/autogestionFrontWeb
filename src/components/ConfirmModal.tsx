
/**
 * ConfirmModal component
 * -----------------------
 * Reusable confirmation modal for important actions (delete, enable, disable, etc).
 * Shows a message, title and two buttons: confirm and cancel.
 *
 * Props:
 * - isOpen: boolean           // Whether the modal is open or closed
 * - title?: string            // Modal title (optional, default "Confirmar acción")
 * - message: string           // Main message to display
 * - confirmText?: string      // Confirm button text (optional, default "Confirmar")
 * - cancelText?: string       // Cancel button text (optional, default "Cancelar")
 * - onConfirm: () => void     // Function to execute on confirm
 * - onCancel: () => void      // Function to execute on cancel/close
 *
 * Usage:
 * <ConfirmModal
 *   isOpen={modalAbierto}
 *   title="¿Eliminar usuario?"
 *   message="Esta acción no se puede deshacer."
 *   confirmText="Sí, eliminar"
 *   cancelText="Cancelar"
 *   onConfirm={handleEliminar}
 *   onCancel={handleCerrar}
 * />
 */

// Props del modal de confirmación
interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  errorMessage?: string | null;
  zIndex?: number;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  errorMessage = null,
  zIndex = 50,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center" style={{ zIndex }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg" style={{ zIndex: zIndex + 1 }}>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="mb-2 text-gray-700">{message}</p>
        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 font-semibold">{errorMessage}</div>
        )}
        <div className="flex gap-4">
          <button
            className="flex-1 bg-red-300 hover:bg-red-400 text-gray-700 py-2 rounded font-semibold"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;