/**
 * Types and interfaces for the Person entity.
 * Includes registration data and person structure in the system.
 */
/**
 * Types and interfaces for the Person entity.
 * Includes registration data and person structure in the system.
 */
export interface RegisterPayload {
  email: string;
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  type_identification: number;
  number_identification: number;
  phone_number: number;
  password: string;
  image?: string;
}

export interface Person {
  id: number;
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  phone_number: number;
  type_identification: number;
  number_identification: number;
  active: boolean;
  image?: string;
}
