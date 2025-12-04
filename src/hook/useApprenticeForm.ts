import { useState, useEffect, useRef } from 'react';
import { getProgramFichas } from '../Api/Services/Program';
import type { CreateApprentice } from '../Api/types/entities/apprentice.types';
import type { Ficha } from '../Api/types/Modules/general.types';

type FieldValue = string | number | boolean | undefined;

export function useApprenticeForm(initial?: Partial<CreateApprentice>) {
  const [apprentice, setApprentice] = useState<CreateApprentice>({
    type_identification: '',
    number_identification: '',
    first_name: '',
    second_name: '',
    first_last_name: '',
    second_last_name: '',
    phone_number: '',
    email: '',
    program: 0,
    ficha_id: '',
    ...initial,
  });

  const [fichas, setFichas] = useState<Ficha[]>([]);

  useEffect(() => {
    if (apprentice.program) {
      getProgramFichas(apprentice.program).then(setFichas).catch(() => setFichas([]));
    } else {
      setFichas([]);
    }
    if (prevProgramRef.current !== undefined && prevProgramRef.current !== apprentice.program) {
      setApprentice(prev => ({ ...prev, ficha_id: '' } as unknown as CreateApprentice));
    }
    prevProgramRef.current = apprentice.program;
  }, [apprentice.program]);

  const prevProgramRef = useRef<number | undefined>(undefined);

  function handleChange(name: keyof CreateApprentice, value: FieldValue) {
    setApprentice(prev => ({ ...((prev as unknown) as Record<string, unknown>), [String(name)]: value } as unknown as CreateApprentice));
  }

  function validate(): string | null {
    const data = apprentice;
    if (
      !String(data.type_identification || '') ||
      !String(data.number_identification || '') ||
      !String(data.first_name || '') ||
      !String(data.first_last_name || '') ||
      !String(data.phone_number || '') ||
      !String(data.email || '') ||
      !Number(data.program) ||
      !String(data.ficha_id || '')
    ) {
      return 'Todos los campos con * son obligatorios.';
    }
    if (isNaN(Number(data.number_identification))) return 'El número de documento debe ser numérico.';
    if (!/^[0-9]{10}$/.test(String(data.phone_number))) return 'El teléfono debe tener 10 dígitos.';
    if (!String(data.email).endsWith('@soy.sena.edu.co')) return 'El correo de aprendiz debe terminar en @soy.sena.edu.co';
    return null;
  }

  function buildPayload(): CreateApprentice {
    const nombres = String(apprentice.first_name || '').trim().split(' ');
    const apellidos = String(apprentice.first_last_name || '').trim().split(' ');
    const fichaNumeric = apprentice.ficha_id ? Number(apprentice.ficha_id) : undefined;
    // Build canonical payload: convert identification/phone to numbers where appropriate
    const payload: Partial<CreateApprentice> = {
      ...apprentice,
      type_identification: apprentice.type_identification ? Number(apprentice.type_identification) : apprentice.type_identification,
      number_identification: apprentice.number_identification ? Number(apprentice.number_identification) : apprentice.number_identification,
      phone_number: apprentice.phone_number ? Number(apprentice.phone_number) : apprentice.phone_number,
      first_name: nombres[0] || '',
      second_name: nombres.slice(1).join(' '),
      first_last_name: apellidos[0] || '',
      second_last_name: apellidos.slice(1).join(' '),
      program: Number(apprentice.program || 0),
    };
    // Do NOT send nested `ficha` object; backend expects ficha_id (number).
    if (fichaNumeric !== undefined) {
      payload.ficha_id = fichaNumeric;
    }
    return payload as CreateApprentice;
  }

  return { apprentice, setApprentice, fichas, handleChange, validate, buildPayload };
}

export default useApprenticeForm;
