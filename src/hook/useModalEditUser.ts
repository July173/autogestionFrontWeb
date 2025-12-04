import { useEffect, useState, useCallback } from 'react';
import { getUserById } from '../Api/Services/User';
import { getRegionales } from '../Api/Services/Regional';
import { getSedes } from '../Api/Services/Sede';
import { getCenters } from '../Api/Services/Center';
import { getPrograms } from '../Api/Services/Program';
import { getRoles } from '../Api/Services/Rol';
import { getKnowledgeAreas } from '../Api/Services/KnowledgeArea';
import useApprenticeForm from './useApprenticeForm';
import useInstructorForm from './useInstructorForm';
import { putApprentice } from '../Api/Services/Apprentice';
import { putInstructor } from '../Api/Services/Instructor';
import { getUserById as fetchUser } from '../Api/Services/User';
import type { Regional, Sede, Center, Program, KnowledgeArea, Ficha } from '../Api/types/Modules/general.types';
import type { Role } from '../Api/types/entities/role.types';
import type { CreateApprentice } from '../Api/types/entities/apprentice.types';
import type { CreateInstructor } from '../Api/types/entities/instructor.types';

// Local loose types to avoid widespread `any` while keeping flexibility for API shapes
type LooseObj = Record<string, unknown>;

type ApprenticeAPI = LooseObj & {
  id?: number;
  ficha?: number | LooseObj | null;
  ficha_id?: number | string | null;
  programa?: LooseObj | number | null;
  program_id?: number;
  role?: number;
};

type InstructorAPI = LooseObj & {
  id?: number;
  centro?: LooseObj | number | null;
  center?: number | null;
  sede?: LooseObj | number | null;
  regional?: LooseObj | number | null;
  role?: number | null;
};

type APIUser = LooseObj & {
  apprentice?: ApprenticeAPI | null;
  instructor?: InstructorAPI | null;
  person?: LooseObj | null;
  email?: string | null;
  role?: LooseObj | null;
};

type TabType = 'aprendiz' | 'instructor';

type UseModalEditUserParams = {
  userId: string | number;
  initialTab?: TabType;
  onSuccess?: (data?: unknown) => void;
  onClose?: () => void;
};

