import React, { useState, useEffect } from 'react';
import { useValidationEmail } from '../../hook/ValidationEmail';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { getDocumentTypesWithEmpty } from '../../Api/Services/TypeDocument';
import { useNavigate } from 'react-router-dom';
import FooterLinks from './FooterLinks';
import { validateInstitutionalLogin } from '../../Api/Services/User';
import { isSenaEmail, isValidPassword } from '../../hook/validationlogin';
import SenaLogo from '../SenaLogo';
import SecondFactorModal from './SecondFactorModal';
import LoadingOverlay from '../LoadingOverlay';

/**
 * Props for LoginForm component.
 * @property onNavigate Function to navigate between views (register, password recovery, etc.)
 */
interface LoginFormProps {
  onNavigate: (view: string) => void;
}

/**
 * LoginForm component
 * -------------------
 * Renders the institutional login form for SENA users.
 *
 * Features:
 * - Institutional email and password validation.
 * - Error and loading state management.
 * - Session persistence in localStorage.
 * - Navigation to registration and password recovery.
 *
 * @param {LoginFormProps} props
 * @returns {JSX.Element} Login form.
 */
const LoginForm: React.FC<LoginFormProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentTypes, setDocumentTypes] = useState<{ id: number | ''; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSecondFactorModalOpen, setSecondFactorModalOpen] = useState(false);

  useEffect(() => {
    getDocumentTypesWithEmpty().then(setDocumentTypes);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(!isSenaEmail(value) ? 'El correo debe ser institucional (@soy.sena.edu.co o @sena.edu.co)' : '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(!isValidPassword(value) ? 'La contraseña debe tener al menos 8 caracteres.' : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (emailError || passwordError) return;
    setLoading(true);
    try {
      const result = await validateInstitutionalLogin(email, password);
      let userData;
      if (result.user) {
        userData = {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          person: result.user.person ? String(result.user.person) : undefined,
          access_token: result.access,
          refresh_token: result.refresh,
        };
      } else {
        userData = {
          id: result.user,
          email: result.email,
          role: result.role,
          person: result.person ? String(result.person) : undefined,
          access_token: result.access,
          refresh_token: result.refresh,
        };
      }
      localStorage.setItem('user_data', JSON.stringify(userData));
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
      localStorage.setItem('user_email', email); // Guardar el correo en localStorage

      // Abrir el modal de segundo factor
      setSecondFactorModalOpen(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sena-form-panel">
      <LoadingOverlay isOpen={loading} message={loading ? 'Procesando...' : undefined} />
      <div className="sena-form">
        <SenaLogo />
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Iniciar Sesión</h2>
          <p className="sena-text-muted">Ingresa tus credenciales para acceder a tu cuenta.</p>
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

          <div className="sena-input-group">
            <Lock className="sena-input-icon" />
            <input
              type="password"
              placeholder="******************"
              value={password}
              onChange={handlePasswordChange}
              className="sena-input"
              required
            />
            {passwordError && <span className="text-red-500 text-xs">{passwordError}</span>}
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="sena-link text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className="sena-button" disabled={loading}>
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center">
            <span className="sena-text-muted">¿No tienes una cuenta? </span>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="sena-link"
            >
              Regístrate aquí
            </button>
          </div>
        </form>

        <FooterLinks />
      </div>

      {/* Modal de segundo factor */}
      <SecondFactorModal
        isOpen={isSecondFactorModalOpen}
        onClose={() => setSecondFactorModalOpen(false)}
        onSuccess={() => navigate('/home')}
      />
    </div>
  );
};

export default LoginForm;