import React, { useState } from 'react';
import NotificationModal from '../NotificationModal';
import { verifySecondFactorCode } from '@/Api/Services/User';

interface SecondFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * SecondFactorModal component
 * ---------------------------
 * Renders a modal for second-factor authentication.
 *
 * Features:
 * - Input separated into 6 boxes for better UX.
 * - Calls backend service to verify the code.
 * - Shows success or error notifications.
 *
 * @param {SecondFactorModalProps} props - Component props.
 * @returns {JSX.Element} Rendered modal for second-factor authentication.
 */
const SecondFactorModal: React.FC<SecondFactorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const email = localStorage.getItem('user_email'); // Obtener el correo electrónico del localStorage

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1); // Only allow one numeric digit
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Automatically focus the next box if a digit is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Debes completar los 6 dígitos.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const result = await verifySecondFactorCode({ email, code: fullCode });
    setLoading(false);
    if (result.success) {
      localStorage.setItem('user_dashboard', JSON.stringify(result.user)); // Guardar la respuesta en localStorage
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.message || 'El código es incorrecto o ha expirado.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Autenticación de Segundo Factor</h2>
        <p className="text-gray-600 mb-6">Código enviado a: {email}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-box-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1}
                inputMode="numeric"
                pattern="\d*"
              />
            ))}
          </div>
          {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
          <button type="submit" className="sena-button w-full" disabled={loading}>
            {loading ? 'Procesando...' : 'Verificar Código'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecondFactorModal;