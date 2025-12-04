/**
 * Types and interfaces for general system entities.
 * Includes Sede, Regional, Program, KnowledgeArea, Ficha, and Center.
 * Used to model the data structure of general modules.
 */
export interface Sede {
  id: number;
  name: string;
  code_sede: number;
  address: string;
  phone_sede: number;
  email_contact: string;
  center: number;
  active: boolean;
}

export interface Center {
  id: number;
  name: string;
  code_center: number;
  address: string;
  active: boolean;
  regional: number;
}

export interface Regional {
  id: number;
  code_regional: number;
  name: string;
  description: string;
  address: string;
  active: boolean;
}
export interface Program {
  id: number;
  code_program: number;
  name: string;
  description: string;
  active: boolean;
}
export interface KnowledgeArea {
  id: number;
  description: string;
  name: string;
  active: boolean;
}
export interface Ficha {
  id: number;
  file_number: number;
  program: number;
  active: boolean;
  type_modality: string;
}


export interface Colors {
  id: number;
  name: string;
  hexagonal_value: string;
  active: boolean;
}

export interface TypeOfQueries {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface DocumentType<T> {
  id: number;
  name: string;
  acronyms: string;
  active: boolean;
}

export interface TypeContract {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

