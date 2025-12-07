import { ENDPOINTS } from '@/Api/config/ConfigApi';
import { ReassignInstructorPayload, VisitsByAsignationResponse } from '@/Api/types/Modules/assign.types';

export async function reassignInstructor(payload: ReassignInstructorPayload) {
  const url = ENDPOINTS.AssignationInstructor.reassignInstructor;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(txt || 'Error en reassignInstructor');
  }

  return response.json();
}

export default { reassignInstructor };

export async function getAssignationByRequest(requestId: number) {
  // Prefer the filtered endpoint to avoid downloading the whole list
  try {
    const url = `${ENDPOINTS.AssignationInstructor.filterAssignationInstructor}?request_asignation=${encodeURIComponent(String(requestId))}`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Error fetching assignations');
    }
    const result = await res.json();
    const data = Array.isArray(result) ? result : (result.data || []);
    if (!Array.isArray(data)) return null;
    // The filtered endpoint should return zero or one items matching the request
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    // Fallback: try the non-filtered endpoint (legacy support)
    const url = ENDPOINTS.AssignationInstructor.getAllAssignationInstructor;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Error fetching assignations');
    }
    const list = await res.json();
    if (!Array.isArray(list)) return null;
    const found = (list as any[]).find((it) => Number(it.request_asignation) === Number(requestId));
    return found ?? null;
  }
}

/**
 * Get visits by asignation instructor ID
 * @param asignationId - ID of the asignation instructor
 * @returns Promise with visits data
 */
export async function getVisitsByAsignation(asignationId: number): Promise<VisitsByAsignationResponse> {
  const url = `${ENDPOINTS.AssignationInstructor.VisitsAssignationInstructor}?id=${asignationId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(txt || 'Error al obtener las visitas');
  }
  
  return response.json();
}
