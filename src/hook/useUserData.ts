
/**
 * Custom hook to get and manage authenticated user data from localStorage.
 * Allows accessing the user, knowing if authenticated, controlling loading state, and logging out.
 *
 * Usage:
 * - Call `useUserData()` in your components to access user data and logout functions.
 * - The `isLoading` state indicates if data is being loaded.
 * - The `logout` function removes session data and tokens.
 */
import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  email: string;
  role?: number;
  person?: string; // id de la persona asociada
  access_token: string;
}

/**
 * Hook useUserData
 * Provides access and management of authenticated user data.
 *
 * @returns Object with state and functions for the authenticated user.
 */
export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedData = localStorage.getItem('user_data');
  let parsed: unknown = null;
        if (storedData) {
          try {
            parsed = JSON.parse(storedData);
          } catch {
            parsed = null;
          }
        }

  // If parsed user_data is missing or doesn't contain an id, try the older `user_dashboard` key
  const hasId = typeof parsed === 'object' && parsed !== null && 'id' in (parsed as Record<string, unknown>) && !!(parsed as Record<string, unknown>)['id'];
  if (!parsed || !hasId) {
          const dashboardRaw = localStorage.getItem('user_dashboard');
          if (dashboardRaw) {
            try {
              const db: Record<string, unknown> = JSON.parse(dashboardRaw);
              // Map dashboard shape to expected UserData shape
              const mapped = {
                id: db.id ? String(db.id) : undefined,
                email: db.email as string | undefined,
                role: db.role as number | undefined,
                person: db.person as string | undefined,
                access_token: localStorage.getItem('access_token') || undefined,
              } as UserData;
              if (mapped.id) setUserData(mapped);
              else if (parsed) setUserData(parsed as UserData);
            } catch (err) {
              // If dashboard parse fails, fallback to parsed if available
              if (parsed) setUserData(parsed as UserData);
            }
          } else if (parsed) {
            setUserData(parsed as UserData);
          }
        } else {
          setUserData(parsed as UserData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const logout = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUserData(null);
  };

  return {
    userData,
    isLoading,
    isAuthenticated: !!userData,
    logout
  };
};