import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import SenaLogo from '../SenaLogo';
import FooterLinks from './FooterLinks';
import { isValidResetCode } from '../../hook/validationlogin';
import { verifyResetCode } from '../../Api/Services/User';
import NotificationModal from '../NotificationModal';
import useNotification from '../../hook/useNotification';

/**
 * Props for VerifyCodeForm component.
 * @property {(view: string) => void} onNavigate - Function to navigate between views (reset-password, forgot-password, etc.).
 */
interface VerifyCodeFormProps {
  onNavigate: (view: string) => void;
}

/**
 * VerifyCodeForm component
 * -----------------------
 * Renders the form to verify the recovery code sent to the user's email.
 *
 * Features:
 * - Real-time validation of the recovery code.
 * - Calls backend service to verify the code.
 * - Shows success or error notifications.
 * - Allows navigation between password recovery views.
 *
 * @param {VerifyCodeFormProps} props - Component props.
 * @returns {JSX.Element} Rendered code verification form.
 */
/**
 * VerifyCodeForm component.
 * Handles code verification logic and notifications.
 * @param {VerifyCodeFormProps} props
 * @returns {JSX.Element}
 */
const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ onNavigate }) => {
  const {
    notification,
    hideNotification,
    showActionCompleted,
    showNotification
  } = useNotification();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Handles code input change and validates format (6 numeric digits).
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCode(value);
    setCodeError(!isValidResetCode(value) ? 'El código debe ser de 6 dígitos numéricos.' : '');
  };

  /**
   * Handles form submission to verify the recovery code.
   * Calls backend and shows notification based on result.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codeError) return;
    setLoading(true);
    setErrorMsg('');
    const email = localStorage.getItem('recovery_email') || '';
    const result = await verifyResetCode(email, code);
    setLoading(false);
    if (result.success) {
      // Show notification for completed action
      showActionCompleted();
    } else {
      setErrorMsg(result.message || 'El código es incorrecto o ha expirado.');
    }
  };

  return (
    <div className="sena-form-panel">
      <div className="sena-form">
        <button
          onClick={() => onNavigate('forgot-password')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>

        <SenaLogo />

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Código de verificación
          </h2>
            <p className="sena-text-muted">
              Ingresa tu código de recuperación que se te envió al correo electrónico{' '}
              <span className="font-medium">{localStorage.getItem('recovery_email') || 'ejemplo@soy.sena.edu.co'}</span>
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="sena-input-group">
            <Lock className="sena-input-icon" />
            <input
              type="text"
              placeholder="Código de recuperación"
              value={code}
              onChange={e => {
                // Solo números y máximo 6 caracteres
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setCodeError(!isValidResetCode(value) ? 'El código debe ser de 6 dígitos numéricos.' : '');
              }}
              className="sena-input"
              required
              maxLength={6}
              inputMode="numeric"
              pattern="\d*"
            />
            {codeError && <span className="text-red-500 text-xs">{codeError}</span>}
          </div>
          {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
          <button type="submit" className="sena-button" disabled={!!codeError || loading}>
            {loading ? 'Procesando...' : 'Verificar Código'}
          </button>
        </form>

        <FooterLinks />
  {/* Notification modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => {
            hideNotification();
            // If the action was completed, navigate to reset-password
            if (notification.type === 'completed') {
              onNavigate('reset-password');
            }
          }}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
    </div>
  );
};

export default VerifyCodeForm;
