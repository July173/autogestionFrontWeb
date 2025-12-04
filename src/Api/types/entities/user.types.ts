/**
 * Types and interfaces for the User entity.
 * Includes user data, registration response, and login validation.
 */
/**
 * Types and interfaces for the User entity.
 * Includes user data, registration response, and login validation.
 */
// Nueva estructura para usuario según el backend actualizado
export interface User {
  id: number;
  email: string;
  person: {
    id: number;
    first_name: string;
    second_name?: string;
    first_last_name: string;
    second_last_name?: string;
    phone_number: number;
    type_identification: number;
    number_identification: number;
    active: boolean;
    image: string | null;
  };
  role: {
    id: number;
    type_role: string;
    description: string;
    active: boolean;
  };
  is_active: boolean;
  registered: boolean;
}

export interface RegisterResponse {
  detail: string;
  person: import('./person.types').Person;
  user: User;
  success: string;
}

export interface ValidateLoginResponse {
  access: string;
  refresh: string;
  user?: {
    email: string;
    id: string;
    role?: number;
    person: string;
    registered?: boolean;
  };
  email?: string;
  role?: number;
  person?: string;
}

export interface UserStatus {
  is_active?: boolean;
  estado?: string;
}

export interface SecondFactorRequest {
  email: string;
  code: string;
}