export default function useModalEditUser({ userId, initialTab, onSuccess, onClose }: UseModalEditUserParams) {
  const [tab, setTab] = useState<TabType>(initialTab === 'aprendiz' ? 'aprendiz' : 'instructor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [centros, setCentros] = useState<Center[]>([]);
  const [programas, setProgramas] = useState<Program[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [areas, setAreas] = useState<KnowledgeArea[]>([]);

  const { apprentice, setApprentice, fichas, handleChange: handleAprChange } = useApprenticeForm();
  const { instructor, setInstructor, handleChange: handleInsChange } = useInstructorForm();

  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<TabType | null>(null);

  // Load selects
  useEffect(() => {
    getRegionales().then(setRegionales).catch(() => setRegionales([]));
    getSedes().then(setSedes).catch(() => setSedes([]));
    getCenters().then(setCentros).catch(() => setCentros([]));
    getPrograms().then(setProgramas).catch(() => setProgramas([]));
    getRoles().then(setRoles).catch(() => setRoles([]));
    getKnowledgeAreas().then(setAreas).catch(() => setAreas([]));
  }, []);

  // Safe accessor
  const getObjProp = <T = unknown>(obj: unknown, key: string): T | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;
    const o = obj as Record<string, unknown>;
    return o[key] as T | undefined;
  };

  // Build a normalized CreateInstructor object from API parts (instructor obj, person obj, role obj)
  const buildInstructorFromApi = useCallback((ins: unknown, person: unknown, roleObj: unknown, topEmail?: unknown): CreateInstructor => {
    const i = ins as Record<string, unknown> | null;
    const p = person as Record<string, unknown> | null;
    const safeNum = (v: unknown) => {
      if (v === undefined || v === null || v === '') return 0;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = Number(v);
        return Number.isNaN(n) ? 0 : n;
      }
      if (typeof v === 'object') return getObjProp<number>(v, 'id') ?? 0;
      return 0;
    };

    const centroObj = i?.['centro'] ?? null;
    const sedeObj = i?.['sede'] ?? null;
    const regionalObj = i?.['regional'] ?? null;

  const roleEmail = getObjProp<string>(roleObj, 'email');
  const personEmail = (p && (p['email'] as string)) || undefined;
  const topLevelEmail = typeof topEmail === 'string' ? topEmail : undefined;

    const normalized: CreateInstructor = {
      first_name: (p && (p['first_name'] as string)) || (i && (i['first_name'] as string)) || '',
      second_name: (p && (p['second_name'] as string)) || (i && (i['second_name'] as string)) || '',
      first_last_name: (p && (p['first_last_name'] as string)) || (i && (i['first_last_name'] as string)) || '',
      second_last_name: (p && (p['second_last_name'] as string)) || (i && (i['second_last_name'] as string)) || '',
      phone_number: (p && (p['phone_number'] as unknown)) || (i && (i['phone_number'] as unknown)) || '',
      type_identification: (p && (p['type_identification'] as number)) ?? (i && (i['type_identification'] as number)) ?? 0,
      number_identification: (p && (p['number_identification'] as unknown)) || (i && (i['number_identification'] as unknown)) || '',
  // Prefer top-level user email, then person email, then role email
  email: topLevelEmail ?? personEmail ?? roleEmail ?? '',
      role: safeNum(getObjProp<number>(roleObj, 'id') ?? i?.['role'] ?? getObjProp<number>(i, 'role')),
      // contract fields: prefer instructor values, but also tolerate person-level variants if present
      contract_type: String(i?.['contract_type'] ?? i?.['contractType'] ?? (p && (p['contract_type'] as string)) ?? (p && (p['contractType'] as string)) ?? ''),
      contract_start_date: String(i?.['contract_start_date'] ?? i?.['contractStartDate'] ?? (p && (p['contract_start_date'] as string)) ?? ''),
      contract_end_date: String(i?.['contract_end_date'] ?? i?.['contractEndDate'] ?? (p && (p['contract_end_date'] as string)) ?? ''),
      knowledge_area: safeNum(i?.['knowledge_area'] ?? i?.['knowledgeArea']),
      center: safeNum(i?.['centro'] ?? i?.['center']),
      sede: safeNum(i?.['sede']),
      regional: safeNum(i?.['regional']),
  is_followup_instructor: Boolean(i?.['is_followup_instructor']),
  // keep object variants for display (loose types because API returns object shapes)
  centro_obj: centroObj as unknown as Record<string, unknown> | null,
  sede_obj: sedeObj as unknown as Record<string, unknown> | null,
  regional_obj: regionalObj as unknown as Record<string, unknown> | null,
    } as CreateInstructor;

    return normalized;
  }, []);

  // Load and normalize user
  useEffect(() => {
    setLoading(true);
    setError('');
    fetchUser(String(userId))
      .then((data: APIUser) => {
        setUserData(data);
        if (data.apprentice) {
          setTab('aprendiz');
          const ap = data.apprentice as ApprenticeAPI;
          let ficha_id = '';
          let ficha_obj: Ficha | null = null;
          const fichaField = ap.ficha ?? ap.ficha_id;
          if (fichaField && typeof fichaField === 'object') {
            ficha_id = String(getObjProp<number>(fichaField, 'id') ?? '');
            ficha_obj = fichaField as unknown as Ficha;
          } else if (typeof fichaField === 'number') {
            ficha_id = String(fichaField);
          } else if (ap.ficha_id) {
            ficha_id = String(ap.ficha_id);
          }
          setApprentice(prev => ({ ...(prev as unknown as Record<string, unknown>), ...(ap as Record<string, unknown>), ...(data.person as Record<string, unknown>), email: (data.email as string) ?? '', program: getObjProp<number>(ap.programa as LooseObj ?? {}, 'id') || ap.program_id || ap.program_id || 0, programa_obj: (ap.programa as unknown as Program) || null, ficha_id, ficha_obj } as unknown as CreateApprentice));
        } else if (data.instructor) {
          const ins = data.instructor as InstructorAPI;
          setTab('instructor');
          // helper to extract id from various shapes
          const extractId = (val: unknown) => {
            if (val === undefined || val === null) return 0;
            if (typeof val === 'number') return val;
            if (typeof val === 'string' && val.trim() !== '') {
              const n = Number(val);
              return Number.isNaN(n) ? 0 : n;
            }
            if (typeof val === 'object') return getObjProp<number>(val, 'id') ?? getObjProp<number>(val, 'pk') ?? 0;
            return 0;
          };

          // Build normalized instructor using helper to ensure consistency
          const built = buildInstructorFromApi(ins, data.person, data.role, data.email);
          setInstructor(() => built);
          setUserData(data as Record<string, unknown>);
          
        }
      })
      .catch(() => setError('Error al cargar usuario'))
      .finally(() => setLoading(false));
  }, [userId, setApprentice, setInstructor, buildInstructorFromApi]);

  // dependent selects for instructor
  useEffect(() => {
    if (tab === 'instructor' && instructor) {
      // Only run dependent-select clearing when we have centers/sedes loaded to avoid
      // wiping values when selects are still fetching.
      if (centros && centros.length > 0) {
        const filteredCenters = centros.filter((c: Center) => c.regional === instructor.regional);
        if (instructor.center && !filteredCenters.some((c: Center) => c.id === instructor.center)) {
          // clear the selected center/sede when the current center is not valid for the regional
          setInstructor(prev => prev ? { ...prev, center: 0, sede: 0 } : prev);
        }
      }
      if (sedes && sedes.length > 0) {
        const filteredSedes = sedes.filter((s: Sede) => s.center === instructor.center);
        if (instructor.sede && !filteredSedes.some((s: Sede) => s.id === instructor.sede)) {
          // clear the selected sede when not valid for the selected center
          setInstructor(prev => prev ? { ...prev, sede: 0 } : prev);
        }
      }
    }
  }, [tab, instructor, centros, sedes, setInstructor]);

  // validations
  const validateApprenticeLocal = (data: unknown) => {
    const obj = data as LooseObj;
    const has = (k: string) => {
      const v = obj[k];
      return v !== undefined && v !== null && String(v).trim() !== '';
    };
    if (!has('type_identification') || !has('number_identification') || !has('first_name') || !has('first_last_name') || !has('phone_number') || !has('email') || (!has('program') && !has('program_id')) || !has('ficha_id')) {
      return 'Todos los campos con * son obligatorios.';
    }
    if (isNaN(Number(obj['number_identification']))) return 'El número de documento debe ser numérico.';
    if (!/^[0-9]{10}$/.test(String(obj['phone_number']))) return 'El teléfono debe tener 10 dígitos.';
    if (!String(obj['email']).endsWith('@soy.sena.edu.co')) return 'El correo de aprendiz debe terminar en @soy.sena.edu.co';
    return null;
  };

  const validateInstructorLocal = (data: unknown) => {
    const obj = data as LooseObj;
    const present = (v: unknown) => {
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '';
      return true;
    };
    const getFirst = (o: LooseObj, keys: string[]) => {
      for (const k of keys) if (Object.prototype.hasOwnProperty.call(o, k)) return o[k];
      return undefined;
    };
    if (
      !present(obj['type_identification']) ||
      !present(obj['number_identification']) ||
      !present(obj['first_name']) ||
      !present(obj['first_last_name']) ||
      !present(obj['phone_number']) ||
      !present(obj['email']) ||
      !present(getFirst(obj, ['role_id', 'role'])) ||
      !present(getFirst(obj, ['contractType', 'contract_type'])) ||
      !present(getFirst(obj, ['contractStartDate', 'contract_start_date'])) ||
      !present(getFirst(obj, ['contractEndDate', 'contract_end_date'])) ||
      !present(getFirst(obj, ['knowledgeArea', 'knowledge_area'])) ||
      !present(getFirst(obj, ['center_id', 'center'])) ||
      !present(getFirst(obj, ['sede_id', 'sede'])) ||
      !present(getFirst(obj, ['regional_id', 'regional']))
    ) {
      return 'Todos los campos son obligatorios excepto segundo nombre y segundo apellido.';
    }
    if (isNaN(Number(obj['number_identification']))) return 'El número de documento debe ser numérico.';
    if (!/^[0-9]{10}$/.test(String(obj['phone_number']))) return 'El teléfono debe tener 10 dígitos.';
    if (!String(obj['email']).endsWith('@sena.edu.co')) return 'El correo de instructor debe terminar en @sena.edu.co';
    return null;
  };

  const getBackendErrorMsg = (err: unknown) => {
    const e = err as LooseObj & { response?: { data?: unknown }; detail?: string; error?: string; message?: string };
    if (e?.response?.data) {
      if (typeof e.response.data === 'string') return e.response.data;
      const d = e.response.data as LooseObj;
      if (d?.detail) return d.detail as string;
      if (d?.error) return d.error as string;
      if (d?.message) return d.message as string;
      try {
        return Object.values(d).join(' ');
      } catch (err2) {
        return String(d);
      }
    }
    if (e?.detail) return e.detail;
    if (e?.error) return e.error;
    if (e?.message) return e.message;
    return 'Error al actualizar usuario';
  };

  const startSubmit = (tipo: TabType) => {
    setPendingSubmit(tipo);
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');
    if (pendingSubmit === 'aprendiz' && apprentice) {
      const errMsg = validateApprenticeLocal(apprentice);
      if (errMsg) {
        setError(errMsg);
        setLoading(false);
        setPendingSubmit(null);
        setNotificationMessage(errMsg);
        setShowNotification(true);
        return;
      }
      const nombres = apprentice.first_name.trim().split(' ');
      const apellidos = apprentice.first_last_name.trim().split(' ');
      const payload = {
        ...apprentice,
        first_name: nombres[0] || '',
        second_name: nombres.slice(1).join(' '),
        first_last_name: apellidos[0] || '',
        second_last_name: apellidos.slice(1).join(' '),
        role_id: getObjProp<number>(userData?.role, 'id') || getObjProp<number>(userData?.apprentice, 'role_id') || 0,
        program_id: Number(apprentice.program),
        ficha_id: String(apprentice.ficha_id ?? ''),
      };
      const apprenticeId = getObjProp<number>(userData?.apprentice, 'id') ?? userId;
      try {
        console.debug('PUT apprentice payload (pre-send)', payload);
        // Build API payload matching UpdateApprenticeSerializer expected fields
        const apiPayload = {
          type_identification: Number(payload.type_identification || 0),
          number_identification: Number(payload.number_identification || 0),
          first_name: String(payload.first_name || ''),
          second_name: String(payload.second_name || ''),
          first_last_name: String(payload.first_last_name || ''),
          second_last_name: String(payload.second_last_name || ''),
          phone_number: payload.phone_number ? Number(payload.phone_number) : undefined,
          email: String(payload.email || ''),
          // send only `ficha` as the backend update serializer expects (integer id)
          ficha: Number(payload.ficha_id ?? 0),
          role: Number(payload.role_id || payload.role || 0),
        };
        console.debug('PUT apprentice payload (for API)', apiPayload);
        const putResult = await putApprentice(String(apprenticeId), apiPayload as unknown as CreateApprentice);
        console.debug('PUT apprentice response', putResult);
        try {
          const refreshedUser = await getUserById(String(apprenticeId));
          if (refreshedUser && typeof refreshedUser === 'object') {
            const refreshedApprentice = refreshedUser.apprentice || null;
            const refreshedPerson = refreshedUser.person || null;
            if (refreshedApprentice) {
              const ra = refreshedApprentice as unknown as Record<string, unknown>;
              let fichaIdVal: string | number | undefined = undefined;
              let fichaObj: Ficha | null = null;
              if (ra['ficha_id'] !== undefined && ra['ficha_id'] !== null) {
                fichaIdVal = ra['ficha_id'] as string | number;
              } else if (ra['ficha'] !== undefined && ra['ficha'] !== null) {
                const fichaField = ra['ficha'];
                if (typeof fichaField === 'object') {
                  const fichaObjCandidate = fichaField as unknown as Ficha;
                  fichaIdVal = fichaObjCandidate.id as number | string;
                  fichaObj = fichaObjCandidate;
                } else {
                  fichaIdVal = fichaField as string | number;
                }
              }
              const normalizedAp: Record<string, unknown> = { ...(ra as Record<string, unknown>) };
              if (fichaIdVal !== undefined) normalizedAp['ficha_id'] = String(fichaIdVal);
              if (fichaObj) normalizedAp['ficha_obj'] = fichaObj;
              setApprentice(prev => prev ? ({ ...prev, ...(normalizedAp as unknown as Partial<CreateApprentice & { programa_obj?: Program | null; ficha_obj?: Ficha | null; }>) }) : (normalizedAp as unknown as CreateApprentice & { programa_obj?: Program | null; ficha_obj?: Ficha | null; }));
            }
            if (refreshedPerson) {
              setUserData(prev => prev ? ({ ...prev, person: refreshedPerson, apprentice: refreshedApprentice || prev?.apprentice }) : ({ ...refreshedUser }));
            } else {
              setUserData(prev => prev ? ({ ...prev, apprentice: refreshedApprentice || prev?.apprentice }) : ({ ...refreshedUser }));
            }
            try { if (onSuccess) onSuccess(refreshedUser); } catch (ex) { console.debug('onSuccess callback error', ex); }
          }
        } catch (reFetchErr) {
          console.debug('Error refetching user after apprentice PUT', reFetchErr);
        }
      } catch (err) {
        const backendMsg = getBackendErrorMsg(err);
        setError(backendMsg);
        setLoading(false);
        setPendingSubmit(null);
        setNotificationMessage(backendMsg);
        setShowNotification(true);
        return;
      }
    } else if (pendingSubmit === 'instructor' && instructor) {
      const errMsg = validateInstructorLocal(instructor);
      if (errMsg) {
        setError(errMsg);
        setLoading(false);
        setPendingSubmit(null);
        setNotificationMessage(errMsg);
        setShowNotification(true);
        return;
      }
      const nombres = instructor.first_name.trim().split(' ');
      const apellidos = instructor.first_last_name.trim().split(' ');
      const toSafeId = (v: unknown, objAlternate?: unknown) => {
            // prefer numeric or nested object id
            if (v === undefined || v === null || v === '') v = objAlternate;
            if (v === undefined || v === null) return undefined;
            if (typeof v === 'object') {
              return getObjProp<number>(v as Record<string, unknown>, 'id') ?? getObjProp<number>(v as Record<string, unknown>, 'sede_id') ?? getObjProp<number>(v as Record<string, unknown>, 'center_id') ?? getObjProp<number>(v as Record<string, unknown>, 'regional_id') ?? undefined;
            }
            if (typeof v === 'number') return v;
            const n = Number(String(v));
            return Number.isNaN(n) ? undefined : n;
      };

      const payload = {
        first_name: nombres[0] || '',
        second_name: nombres.slice(1).join(' '),
        first_last_name: apellidos[0] || '',
        second_last_name: apellidos.slice(1).join(' '),
        phone_number: String(instructor.phone_number || ''),
        type_identification: Number(instructor.type_identification),
        number_identification: String(instructor.number_identification || ''),
        email: String(instructor.email || ''),
        // use short keys (role, knowledge_area, center, sede, regional)
        // putInstructor will map these to the backend *_id fields
        role: toSafeId(instructor.role),
        contract_type: String(instructor.contract_type || ''),
        contract_start_date: String(instructor.contract_start_date || ''),
        contract_end_date: String(instructor.contract_end_date || ''),
  knowledge_area: toSafeId(instructor.knowledge_area, getObjProp<number>(userData?.instructor, 'knowledge_area') ?? getObjProp<number>(instructor as unknown, 'knowledge_area')),
  center: toSafeId(instructor.center, getObjProp<number>(userData?.instructor, 'centro') ?? getObjProp<number>(instructor as unknown, 'centro') ?? getObjProp<number>(userData?.instructor, 'center')),
  sede: toSafeId(instructor.sede, getObjProp<number>(userData?.instructor, 'sede') ?? getObjProp<number>(instructor as unknown, 'sede')),
  regional: toSafeId(instructor.regional, getObjProp<number>(userData?.instructor, 'regional') ?? getObjProp<number>(instructor as unknown, 'regional')),
        is_followup_instructor: Boolean(instructor.is_followup_instructor),
      };
      
      const instructorId = getObjProp<number>(userData?.instructor, 'id') ?? userId;
      try {
        const putResult = await putInstructor(String(instructorId), payload as unknown as CreateInstructor);
        console.debug('PUT instructor response', putResult);
        try {
          const refreshedUser = await getUserById(String(instructorId));
          if (refreshedUser && typeof refreshedUser === 'object') {
            const refreshedInstructor = refreshedUser.instructor || null;
            const refreshedPerson = refreshedUser.person || null;
            if (refreshedInstructor) {
              const ri = refreshedInstructor as Record<string, unknown>;
              const rp = refreshedPerson as Record<string, unknown> | null;
              // Use the shared builder to produce a consistent CreateInstructor shape
              const built = buildInstructorFromApi(ri, rp, refreshedUser.role, (refreshedUser as Record<string, unknown>)?.email);
              setInstructor(() => built);
            }
            // update userData with refreshed parts
            if (refreshedPerson) {
              setUserData(prev => prev ? ({ ...prev, person: refreshedPerson, instructor: refreshedInstructor || prev?.instructor }) : ({ ...refreshedUser }));
            } else {
              setUserData(prev => prev ? ({ ...prev, instructor: refreshedInstructor || prev?.instructor }) : ({ ...refreshedUser }));
            }
            // Show success message if backend returned one on PUT
            // Show success message if backend returned one on PUT
            let didShowNotification = false;
            try {
              const maybeMessage = (putResult && typeof putResult === 'object' && (putResult as Record<string, unknown>)['message']) ? String((putResult as Record<string, unknown>)['message']) : 'Instructor actualizado correctamente';
              setNotificationMessage(maybeMessage);
              setShowNotification(true);
              didShowNotification = true;
            } catch (ex) {
              // ignore
            }
            try { if (onSuccess) onSuccess(refreshedUser); } catch (ex) { console.debug('onSuccess callback error', ex); }
          }
        } catch (reFetchErr) {
          console.debug('Error refetching user after PUT', reFetchErr);
        }
      } catch (err) {
        const backendMsg = getBackendErrorMsg(err);
        setError(backendMsg);
        setLoading(false);
        setPendingSubmit(null);
        setNotificationMessage(backendMsg);
        setShowNotification(true);
        return;
      }
    }
    if (onSuccess) onSuccess();
    // If we showed a backend notification (success/error) keep modal open so user can read it.
    // Close only when there was no notification shown by the flow above.
    if (!showNotification && onClose) onClose();
    setLoading(false);
    setPendingSubmit(null);
  };

  return {
    tab,
    setTab,
    loading,
    error,
    showNotification,
    setShowNotification,
    notificationMessage,
    setNotificationMessage,
    regionales,
    sedes,
    centros,
    programas,
    roles,
    areas,
    fichas,
    apprentice,
    instructor,
    setApprentice,
    setInstructor,
    handleAprChange,
    handleInsChange,
    userData,
    showConfirm,
    setShowConfirm,
    pendingSubmit,
    setPendingSubmit,
    startSubmit,
    confirmSubmit,
    validateApprentice: validateApprenticeLocal,
    validateInstructor: validateInstructorLocal,
  };
}
