import React, { useEffect } from 'react';
import { requestAsignation, AssignTableRow } from '../../Api/types/Modules/assign.types';
import ProgramAutocomplete from '../ProgramAutocomplete';
import CustomSelect from '../CustomSelect';
import { Person } from 'react-bootstrap-icons';

/**
 * Props interface for the ApprenticeSection component.
 * Defines all the properties required to render and manage the apprentice information section.
 */
interface ApprenticeSectionProps {
  /** Person object containing apprentice's personal information */
  person: AssignTableRow & { first_last_name?: string; second_last_name?: string; phone_number?: string | number };
  /** User data object containing additional user information like email */
  userData: { email: string };
  /** Array of available training programs */
  programas: { id: number; name: string }[];
  /** Currently selected program ID */
  selectedProgram: number | null;
  /** Function to update the selected program */
  updateSelectedProgram: (id: number) => void;
  /** Array of available ficha (training group) records */
  fichas: { id: number; file_number: string }[];
  /** Form data object containing current form values */
  formData: requestAsignation;
  /** Function to update form data fields */
  updateFormData: <K extends keyof requestAsignation>(field: K, value: requestAsignation[K]) => void;
  /** Array of available productive stage modalities */
  modalidades: { id: number; name_modality: string }[];
  /** Error message for date validation */
  dateError: string;
  /** Minimum allowed end date for contract */
  minEndDate: string;
  /** Maximum allowed end date for contract */
  maxEndDate: string;
  /** Handler for start date input changes */
  handleStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler for end date input changes */
  handleEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Function to get document type name from type value */
  getDocumentTypeName: (typeValue: string | number) => string;
  /** Array of available document types */
  documentTypes: { id: number | ""; name: string }[];
}

/**
 * ApprenticeSection component displays and manages apprentice information in a request form.
 * 
 * This component renders a form section containing:
 * - Pre-loaded apprentice personal information (read-only fields)
 * - Editable training program selection fields
 * - Contract date inputs with validation
 * - Productive stage modality selection
 * 
 * The component uses a green-themed design with Person icon and structured layout
 * for displaying apprentice data in a professional form interface.
 * 
 * @param props - Component props as defined in ApprenticeSectionProps
 * @returns React component for apprentice information section
 */
const ApprenticeSection: React.FC<ApprenticeSectionProps> = (props) => {
  const {
    person,
    userData,
    programas,
    selectedProgram,
    updateSelectedProgram,
    fichas,
    formData,
    updateFormData,
    modalidades,
    dateError,
    minEndDate,
    maxEndDate,
    handleStartDateChange,
    handleEndDateChange,
    getDocumentTypeName,
    documentTypes,
  } = props;

  // Determine selected modality and whether it's a 'Contrato de Aprendizaje'
  const selected = modalidades.find(m => Number(m.id) === Number(formData.modality_productive_stage));
  const isContrato = !!selected && typeof selected.name_modality === 'string' && selected.name_modality.toLowerCase().includes('contrato');

  // When modality changes to something different than contrato, clear the date fields
  useEffect(() => {
    if (!isContrato) {
      updateFormData('date_start_contract', 0 as unknown as requestAsignation['date_start_contract']);
      updateFormData('date_end_contract', 0 as unknown as requestAsignation['date_end_contract']);
    }
    // We intentionally depend on isContrato and updateFormData only
  }, [isContrato, updateFormData]);

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border-2" style={{ borderColor: '#7BCC7C' }}>
    {/* Header section with Person icon and title */}
    <div className="flex items-center gap-3 px-6 py-4 rounded-t-lg border-b" style={{ backgroundColor: '#E7FFE8', borderBottomColor: '#7BCC7C' }}>
      <Person size={24} color="#0C672D" />
      <span className="font-semibold text-xl" style={{ color: '#0C672D' }}>Datos del Aprendiz</span>
    </div>
    <div className="p-6 bg-white rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pre-loaded information (non-editable fields) */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Tipo de identificación *</label>
          <input type="text" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={getDocumentTypeName(person.type_identification)} readOnly disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Número de identificación *</label>
          <input type="text" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={person.number_identificacion} readOnly disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Nombre *</label>
          <input type="text" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={person.name} readOnly disabled />
        </div>
        {typeof person.first_last_name !== 'undefined' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Primer Apellido *</label>
            <input type="text" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={person.first_last_name || ''} readOnly disabled />
          </div>
        )}
        {typeof person.second_last_name !== 'undefined' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Segundo Apellido</label>
            <input type="text" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={person.second_last_name || ''} readOnly disabled />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Correo Electrónico *</label>
          <input type="email" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={userData?.email || ''} readOnly disabled />
        </div>
        {typeof person.phone_number !== 'undefined' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Número de teléfono móvil *</label>
            <input type="text" className="w-full border-2 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" value={String(person.phone_number || '')} readOnly disabled />
          </div>
        )}
                  <CustomSelect
            value={formData.modality_productive_stage ? String(formData.modality_productive_stage) : ""}
            onChange={val => updateFormData('modality_productive_stage', Number(val))}
            options={modalidades.map(modalidad => ({ value: String(modalidad.id), label: modalidad.name_modality }))}
            label="Modalidad etapa productiva *"
            placeholder="Seleccione..."
            classNames={{
              trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
              label: "block text-sm font-medium mb-2",
            }}
          />

        {/* Editable fields */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Programa de Formación *</label>
          <ProgramAutocomplete
            value={selectedProgram ? { value: String(selectedProgram), label: programas.find(p => p.id === selectedProgram)?.name || String(selectedProgram) } : null}
            onChange={(opt) => {
              if (opt && opt.value) {
                updateSelectedProgram(Number(opt.value));
              } else {
                // Cuando se limpia la selección, conservamos el contrato existente pasando 0
                updateSelectedProgram(0);
              }
            }}
            placeholder="Seleccione..."
            fullWidth
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Número de Ficha *</label>
          <ProgramAutocomplete
            value={formData.ficha ? { value: String(formData.ficha), label: fichas.find(f => f.id === formData.ficha)?.file_number || String(formData.ficha) } : null}
            onChange={(opt) => {
              if (opt && opt.value) {
                updateFormData('ficha', Number(opt.value));
              } else {
                updateFormData('ficha', 0 as unknown as typeof formData.ficha);
              }
            }}
            placeholder="Seleccione..."
            fullWidth
            optionsOverride={fichas.map(f => ({ value: String(f.id), label: f.file_number || String(f.id) }))}
          />
        </div>
        {/* Show date fields only when selected modality is 'Contrato de Aprendizaje' */}
        {isContrato && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Fecha de inicio de contrato de aprendizaje *</label>
              <input type="date" className="w-full border-2 rounded-lg px-3 py-2 text-sm" required onChange={handleStartDateChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Fecha de fin de contrato de aprendizaje *</label>
              <input type="date" className="w-full border-2 rounded-lg px-3 py-2 text-sm" required min={minEndDate} max={maxEndDate} disabled={!formData.date_start_contract} onChange={handleEndDateChange} />
              {dateError && <div className="mt-1"><span className="text-red-600 text-xs">{dateError}</span></div>}
            </div>
          </>
        )}
        <div>
        </div>
      </div>
    </div>
  </div>
);
}
export default ApprenticeSection;
