/**
 * Types and interfaces for the Instructor entity.
 * Includes structure and registration data for instructors.
 */
/**
 * Types and interfaces for the Instructor entity.
 * Includes structure and registration data for instructors.
 */
export interface Instructor {
  id: number;
  person: number;
  active: boolean;
  contract_type: string;
  contract_start_date: string;
  contract_end_date: string;
  knowledge_area: number;
}

export interface CreateInstructor {
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  phone_number: string;
  // Backend may expect either a numeric id or a nested DocumentType-like object.
  type_identification: number | { id: number };
  number_identification: string | number;
  email: string;
  role: number;
  contract_type: string;
  contract_start_date: string;
  contract_end_date: string;
  knowledge_area: number;
  center?: number;
  sede?: number;
  regional?: number;
  is_followup_instructor: boolean;
}

export interface InstructorCustomList {
  id: number;
  name?: string;
  knowledge_area?: string | number;
  email?: string;
  first_name?: string;
  second_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  assigned_learners?: number;
  max_assigned_learners?: number;
  program?: string | number;
}

/**
 * Interfaz para los datos del instructor que vienen del backend
 * en el endpoint /api/general/instructors/custom-list/
 */
export interface InstructorBackendResponse {
  id: number;
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  phone_number: number;
  type_identification: number;
  number_identification: string;
  email: string;
  role: number;
  contract_type: number;
  contract_start_date: string;
  contract_end_date: string;
  knowledge_area: number;
  sede: number | null;
  active: boolean;
}
