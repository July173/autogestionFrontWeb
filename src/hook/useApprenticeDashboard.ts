import { useCallback, useEffect, useRef, useState } from 'react';
import { getApprenticeDashboard } from '@/Api/Services/RequestAssignaton';
import { getEnterpriseById } from '@/Api/Services/Enterprise';
import { getModalityProductiveStages } from '@/Api/Services/ModalityProductiveStage';
import { getUserById } from '@/Api/Services/User';
import { User } from '@/Api/types/entities/user.types';

export interface DashboardData {
  has_request: boolean;
  request: {
    id: number;
    enterprise_name: string | null;
    location?: string | null;
    boss_name: string | null;
    modality: string | null;
    start_date: string | null;
    end_date: string | null;
    request_date: string | null;
    request_state: string | null;
    pdf_url: string | null;
  } | null;
  instructor: {
    id: number | null;
    first_name?: string | null;
    second_name?: string | null;
    first_last_name?: string | null;
    second_last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    knowledge_area?: string | null;
    assigned_at?: string | null;
  } | null;
  request_state: string | null;
}

export default function useApprenticeDashboard(initialApprenticeId?: number) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

  const lastFetchedApprenticeId = useRef<number | null>(null);
  // Types for raw API payloads
  interface RawInstructor {
    instructor_id?: number;
    instructor_first_name?: string;
    instructor_second_name?: string;
    instructor_first_last_name?: string;
    instructor_second_last_name?: string;
    instructor_email?: string;
    instructor_phone_number?: string;
    instructor_knowledge_area?: string;
    instructor_assigned_at?: string;
  }

  interface RawDashboard {
    id?: number;
    enterprise_name?: string | null;
    enterprise?: number | string | null;
    enterprise_id?: number | string | null;
    boss_name?: string | null;
    boss?: string | null;
    modality_productive_stage?: number | string | null;
    modality?: number | string | null;
    start_date?: string | null;
    date_start_production_stage?: string | null;
    end_date?: string | null;
    date_end_production_stage?: string | null;
    request_date?: string | null;
    fecha_solicitud?: string | null;
    request_state?: string | null;
    state?: string | null;
    pdf_url?: string | null;
  }

  interface EnterpriseLookup {
    id?: number | string;
    name?: string;
    empresa_nombre?: string;
    enterprise_name?: string;
    name_enterprise?: string;
    municipio?: string;
    ubicacion?: string;
    location?: string;
    address?: string;
    direccion?: string;
    city?: string;
    locate?: string;
  }

  interface Modality {
    id: number;
    name?: string;
    name_modality?: string;
  }

  const load = useCallback(async (apprenticeId?: number) => {
    try {
      setLoading(true);
      let effectiveApprenticeId: number | null = apprenticeId ?? null;

      // try to read user from local state or localStorage
      let currentUser: User | null = userData;
      if (!currentUser) {
        const stored = localStorage.getItem('user_dashboard');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as User;
            currentUser = parsed;
            setUserData(parsed);
          } catch (e) {
            // ignore parse errors
          }
        }
      }

      if (!effectiveApprenticeId && currentUser?.id) {
        try {
          const fullUser = await getUserById(currentUser.id);
          // fullUser.apprentice can be an object or an id
          if (fullUser && (fullUser as any).apprentice) {
            const ap = (fullUser as any).apprentice;
            effectiveApprenticeId = typeof ap === 'object' ? ap.id ?? null : (Number(ap) || null);
          }
        } catch (e) {
          console.warn('Could not fetch full user to determine apprentice id', e);
        }
      }

      if (!effectiveApprenticeId) {
        setDashboardData({ has_request: false, request: null, instructor: null, request_state: null });
        return;
      }

      if (lastFetchedApprenticeId.current === effectiveApprenticeId) return;
      lastFetchedApprenticeId.current = effectiveApprenticeId;

      const response = await getApprenticeDashboard(effectiveApprenticeId);
      const raw = (response && (response as any).data) ? (response as any).data as RawDashboard : (response as RawDashboard | null);

      if (!raw) {
        setDashboardData({ has_request: false, request: null, instructor: null, request_state: null });
        return;
      }

      const mappedRequest: DashboardData['request'] = {
        id: raw.id ?? undefined as any,
        enterprise_name: raw.enterprise_name ?? (raw.enterprise ? String(raw.enterprise) : null) ?? null,
        boss_name: raw.boss_name ?? raw.boss ?? null,
        modality: raw.modality_productive_stage ?? raw.modality ?? null,
        start_date: raw.start_date ?? raw.date_start_production_stage ?? null,
        end_date: raw.end_date ?? raw.date_end_production_stage ?? null,
        request_date: raw.request_date ?? raw.fecha_solicitud ?? null,
        request_state: raw.request_state ?? raw.state ?? null,
        pdf_url: raw.pdf_url ?? null,
      };

      const instructor: DashboardData['instructor'] | null = (
        (raw as RawInstructor).instructor_id || (raw as RawInstructor).instructor_first_name || (raw as RawInstructor).instructor_email
      ) ? {
        id: (raw as RawInstructor).instructor_id ?? null,
        first_name: (raw as RawInstructor).instructor_first_name ?? null,
        second_name: (raw as RawInstructor).instructor_second_name ?? null,
        first_last_name: (raw as RawInstructor).instructor_first_last_name ?? null,
        second_last_name: (raw as RawInstructor).instructor_second_last_name ?? null,
        email: (raw as RawInstructor).instructor_email ?? null,
        phone: (raw as RawInstructor).instructor_phone_number ?? '',
        knowledge_area: (raw as RawInstructor).instructor_knowledge_area ?? null,
        assigned_at: (raw as RawInstructor).instructor_assigned_at ?? null,
      } : null;

      let normalizedState = raw.request_state ?? raw.state ?? null;
      if (normalizedState === 'ASIGNADO') normalizedState = 'ASIGNADO';
      else if (normalizedState === 'RECHAZADO') normalizedState = 'RECHAZADO';
      else normalizedState = 'EN_REVISION';

      const final: DashboardData = {
        has_request: true,
        request: mappedRequest,
        instructor,
        request_state: normalizedState,
      };

      try {
        const enterpriseId = raw.enterprise ?? raw.enterprise_id ?? null;
        if (enterpriseId) {
          const ent = await getEnterpriseById(Number(enterpriseId));
          if (ent) {
            const e = ent as EnterpriseLookup;
            final.request!.enterprise_name = e.name || e.empresa_nombre || e.enterprise_name || e.name_enterprise || String(e.id);
            final.request!.location = e.municipio || e.ubicacion || e.location || e.address || e.direccion || e.city || e.locate || null;
          }
        }

        const modalityCandidate = raw.modality_productive_stage ?? raw.modality ?? mappedRequest.modality ?? null;
        if (modalityCandidate) {
          if (typeof modalityCandidate === 'number' || /^[0-9]+$/.test(String(modalityCandidate))) {
            try {
              const modalities: Modality[] = await getModalityProductiveStages();
              const found = modalities.find(m => m.id === Number(modalityCandidate));
              if (found) final.request!.modality = found.name_modality || found.name || String(found.id);
              else final.request!.modality = String(modalityCandidate);
            } catch (e) {
              final.request!.modality = String(modalityCandidate);
            }
          } else {
            final.request!.modality = String(modalityCandidate);
          }
        }
      } catch (e) {
        console.warn('Enterprise or modality lookup failed', e);
      }

      setDashboardData(final);
    } catch (err: any) {
      console.error('Error al cargar dashboard (useApprenticeDashboard):', err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    load(initialApprenticeId);
  }, [initialApprenticeId, load]);

  const reload = useCallback(() => {
    // allow manual reload; clear lastFetched to force fetch
    lastFetchedApprenticeId.current = null;
    load(initialApprenticeId);
  }, [initialApprenticeId, load]);

  const showInstructor = !!dashboardData && dashboardData.request_state !== 'RECHAZADO' && !!dashboardData.instructor;

  return { dashboardData, loading, userData, reload, showInstructor };
}
