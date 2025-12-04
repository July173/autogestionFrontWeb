/**
 * ProtectedRoute component
 * -----------------------
 * Protects routes by checking for active session and handling session expiration by inactivity.
 * Shows a modal when session expires and redirects to login.
 *
 * @param {ProtectedRouteProps} props - Component props.
 * @returns {JSX.Element} Protected route wrapper.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useIdleTimer from "../../hook/userIdleTimer";
import SessionExpiredModal from "./SessionExpiredModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userData = localStorage.getItem("user_data");
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [sessionExpiredByIdle, setSessionExpiredByIdle] = useState(false);
  const navigate = useNavigate();

  // Inactivity hook: removes session and shows modal even if session is already gone
  useIdleTimer(40 * 60 * 1000, () => {
    localStorage.removeItem("user_data");
    setShowSessionExpired(true);
    setSessionExpiredByIdle(true);
  });

  // When user accepts in modal, navigate to login
  const handleAcceptLogout = () => {
    setShowSessionExpired(false);
    setSessionExpiredByIdle(false);
    navigate("/");
  };

  if (userData && !sessionExpiredByIdle) {
    return (
      <>
        {children}
        <SessionExpiredModal
          isOpen={showSessionExpired}
          onClose={handleAcceptLogout}
        />
      </>
    );
  }

  // If session expired by inactivity, show modal even if no session
  if (sessionExpiredByIdle) {
    return (
      <SessionExpiredModal
        isOpen={showSessionExpired}
        onClose={handleAcceptLogout}
      />
    );
  }

  // If no session and not expired by inactivity, show normal message
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">No hay sesión activa</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="sena-button"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
