/**
 * Types and interfaces for the Apprentice entity.
 * Includes structure and registration data for apprentices.
 */
/**
 * Types and interfaces for the Apprentice entity.
 * Includes structure and registration data for apprentices.
 */
export interface Apprentice {
  id: string;
  person: number;
  ficha: number;
  active: boolean;
}

export interface CreateApprentice {
  // Backend may accept either numbers or strings depending on the endpoint/version.
  // Use union types to be flexible while keeping TS checks.
  type_identification: number | string;
  number_identification: number | string;
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  phone_number: number | string;
  email: string;
  program: number;
  ficha_id: number | string;
  role?: number;
}
