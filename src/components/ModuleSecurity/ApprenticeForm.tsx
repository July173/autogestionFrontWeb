import React from 'react';
import CustomSelect from '../CustomSelect';
import type { Program, Ficha } from '../../Api/types/Modules/general.types';
import type { CreateApprentice } from '../../Api/types/entities/apprentice.types';

type FieldValue = string | number | boolean | undefined;

type Props = {
  apprentice: CreateApprentice;
  handleChange: (name: keyof CreateApprentice, value: FieldValue) => void;
  programas: Program[];
  fichas: Ficha[];
  documentTypesOptions: { value: string; label: string }[];
};

export default function ApprenticeForm({ apprentice, handleChange, programas, fichas, documentTypesOptions }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="min-w-0">
        <label className="block text-sm">Tipo de documento <span className="text-red-600">*</span></label>
        <CustomSelect
          value={String(apprentice.type_identification ?? '')}
          onChange={value => handleChange('type_identification' as keyof CreateApprentice, value)}
          options={documentTypesOptions}
          placeholder="Seleccionar ..."
          classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Número de documento <span className="text-red-600">*</span></label>
  <input name="number_identification" value={apprentice.number_identification} onChange={e => handleChange('number_identification' as keyof CreateApprentice, e.target.value)} className="w-full border rounded-lg px-2 py-1 placeholder:text-xs" placeholder="ej: 12324224" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Nombres <span className="text-red-600">*</span></label>
  <input name="first_name" value={apprentice.first_name} onChange={e => handleChange('first_name' as keyof CreateApprentice, e.target.value)} className="w-full border rounded-lg px-2 py-1 placeholder:text-xs" placeholder="Nombres completos" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Apellidos <span className="text-red-600">*</span></label>
  <input name="first_last_name" value={apprentice.first_last_name} onChange={e => handleChange('first_last_name' as keyof CreateApprentice, e.target.value)} className="w-full border rounded-lg px-2 py-1 placeholder:text-xs" placeholder="Apellidos completos" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Correo Electrónico <span className="text-red-600">*</span></label>
  <input name="email" value={apprentice.email} onChange={e => handleChange('email' as keyof CreateApprentice, e.target.value)} className="w-full border rounded-lg px-2 py-1 placeholder:text-xs" placeholder="ej: ejemplo@soy.sena.edu.co" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Teléfono <span className="text-red-600">*</span></label>
        <input
          type="tel"
          inputMode="numeric"
          pattern="\d*"
          name="phone_number"
          value={apprentice.phone_number}
          onChange={e => handleChange('phone_number' as keyof CreateApprentice, e.target.value.replace(/\D/g, ''))}
          className="w-full border rounded-lg px-2 py-1 placeholder:text-xs"
          placeholder="ej: 3102936537"
          maxLength={10}
        />
      </div>
      <div>
        <label className="block text-sm">Programa de formación <span className="text-red-600">*</span></label>
        <CustomSelect
          value={apprentice.program ? String(apprentice.program) : ""}
          onChange={value => handleChange('program' as keyof CreateApprentice, Number(value))}
          options={programas.filter(opt => opt.active).map(opt => ({ value: String(opt.id), label: String(opt.name) }))}
          placeholder="Seleccionar ..."
          classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }}
        />
      </div>
      <div>
        <label className="block text-sm">Ficha <span className="text-red-600">*</span></label>
        <CustomSelect
          value={String(apprentice.ficha_id ?? '')}
          onChange={value => handleChange('ficha_id' as keyof CreateApprentice, value)}
          options={fichas.filter(opt => opt.active).map(opt => ({ value: String(opt.id), label: String(opt.file_number ?? opt.id) }))}
          placeholder="Seleccion  ar ..."
          classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }}
        />
      </div>
    </div>
  );
}
