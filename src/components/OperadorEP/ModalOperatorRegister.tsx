import React, { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

interface ModalOperatorRegisterProps {
  apprenticeName: string;
  requestId: number;
  onClose: () => void;
  onConfirm: (message: string) => void;
}

export default function ModalOperatorRegister({
  apprenticeName,
  requestId,
  onClose,
  onConfirm,
}: ModalOperatorRegisterProps) {
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const MAX_MESSAGE_LENGTH = 500;

  const handleSubmit = () => {
    if (!message.trim()) {
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onConfirm(message);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
        <div className="bg-white rounded-[10px] shadow-lg max-w-xl w-full mx-4 p-6 relative z-10" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">Mensaje Operador Sofía</h3>
              <p className="text-sm text-neutral-600">
                Se agregar un mensaje confirmando la carga exitosa de la etapa productiva en sena sofía plus por medio de la confirmación del operador encargado del proceso
              </p>
            </div>
          </div>

          {/* Apprentice Info */}
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#22c55e" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{apprenticeName}</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-black">Escribir un mesaje</h4>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <textarea
              value={message}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= MAX_MESSAGE_LENGTH) {
                  setMessage(v);
                }
              }}
              placeholder="Agregar un mensaje sobre la carga exitosa de los respectivos datos del aprendiz ..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                {message.length}/{MAX_MESSAGE_LENGTH} caracteres
              </div>
              {!message.trim() && (
                <div className="text-xs text-red-500">El mensaje es obligatorio</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              className="bg-white border border-gray-400 text-gray-700 font-bold px-6 py-2 rounded-[10px] hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="bg-green-500 border border-green-600 text-white font-bold px-6 py-2 rounded-[10px] hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleSubmit}
              disabled={!message.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
              Guardar Mensaje
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="¿Confirmar registro?"
        message={`¿Estás seguro de confirmar el registro de carga exitosa en SOFÍA Plus para ${apprenticeName}?`}
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        errorMessage={null}
      />
    </>
  );
}

