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
      
      // Add request_state filter from filterState prop ONLY if:
      // 1. filterState is provided and not 'ALL'
      // 2. AND there's no request_state already set in additionalFilters (user's filter takes priority)
      if (state && state.toUpperCase() !== 'ALL' && !additionalFilters?.request_state) {
        apiFilters.request_state = state;
      }
      
      const res = await getInstructorAssignments(id, apiFilters);
      const dataArray = Array.isArray(res) ? res : (res.data || []);
      console.log('=== INSTRUCTOR ASSIGNMENTS LOADED ===');
      console.log('Total rows:', dataArray.length);
      if (dataArray.length > 0) {
        console.log('First row state_asignation:', dataArray[0].state_asignation);
        console.log('First row sample:', dataArray[0]);
      }
      setData(dataArray);
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
    console.log('=== REFRESH CALLED ===');
    console.log('instructorId:', instructorId);
    console.log('filterState:', filterState);
    console.log('filters:', filters);
    if (instructorId) {
      console.log('Ejecutando load...');
      load(instructorId, filterState, filters);
    } else {
      console.warn('No instructorId, no se puede recargar');
    }
  }, [instructorId, filterState, filters, load]);

  return { data, loading, error, refresh };
}
