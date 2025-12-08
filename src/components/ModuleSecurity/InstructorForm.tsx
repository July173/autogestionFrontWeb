import React from 'react';
import CustomSelect from '../CustomSelect';
import type { Role } from '../../Api/types/entities/role.types';
import type { CreateInstructor } from '../../Api/types/entities/instructor.types';

type FieldValue = string | number | boolean | undefined;

type Props = {
  instructor: CreateInstructor;
  handleChange: (name: keyof CreateInstructor, value: FieldValue) => void;
  documentTypesOptions: { value: string; label: string }[];
  roles: Role[];
  regiones: { value: string; label: string }[];
  centrosFiltrados: { value: string; label: string }[];
  sedesFiltradas: { value: string; label: string }[];
  areas: { value: string; label: string }[];
  contractTypesOptions: { value: string; label: string }[];
};

export default function InstructorForm({ instructor, handleChange, documentTypesOptions, roles, regiones, centrosFiltrados, sedesFiltradas, areas, contractTypesOptions }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="min-w-0">
        <label className="block text-sm">Tipo de documento <span className="text-red-600">*</span></label>
        <CustomSelect
          value={String(instructor.type_identification || '')}
          onChange={value => handleChange('type_identification', Number(value))}
          options={documentTypesOptions}
          placeholder="Seleccionar ..."
          classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Número de documento <span className="text-red-600">*</span></label>
        <input name="number_identification" value={instructor.number_identification} onChange={e => handleChange('number_identification', e.target.value)} className="w-full border rounded px-2 py-1 placeholder:text-xs" placeholder="ej: 12324224" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Nombres <span className="text-red-600">*</span></label>
        <input name="first_name" value={instructor.first_name} onChange={e => handleChange('first_name', e.target.value)} className="w-full border rounded px-2 py-1 placeholder:text-xs" placeholder="Nombres completos" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Apellidos <span className="text-red-600">*</span></label>
        <input name="first_last_name" value={instructor.first_last_name} onChange={e => handleChange('first_last_name', e.target.value)} className="w-full border rounded px-2 py-1 placeholder:text-xs" placeholder="Apellidos completos" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Correo Electrónico <span className="text-red-600">*</span></label>
        <input name="email" value={instructor.email} onChange={e => handleChange('email', e.target.value)} className="w-full border rounded px-2 py-1 placeholder:text-xs" placeholder="ej: user@sena.edu.co" />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Teléfono <span className="text-red-600">*</span></label>
        <input type="tel" inputMode="numeric" pattern="\d*" name="phone_number" value={instructor.phone_number} onChange={e => handleChange('phone_number', e.target.value.replace(/\D/g, ''))} className="w-full border rounded px-2 py-1 placeholder:text-xs" placeholder="ej: 3102936537" maxLength={10} />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Regional <span className="text-red-600">*</span></label>
  <CustomSelect value={instructor.regional ? String(instructor.regional) : ""} onChange={value => handleChange('regional' as keyof CreateInstructor, Number(value))} options={regiones} placeholder="Seleccionar ..." classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }} />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Centro <span className="text-red-600">*</span></label>
  <CustomSelect value={instructor.center ? String(instructor.center) : ""} onChange={value => handleChange('center' as keyof CreateInstructor, Number(value))} options={centrosFiltrados} placeholder="Seleccionar ..." classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }} />
      </div>
      <div className="min-w-0">
        <label className="block text-sm">Sede <span className="text-red-600">*</span></label>
  <CustomSelect value={instructor.sede ? String(instructor.sede) : ""} onChange={value => handleChange('sede' as keyof CreateInstructor, Number(value))} options={sedesFiltradas} placeholder="Seleccionar ..." classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }} />
      </div>
      <div>
        <label className="block text-sm">Área de conocimiento <span className="text-red-600">*</span></label>
  <CustomSelect value={instructor.knowledge_area ? String(instructor.knowledge_area) : ""} onChange={value => handleChange('knowledge_area' as keyof CreateInstructor, Number(value))} options={areas} placeholder="Seleccionar ..." classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }} />
      </div>
      <div>
        <label className="block text-sm">Tipo de contrato <span className="text-red-600">*</span></label>
  <CustomSelect value={instructor.contract_type} onChange={value => handleChange('contract_type' as keyof CreateInstructor, value)} options={contractTypesOptions} placeholder="Seleccionar ..." classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }} />
      </div>
      <div>
        <label className="block text-sm">Fecha inicio contrato <span className="text-red-600">*</span></label>
  <input type="date" name="contract_start_date" value={instructor.contract_start_date} onChange={e => handleChange('contract_start_date' as keyof CreateInstructor, e.target.value)} className="w-full border rounded-lg px-2 py-2 text-xs" />
      </div>
      <div>
        <label className="block text-sm">Fecha fin de contrato <span className="text-red-600">*</span></label>
  <input type="date" name="contract_end_date" value={instructor.contract_end_date} onChange={e => handleChange('contract_end_date' as keyof CreateInstructor, e.target.value)} className="w-full border rounded-lg px-2 py-2 text-xs" min={instructor.contract_start_date || undefined} />
      </div>
      <div>
        <label className="block text-sm">Rol <span className="text-red-600">*</span></label>
  <CustomSelect value={instructor.role ? String(instructor.role) : ""} onChange={value => handleChange('role' as keyof CreateInstructor, Number(value))} options={roles.filter(opt => opt.active && opt.type_role?.toLowerCase() !== 'aprendiz').map(opt => ({ value: String(opt.id), label: String(opt.type_role) }))} placeholder="Seleccionar ..." classNames={{ trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white", label: "hidden" }} />
      </div>
    </div>
  );
}
