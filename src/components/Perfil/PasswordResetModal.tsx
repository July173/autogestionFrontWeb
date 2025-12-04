import React from 'react';
import ResetPasswordForm from '../Login/ResetPasswordForm';

/**
 * Props interface for the PasswordResetModal component.
 * Modal for password recovery via institutional email.
 */
interface PasswordResetModalProps {
  /** Whether the modal is visible */
  showModal: boolean;
  /** Current step in the password reset process */
  modalStep: 'send' | 'verify' | 'reset';
  /** Informational message displayed in the modal */
  modalMsg: string;
  /** Error message displayed in the modal */
  modalError: string;
  /** Loading state of the modal */
  modalLoading: boolean;
  /** Entered verification code */
  code: string;
  /** Error message for the verification code */
  codeError: string;
  /** User's institutional email address */
  userEmail: string;
  /** Function to change modal visibility */
  setShowModal: (show: boolean) => void;
  /** Function to change the current process step */
  setModalStep: (step: 'send' | 'verify' | 'reset') => void;
  /** Function to change the informational message */
  setModalMsg: (msg: string) => void;
  /** Function to change the error message */
  setModalError: (err: string) => void;
  /** Function to change the entered verification code */
  setCode: (code: string) => void;
  /** Function to change the code error message */
  setCodeError: (err: string) => void;
  /** Function to verify the reset code with email and code */
  verifyResetCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
}

/**
 * PasswordResetModal component - Modal for password recovery via institutional email.
 *
 * This modal component handles the complete password reset flow including:
 * - Sending verification code to institutional email
 * - Verifying the entered code
 * - Displaying the password reset form
 *
 * The component manages three steps: 'send', 'verify', and 'reset', each showing
 * different content and functionality. It includes proper error handling,
 * loading states, and local storage management for the recovery process.
 *
 * Features:
 * - Multi-step password recovery process
 * - Institutional email verification
 * - 6-digit numeric code validation
 * - Error handling and user feedback
 * - Loading states during operations
 * - Local storage cleanup on completion
 *
 * @param props - The component props
 * @returns A modal component for password reset functionality
 *
 * @example
 * ```tsx
 * <PasswordResetModal
 *   showModal={true}
 *   modalStep="verify"
 *   modalMsg="Enter the code sent to your email"
 *   modalError=""
 *   modalLoading={false}
 *   code=""
 *   codeError=""
 *   userEmail="user@sena.edu.co"
 *   setShowModal={setModalVisible}
 *   setModalStep={setCurrentStep}
 *   setModalMsg={setMessage}
 *   setModalError={setError}
 *   setCode={setVerificationCode}
 *   setCodeError={setCodeErrorMessage}
 *   verifyResetCode={handleVerifyCode}
 * />
 * ```
 */
const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  showModal,
  modalStep,
  modalMsg,
  modalError,
  modalLoading,
  code,
  codeError,
  userEmail,
  setShowModal,
  setModalStep,
  setModalMsg,
  setModalError,
  setCode,
  setCodeError,
  verifyResetCode,
}) => {
  if (!showModal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Close button - clears local storage and closes modal */}
        <button className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl" onClick={() => {
          localStorage.removeItem('recovery_email');
          localStorage.removeItem('reset_code');
          setShowModal(false);
        }}>&times;</button>

        {/* Verification step - user enters 6-digit code */}
        {modalStep === 'verify' && (
          <>
            <h2 className="text-xl font-bold mb-2 text-[#263238]">Verifica tu correo</h2>
            <p className="mb-4 text-gray-700">{modalMsg}<br /><span className="font-semibold">{userEmail}</span></p>
            <form onSubmit={async e => {
              e.preventDefault();
              setModalError('');
              if (!code.match(/^\d{6}$/)) {
                setCodeError('El código debe ser de 6 dígitos numéricos.');
                return;
              }
              setCodeError('');
              const res = await verifyResetCode(userEmail, code);
              if (res.success) {
                localStorage.setItem('recovery_email', userEmail);
                localStorage.setItem('reset_code', code);
                setModalStep('reset');
              } else {
                setModalError(res.message || 'Código incorrecto o expirado.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[#1976d2]">Código de verificación</label>
                <input
                  type="tel"
                  value={code}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ingresa el código"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                {codeError && <span className="text-red-500 text-xs">{codeError}</span>}
              </div>
              {modalError && <div className="text-red-500 text-sm mb-2">{modalError}</div>}
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow w-full">
                Verificar Código
              </button>
            </form>
          </>
        )}

        {/* Send step - shows sending status */}
        {modalStep === 'send' && (
          <div className="flex flex-col items-center justify-center min-h-[180px]">
            <span className="text-gray-700 mb-2">{modalMsg}</span>
            {modalError && <span className="text-red-500 text-sm">{modalError}</span>}
            {modalLoading && <span className="text-gray-400 text-sm mt-2">Enviando...</span>}
          </div>
        )}

        {/* Reset step - shows password reset form */}
        {modalStep === 'reset' && (
          <ResetPasswordForm onNavigate={() => {
            localStorage.removeItem('recovery_email');
            localStorage.removeItem('reset_code');
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/?view=login';
          }} />
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
