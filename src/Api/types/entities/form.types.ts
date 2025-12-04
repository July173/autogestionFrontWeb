/**
 * Types and interfaces for the Form entity.
 * Includes structure of forms, modules, and related permissions.
 */
/**
 * Types and interfaces for the Form entity.
 * Includes structure of forms, modules, and related permissions.
 */
export interface Form {
  id: string;
  name: string;
  description: string;
  path: string;
  active: boolean;
}

export interface FormModule {
  id: string;
  form: number;
  module: number;
}

export interface RolFormPermission {
  id: string;
  role: number;
  form: number;
  permission: number;
}

export interface FormItem {
  name: string;
  path: string;
}
