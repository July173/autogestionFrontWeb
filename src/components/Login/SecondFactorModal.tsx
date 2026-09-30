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

  const handleAutofillDemoCode = () => {
    setCode(['1', '2', '3', '4', '5', '6']);
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Autenticación de Segundo Factor (2FA)</h2>
        <p className="text-xs text-gray-500 mb-4">
          Código enviado al correo: <strong className="text-gray-700">{email}</strong>
        </p>

        {/* Banner de ayuda para modo demostración */}
        <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="font-semibold block">💡 Modo Demostración Activo</span>
            <span className="text-emerald-700 text-[11px]">Código universal para evaluadores: <strong className="font-mono">123456</strong></span>
          </div>
          <button
            type="button"
            onClick={handleAutofillDemoCode}
            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition shadow-sm self-start sm:self-auto"
          >
            ⚡ Usar 123456
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-box-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                className="w-11 h-12 text-center border-2 border-gray-300 rounded-lg text-xl font-bold text-gray-800 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none transition"
                maxLength={1}
                inputMode="numeric"
                pattern="\d*"
              />
            ))}
          </div>
          {errorMsg && <div className="text-red-500 text-xs text-center font-medium">{errorMsg}</div>}
          <button type="submit" className="sena-button w-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar e Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecondFactorModal;