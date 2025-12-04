import { useState } from 'react';
import type { CreateInstructor } from '../Api/types/entities/instructor.types';

export function useInstructorForm(initial?: Partial<CreateInstructor>) {
  const [instructor, setInstructor] = useState<CreateInstructor>({
    first_name: '',
    second_name: '',
    first_last_name: '',
    second_last_name: '',
    phone_number: '',
    type_identification: 0,
    number_identification: '',
    email: '',
    role: 0,
    contract_type: '',
    contract_start_date: '',
    contract_end_date: '',
    knowledge_area: 0,
    center: 0,
    sede: 0,
    regional: 0,
    is_followup_instructor: false,
    ...initial,
  });

  function handleChange(name: string, value: unknown) {
    setInstructor(prev => ({ ...prev, [name]: value } as CreateInstructor));
  }

  function validate() {
    const data = instructor as unknown as Record<string, unknown>;
    if (!data.type_identification || !data.number_identification || !data.first_name || !data.first_last_name || !data.phone_number || !data.email || !data.role || !data.contract_type || !data.contract_start_date || !data.contract_end_date || !data.knowledge_area || !data.center || !data.sede || !data.regional) {
      return 'Todos los campos son obligatorios excepto segundo nombre y segundo apellido.';
    }
    if (isNaN(Number(data.number_identification))) return 'El número de documento debe ser numérico.';
    if (!/^[0-9]{10}$/.test(String(data.phone_number))) return 'El teléfono debe tener 10 dígitos.';
    if (!String(data.email).endsWith('@sena.edu.co')) return 'El correo de instructor debe terminar en @sena.edu.co';
    return null;
  }

  return { instructor, setInstructor, handleChange, validate };
}

export default useInstructorForm;
