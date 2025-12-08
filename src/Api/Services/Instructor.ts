/**
 * Updates the learner limit of an instructor.
 * @param id - Instructor ID
 * @param max_assigned_learners - New limit
 * @returns Promise with the API response
 */
export async function patchInstructorLimit(id: number, max_assigned_learners: number) {
  const url = ENDPOINTS.instructor.patchLimit.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_assigned_learners })
  });
  
  if (!response.ok) {
    // Intentar extraer el mensaje de error del backend
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || errorData.detail || 'Error al actualizar el límite de aprendices';
      throw new Error(errorMessage);
    } catch (parseError) {
      throw new Error('Error al actualizar el límite de aprendices');
    }
  }
  
  return response.json();
}
/**
 * Service for operations related to the Instructor entity.
 * Includes retrieval, registration, update, and query by ID.
 */
import { ENDPOINTS } from '../config/ConfigApi';
import { CreateInstructor, InstructorCustomList, InstructorBackendResponse } from '../types/entities/instructor.types';
import { KnowledgeArea } from '../types/Modules/general.types';
import { getKnowledgeAreas } from './KnowledgeArea';

/**
 * Gets the list of all instructors.
 * @returns Promise with the array of instructors
 */
export async function getInstructores() {
  const response = await fetch(ENDPOINTS.instructor.getAllInstructores);
  if (!response.ok) throw new Error('Error al obtener instructores');
  return response.json();
}

/**
 * Registers a new instructor in the system.
 * @param data - Instructor data to register
 * @returns Promise with the API response
 */
export async function postInstructor(data: CreateInstructor) {
  // Normalize frontend-friendly keys to backend-expected keys (suffix `_id`) and types
  let typeIdentificationValue: number | undefined = undefined;
  if (typeof data.type_identification === 'number') {
    typeIdentificationValue = data.type_identification as number;
  } else if (data.type_identification && typeof (data.type_identification as { id?: number }).id === 'number') {
    typeIdentificationValue = (data.type_identification as { id: number }).id;
  }

  const payloadToSend: Record<string, unknown> = {
    first_name: data.first_name,
    second_name: data.second_name || '',
    first_last_name: data.first_last_name,
    second_last_name: data.second_last_name || '',
    phone_number: data.phone_number ? Number(data.phone_number) : undefined,
    type_identification: typeIdentificationValue,
    number_identification: data.number_identification ? Number(data.number_identification) : undefined,
    email: data.email,
    // map short keys to expected _id names
    role_id: data.role ? Number(data.role) : undefined,
    contract_type_id: data.contract_type ? Number(data.contract_type as unknown as string) : undefined,
    contract_start_date: data.contract_start_date,
    contract_end_date: data.contract_end_date,
    knowledge_area_id: data.knowledge_area ? Number(data.knowledge_area) : undefined,
    sede_id: data.sede ? Number(data.sede) : undefined,
    is_followup_instructor: !!data.is_followup_instructor,
  };

  const response = await fetch(ENDPOINTS.instructor.allInstructores, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadToSend)
  });
  if (!response.ok) throw new Error('Error al registrar instructor');
  return response.json();
}

/**
 * Updates the data of an existing instructor.
 * @param id - Instructor ID
 * @param data - Updated instructor data
 * @returns Promise with the API response
 */
export async function putInstructor(id: string, data: CreateInstructor) {
  const url = ENDPOINTS.instructor.putIdInstructor.replace('{id}', id);

  // Normalize and map fields as in postInstructor
  let typeIdentificationValue: number | undefined = undefined;
  if (typeof data.type_identification === 'number') {
    typeIdentificationValue = data.type_identification as number;
  } else if (data.type_identification && typeof (data.type_identification as { id?: number }).id === 'number') {
    typeIdentificationValue = (data.type_identification as { id: number }).id;
  }

  const payloadToSend: Record<string, unknown> = {};
  if (data.first_name !== undefined) payloadToSend.first_name = data.first_name;
  if (data.second_name !== undefined) payloadToSend.second_name = data.second_name || '';
  if (data.first_last_name !== undefined) payloadToSend.first_last_name = data.first_last_name;
  if (data.second_last_name !== undefined) payloadToSend.second_last_name = data.second_last_name || '';
  if (data.phone_number !== undefined) payloadToSend.phone_number = data.phone_number ? Number(data.phone_number) : undefined;
  if (typeIdentificationValue !== undefined) payloadToSend.type_identification = typeIdentificationValue;
  if (data.number_identification !== undefined) payloadToSend.number_identification = data.number_identification ? Number(data.number_identification) : undefined;
  if (data.email !== undefined) payloadToSend.email = data.email;
  if (data.role !== undefined) payloadToSend.role_id = Number(data.role);
  if (data.contract_type !== undefined) payloadToSend.contract_type_id = Number(data.contract_type as unknown as string);
  if (data.contract_start_date !== undefined) payloadToSend.contract_start_date = data.contract_start_date;
  if (data.contract_end_date !== undefined) payloadToSend.contract_end_date = data.contract_end_date;
  if (data.knowledge_area !== undefined) payloadToSend.knowledge_area_id = Number(data.knowledge_area);
  if (data.sede !== undefined) payloadToSend.sede_id = Number(data.sede);
  if (data.is_followup_instructor !== undefined) payloadToSend.is_followup_instructor = !!data.is_followup_instructor;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadToSend)
  });
  if (!response.ok) {
    // Try to extract backend error message and throw it so callers can show it
    try {
      const errData = await response.json();
      // Backend may return { detail: '...', message: '...', field: ['msg'] }
      const msg = (errData && (errData.message || errData.detail))
        || (typeof errData === 'object' ? Object.values(errData).flat().join(' ') : String(errData))
        || 'Error al actualizar instructor';
      throw new Error(String(msg));
    } catch (parseErr) {
      throw new Error('Error al actualizar instructor');
    }
  }
  return response.json();
}



