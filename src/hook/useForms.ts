import { useCallback, useEffect, useState } from 'react';
import { getForms, postForm, filterForms } from '../Api/Services/Form';
import { Form as FormType } from '../Api/types/entities/form.types';

interface UseFormsResult {
  forms: FormType[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createForm: (data: Partial<FormType>) => Promise<void>;
  applyFilter: (params: { search?: string; active?: string }) => Promise<void>;
}

export default function useForms(): UseFormsResult {
  const [forms, setForms] = useState<FormType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getForms();
      setForms(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias - la función es estable

  // Solo ejecutar fetchAll una vez al montar
  useEffect(() => {
    fetchAll();
  }, []); // Sin dependencia de fetchAll para evitar loops

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getForms();
      setForms(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const createForm = useCallback(async (data: Partial<FormType>) => {
    setLoading(true);
    try {
      await postForm(data);
      // Refrescar después de crear
      const freshData = await getForms();
      setForms(freshData);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilter = useCallback(async (params: { search?: string; active?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await filterForms(params);
      setForms(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  return { forms, loading, error, refresh, createForm, applyFilter };
}
