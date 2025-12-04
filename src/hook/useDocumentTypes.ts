import { useState, useEffect } from 'react';
import { getDocumentTypesWithEmpty } from '../Api/Services/TypeDocument';

/**
 * Optimized hook for managing document types.
 * Fetches document types from the API and provides loading/error states.
 * 
 * @returns Object containing document types array, loading state, and error message
 */
export const useDocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: number | ""; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDocumentTypesWithEmpty()
      .then(setDocumentTypes)
      .catch(() => setError('No se pudieron cargar los tipos desde el servidor'))
      .finally(() => setLoading(false));
  }, []);

  return {
    documentTypes,
    loading,
    error
  };
};