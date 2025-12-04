import { useCallback, useEffect, useState } from 'react';
import { getInstructorAssignments } from '@/Api/Services/Instructor';

type AssignmentRow = any;

interface InstructorAssignmentFilters {
  apprentice_name?: string;
  apprentice_id_number?: string;
  modality_name?: string;
  program_name?: string;
  request_state?: string;
}

export default function useInstructorAssignments(
  instructorId?: number,
  filterState?: string,
  filters?: InstructorAssignmentFilters
) {
  const [data, setData] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id?: number, state?: string, additionalFilters?: InstructorAssignmentFilters) => {
    if (!id) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Build filters object to send to the API
      const apiFilters: InstructorAssignmentFilters = { ...additionalFilters };
      
      // Add request_state filter if provided and not 'ALL'
      if (state && state.toUpperCase() !== 'ALL') {
        apiFilters.request_state = state;
      }
      
      const res = await getInstructorAssignments(id, apiFilters);
      setData(Array.isArray(res) ? res : (res.data || []));
    } catch (e: any) {
      setError(e?.message || 'Error al obtener asignaciones');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (instructorId) load(instructorId, filterState, filters);
    else setData([]);
  }, [instructorId, filterState, filters, load]);

  const refresh = useCallback(() => {
    if (instructorId) load(instructorId, filterState, filters);
  }, [instructorId, filterState, filters, load]);

  return { data, loading, error, refresh };
}
