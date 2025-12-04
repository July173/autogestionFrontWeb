
/**
 * ForgotPasswordForm component
 * ---------------------------
 * Form for password recovery via institutional email.
 * Allows the user to request a recovery code, validates the email, and shows success or error notifications.
 *
 * Props:
 * - onNavigate: (view: string) => void // Function to navigate between views (login, verify-code, etc)
 *
 * Usage:
 * <ForgotPasswordForm onNavigate={handleNavigate} />
 *
 * Flow:
 * 1. The user enters their institutional email.
 * 2. The email format is validated.
 * 3. On submit, requests the recovery code from the backend.
 * 4. Shows a notification based on the result.
 * 5. If the email was sent successfully, navigates to the code verification screen.
 */

import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import SenaLogo from '../SenaLogo';
import FooterLinks from './FooterLinks';
import NotificationModal from '../NotificationModal';
import useNotification from '../../hook/useNotification';
import { isSenaEmail } from '../../hook/validationlogin';
import { requestPasswordResetCode } from '../../Api/Services/User';


interface ForgotPasswordFormProps {
  onNavigate: (view: string) => void;
}

/**
 * ForgotPasswordForm component.
 * Handles password recovery request and notification logic.
 * @param {ForgotPasswordFormProps} props
 * @returns {JSX.Element}
 */
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigate }) => {
  const {
    notification,
    hideNotification,
    showEmailSent,
    showNotification
  } = useNotification();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Handles email input change and validates institutional email format.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(!isSenaEmail(value) ? 'El correo debe ser institucional (@soy.sena.edu.co o @sena.edu.co)' : '');
  };

  /**
   * Handles form submission to request password reset code.
   * Stores email in localStorage and shows notification based on backend response.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return;
    setLoading(true);
    setErrorMsg('');
    localStorage.setItem('recovery_email', email);
    const result = await requestPasswordResetCode(email);
    setLoading(false);
    if (result.success) {
      // Show notification for sent email
      showEmailSent();
    } else {
      // Show error notification
      showNotification('warning', 'Error', result.message || 'No se pudo enviar el correo. Por favor verifica el correo e inténtalo de nuevo.');
    }
  };

  return (
    <div className="sena-form-panel">
      <div className="sena-form">
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a inicio de sesión
        </button>

        <SenaLogo />

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Recuperar Contraseña
          </h2>
          <p className="sena-text-muted">
            Ingresa tu correo electrónico para recibir un código de recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="sena-input-group">
            <Mail className="sena-input-icon" />
            <input
              type="email"
              placeholder="ejemplo@soy.sena.edu.co"
              value={email}
              onChange={handleEmailChange}
              className="sena-input"
              required
            />
            {emailError && <span className="text-red-500 text-xs">{emailError}</span>}
          </div>
          {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
          <button type="submit" className="sena-button" disabled={!!emailError || loading}>
            {loading ? 'Procesando...' : 'Enviar Código'}
          </button>
        </form>

        <FooterLinks />
        
  {/* Notification modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => {
            hideNotification();
            if (notification.type === 'email-sent') {
              onNavigate('verify-code');
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

export default ForgotPasswordForm;
