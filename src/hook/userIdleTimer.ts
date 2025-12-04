// src/hooks/useIdleTimer.ts

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for managing user idle timeout and automatic logout.
 * Monitors user activity and automatically logs out users after a specified period of inactivity.
 * 
 * @param timeout - Timeout duration in milliseconds (default: 20 minutes)
 * @param onSessionExpired - Optional callback function called when session expires
 */
export default function useIdleTimer(
  timeout: number = 40 * 60 * 1000,
  onSessionExpired?: () => void
) {
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const logout = () => {
      if (onSessionExpired) {
        onSessionExpired();
      } else {
        navigate("/"); // fallback: redirect to login
      }
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, timeout);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer

    return () => {
      clearTimeout(timer);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [navigate, timeout, onSessionExpired]);
}
