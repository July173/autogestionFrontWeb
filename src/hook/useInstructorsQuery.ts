import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@/Api/config/ConfigApi';
import { InstructorCustomList } from '@/Api/types/entities/instructor.types';

type Params = Record<string, string>;

const mapItem = (obj: Record<string, unknown>): InstructorCustomList => {
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
};

export default function useInstructorsQuery(params: Params = {}, opts?: { enabled?: boolean }) {
  const payload = useMemo(() => ({ ...params, is_followup_instructor: 'true', search: params.search ?? '' }), [params]);

  const queryKey = useMemo(() => ['filteredInstructors', payload], [payload]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const queryString = Object.entries(payload)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `${ENDPOINTS.instructor.filterInstructores}?${queryString}`;
      const res = await fetch(url);
      const json = await res.json();
      let items: unknown[] = [];
      if (Array.isArray(json)) items = json as unknown[];
      else if (json && Array.isArray((json as { data?: unknown }).data)) items = (json as { data?: unknown }).data as unknown[];
      return items.map((it) => mapItem(it as Record<string, unknown>));
    },
    staleTime: 1000 * 60 * 5,
    enabled: opts?.enabled ?? true,
  });

  return query;
}