/**
 * Gets the custom list of instructors for assignment.
 * Transforms backend data to the format expected by the frontend.
 * Includes the knowledge area name.
 * @returns Promise with the array of custom instructors
 */
export async function getInstructoresCustomList(): Promise<InstructorCustomList[]> {
  try {
  // Get instructors and knowledge areas in parallel
    const [instructoresResponse, knowledgeAreasData] = await Promise.all([
      fetch(ENDPOINTS.instructor.getCustomList),
      getKnowledgeAreas()
    ]);

    if (!instructoresResponse.ok) {
      throw new Error('Error al obtener lista de instructores');
    }

    const instructores: InstructorBackendResponse[] = await instructoresResponse.json();
    
  // Create a map of ID -> Knowledge area name
    const areasMap = new Map<number, string>();
    if (Array.isArray(knowledgeAreasData)) {
      knowledgeAreasData.forEach((area: KnowledgeArea) => {
        areasMap.set(area.id, area.name || area.description || `Área ${area.id}`);
      });
    }
    
  // Transform backend data to the format expected by the frontend
    if (Array.isArray(instructores)) {
      return instructores.map((instructor: InstructorBackendResponse): InstructorCustomList => {
  // Build the full name of the instructor
        const nombreCompleto = [
          instructor.first_name,
          instructor.second_name,
          instructor.first_last_name,
          instructor.second_last_name
        ].filter(Boolean).join(' ');
        
  // Get the knowledge area name
        const areaName = instructor.knowledge_area 
          ? areasMap.get(instructor.knowledge_area) || `Área ${instructor.knowledge_area}`
          : undefined;
        
        return {
          id: instructor.id,
          name: nombreCompleto,
          knowledge_area: areaName,
          email: instructor.email,
          assigned_learners: 0, // TODO: backend should return this in the custom-list endpoint
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error en getInstructoresCustomList:', error);
    throw error;
  }
}

/**
 * Gets the list of follow-up instructors.
 * @returns Promise with the array of follow-up instructors
 */
export async function getInstructoresSeguimiento() {
  const response = await fetch(ENDPOINTS.instructor.getAllInstructores + '?is_followup_instructor=true');
  if (!response.ok) throw new Error('Error al obtener instructores de seguimiento');
  return response.json();
}

/**
 * Gets the assignments related to a specific instructor.
 * Endpoint: GET /general/instructors/{id}/asignations/
 * @param instructorId - Instructor ID
 * @returns Promise with the array of assignments
 */
export async function getInstructorAssignments(
  instructorId: number,
  filters?: {
    apprentice_name?: string;
    apprentice_id_number?: string;
    modality_name?: string;
    program_name?: string;
    request_state?: string;
  }
) {
  try {
    let url = ENDPOINTS.instructor.getInstructorAssignments.replace('{id}', String(instructorId));
    
    // Build query params from filters
    if (filters) {
      const params = new URLSearchParams();
      if (filters.apprentice_name) params.append('apprentice_name', filters.apprentice_name);
      if (filters.apprentice_id_number) params.append('apprentice_id_number', filters.apprentice_id_number);
      if (filters.modality_name) params.append('modality_name', filters.modality_name);
      if (filters.program_name) params.append('program_name', filters.program_name);
      if (filters.request_state) params.append('request_state', filters.request_state);
      
      const queryString = params.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      try {
        const err = await response.json();
        throw new Error(err.message || 'Error al obtener asignaciones del instructor');
      } catch (e) {
        throw new Error('Error al obtener asignaciones del instructor');
      }
    }

    const result = await response.json();
    // Support both { data: [...] } and [...] shapes
    return Array.isArray(result) ? result : (result.data || []);
  } catch (error) {
    console.error('Error en getInstructorAssignments:', error);
    throw error;
  }
}

// Backwards-compatibility alias (if other code expects the old name)
export { getInstructorAssignments as getFormRequestById };

/**
 * Gets the dashboard data for an instructor (stats and upcoming visits)
 * @param instructorId - Instructor ID
 * @returns Promise with dashboard data
 */
export async function getInstructorDashboard(instructorId: number) {
  const url = ENDPOINTS.instructor.getInstructorDashboard.replace('{id}', String(instructorId));
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Error al obtener dashboard del instructor');
  }
  
  return response.json();
}