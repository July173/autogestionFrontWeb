/**
 * Types and interfaces for the Module entity.
 * Includes module structure and relationship with forms.
 */
/**
 * Types and interfaces for the Module entity.
 * Includes module structure and relationship with forms.
 */
export interface Module {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ModuleForm {
  name: string;
  form: import('./form.types').FormItem[];
}
