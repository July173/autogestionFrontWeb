import { useEffect, useState } from 'react';
import { Apprentice } from '../Api/types/entities/apprentice.types';
import { Person } from '../Api/types/entities/person.types';
import { getPersonById } from '../Api/Services/Person';
import { useUserData } from './useUserData';

/**
 * Custom hook to fetch and manage apprentice data for the current user.
 * 
 * This hook retrieves the person information and apprentice ID associated with the authenticated user.
 * It handles loading states, error management, and data fetching from multiple API endpoints.
 * 
 * The hook performs the following operations:
 * 1. Gets person data using the user's person ID
 * 2. Fetches apprentice records associated with that person
 * 3. Finds the correct apprentice record matching the person ID
 * 4. Manages loading and error states throughout the process
 * 
 * @returns Object containing person data, apprentice ID, loading state, and error information
 */
export const useApprenticeData = () => {
  const { userData } = useUserData();
  const [person, setPerson] = useState<Person | null>(null);
  const [apprenticeId, setApprenticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    
    if (userData && userData.person) {
      getPersonById(userData.person)
        .then(async (personData) => {
          setPerson(personData);
          // Query apprentices by person id using the service
          try {
            const apprenticeList = await import('../Api/Services/Apprentice').then(m => m.getApprenticesByPerson(personData.id));
            if (Array.isArray(apprenticeList) && apprenticeList.length > 0) {
              // Find the apprentice whose person_id field matches the current person id
              const rightApprentice = apprenticeList.find((a: Apprentice) => Number(a.person) === Number(personData.id));
              if (rightApprentice) {
                setApprenticeId(rightApprentice.id);
              } else {
                setError('No se encontró registro de aprendiz para esta persona');
              }
            } else {
              setError('No se encontró registro de aprendiz para esta persona');
            }
          } catch (err) {
            setError('Error consultando aprendiz');
          }
        })
        .catch(() => setError('No se pudo cargar la información del aprendiz'))
        .finally(() => setLoading(false));
    } else if (userData && !userData.person) {
      setError('No se encontró el id de persona en la sesión');
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [userData]);

  return {
    person,
    userData,
    apprenticeId,
    loading,
    error,
  };
};