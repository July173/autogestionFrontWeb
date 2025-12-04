import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ENDPOINTS } from '@/Api/config/ConfigApi';
import { InstructorCustomList } from '@/Api/types/entities/instructor.types';

type Params = Record<string, string>;

export default function useFilteredInstructors(initialParams: Params = {}) {
  const queryClient = useQueryClient();
  const [instructors, setInstructors] = useState<InstructorCustomList[]>([]);
  const [loading, setLoading] = useState(false);

  // Stabilize initialParams for hook dependencies by using a JSON key
  const initialKey = JSON.stringify(initialParams || {});

  const fetchInstructors = useCallback(async (params: Params = {}) => {
    const init = initialKey ? JSON.parse(initialKey) as Params : {};
    const payload = { ...init, ...params };
    if (!payload.search) payload.search = '';
    payload.is_followup_instructor = 'true';

    const query = Object.entries(payload)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const cacheKey = ['filteredInstructors', query];

    setLoading(true);
    try {
      // Use react-query's fetchQuery for dedupe and caching
      const data: unknown[] = await queryClient.fetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          const url = `${ENDPOINTS.instructor.filterInstructores}?${query}`;
          const res = await fetch(url);
          const json = await res.json();
          if (Array.isArray(json)) return json as unknown[];
          if (json && Array.isArray((json as { data?: unknown }).data)) return (json as { data?: unknown }).data as unknown[];
          return [] as unknown[];
        },
        staleTime: 1000 * 60 * 5,
      });

      const mapped = (data || []).map((it) => {
        const obj = it as Record<string, unknown>;
        const assigned = (obj.assigned_learners as number) ?? (obj.assigned_count as number) ?? (obj.assigned as number) ?? 0;
        const max = (obj.max_assigned_learners as number) ?? (obj.max_assignments as number) ?? (obj.max as number) ?? 80;
        return {
          id: Number(obj.id as unknown as number),
          name: (obj.name as string) || `${(obj.first_name as string) || ''} ${(obj.first_last_name as string) || ''}`.trim(),
          knowledge_area: (obj.knowledge_area as string) ?? (obj.area as string) ?? undefined,
          email: obj.email as string | undefined,
          first_name: obj.first_name as string | undefined,
          second_name: obj.second_name as string | undefined,
          first_last_name: obj.first_last_name as string | undefined,
          second_last_name: obj.second_last_name as string | undefined,
          assigned_learners: Number(assigned),
          max_assigned_learners: Number(max),
          program: obj.program as string | number | undefined,
        } as InstructorCustomList;
      });

      setInstructors(mapped);
      return mapped;
    } catch (error) {
      setInstructors([]);
      return [] as InstructorCustomList[];
    } finally {
      setLoading(false);
    }
  }, [initialKey, queryClient]);

  return { instructors, loading, fetchInstructors } as const;
}
