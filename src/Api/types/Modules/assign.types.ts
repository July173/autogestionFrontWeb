export interface requestAsignation{
    apprentice: number;
    ficha: number;
    date_end_contract: number;
    date_start_contract: number;
    enterprise_name: string;
    enterprise_nit: number;
    enterprise_location: string;
    enterprise_email: string;
    boss_name: string;
    boss_phone: number;
    boss_email: string;
    boss_position: string;
    human_talent_name: string;
    human_talent_email: string;
    human_talent_phone: string;
    sede: number;
    modality_productive_stage: number;
}


export interface AssignTableRow {
  name: string;
  type_identification: number; 
  number_identificacion: string;
  request_date: string;
  id?: number;
  request_state?: string;
  /** Optional: modalidad asociada (nombre) retornada por el backend */
  nombre_modalidad?: string;
  /** Optional: instructor name returned by backend */
  instructor?: string;
  /** Optional: instructor ID returned by backend */
  instructor_id?: number;
}

export interface DetailData {
  apprentice: number;
  name_apprentice?: string;
  type_identification?: number; 
  number_identification?: string | number | null;
  phone_apprentice?: string | number;
  email_apprentice?: string;
  ficha?: number;
  numero_ficha?: number;
  program?: string;
  enterprise_name?: string;
  enterprise_nit?: string | number;
  enterprise_location?: string;
  enterprise_email?: string;
  boss_name?: string;
  boss_phone?: string | number;
  boss_email?: string;
  boss_position?: string;
  regional?: string;
  center?: string;
  sede?: string;
  request_date?: string;
  date_start_production_stage?: string;
  date_end_production_stage?: string;
  modality_productive_stage?: string;
  request_state?: string;
  pdf_url?: string;
  human_talent?: {
    name?: string;
    email?: string;
    phone?: number;
  };

 
}

/**
 * Assignment record as returned by the instructor assignments endpoint
 */
export interface InstructorAssignment {
  id: number;
  instructor?: number;
  request_asignation?: number;
  content?: string;
  type_message?: string;
  aprendiz_id?: number;
  nombre?: string;
  name?: string;
  tipo_identificacion?: string | number;
  numero_identificacion?: string | number;
  fecha_solicitud?: string;
  estado_solicitud?: string;
  nombre_modalidad?: string;
}

/** Payload used to reassign an instructor to an existing asignation */
export interface ReassignInstructorPayload {
  asignation_instructor: number;
  new_instructor_id: number;
  message?: string;
}

export type AssignmentRow = InstructorAssignment;

 export interface Enterprise {
    name_enterprise: string;
    nit_enterprise: number;
    locate: string;
    email_enterprise: string;
  }

  export interface Boss {
    name_boss: string;
    email_boss: string;
    phone_number: number;
    position: string;
  }
  export interface HumanTalent {
    name: string;
    email: string;
    phone_number: number;
  }

  /** Message associated with a request */
  export interface RequestMessage {
    id: number;
    request_asignation: number;
    content: string;
    type_message: string;
    whose_message: string;
  }

  /** Visit following data */
  export interface VisitFollowing {
    id: number;
    visit_number: number;
    observations: string | null;
    state_visit: string;
    scheduled_date: string;
    date_visit_made: string | null;
    name_visit: string;
    observation_state_visit: string | null;
    pdf_report: string | null;
    asignation_instructor: number;
    state_asignation: string;
  }

  /** Response from visits by asignation endpoint */
  export interface VisitsByAsignationResponse {
    success: boolean;
    visits: VisitFollowing[];
    state_asignation: string;
  }

  /** Payload to update visit (excluding PDF) */
  export interface UpdateVisitPayload {
    observations: string;
    state_visit: string;
    date_visit_made: string;
    observation_state_visit?: string;
    state_asignation: string;
  }