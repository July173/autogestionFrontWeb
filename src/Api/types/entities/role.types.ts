/**
 * Types and interfaces for the Role and permissions entity.
 * Includes role structure, user count, and permissions per role.
 */
/**
 * Types and interfaces for the Role and permissions entity.
 * Includes role structure, user count, and permissions per role.
 */
export interface Role {
  id: string;
  type_role: string;
  description: string;
  active: boolean;
}

export interface RolUser{
  id: number;
  name: string;
  description: string;
  active: boolean;
  user_count: number;
}

export interface RolUserCount {
  id: number;
  name: string;
  description: string;
  user_count: number;
}

export interface Permission {
  rol: number;
  form: number;
  Ver: boolean;
  Editar: boolean;
  Registrar: boolean;
  Eliminar: boolean;
  Activar: boolean;
}
