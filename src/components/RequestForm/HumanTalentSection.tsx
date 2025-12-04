import React from 'react';
import { Person } from 'react-bootstrap-icons';
import { HumanTalent } from '../../Api/types/Modules/assign.types';

/**
 * Props interface for the TalentoHumanoSection component.
 * Defines the properties needed to manage HR/recruitment contact information in the form.
 */
interface TalentoHumanoSectionProps {
  /** Form data object containing current form values */
    formData: HumanTalent;
    updateFormData: <K extends keyof HumanTalent>(field: K, value: HumanTalent[K]) => void;
  /** Error message for HR phone number validation */
  humanTalentPhoneError: string;
  /** Handler for HR phone number input changes with validation */
  handleHumanTalentPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** When true, inputs are disabled (used when selecting an existing human talent) */
  disabled?: boolean;
}

/**
 * TalentoHumanoSection component displays and manages HR/recruitment contact information in a request form.
 * 
 * This component renders a form section for collecting HR department contact details including:
 * - Full name (required)
 * - Phone number with validation (required)
 * - Email address (required)
 * 
 * The component includes phone number validation with error display and uses
 * a green-themed design with Person icon for the HR contact information section.
 * This section captures information about the person responsible for hiring or
 * the HR department contact within the company.
 * 
 * @param props - Component props as defined in TalentoHumanoSectionProps
 * @returns React component for HR/recruitment contact information section
 */
const TalentoHumanoSection: React.FC<TalentoHumanoSectionProps> = ({ formData, updateFormData, humanTalentPhoneError, handleHumanTalentPhoneChange, disabled = false }) => (
  <div className="mb-6 bg-white rounded-lg shadow-md border-2" style={{ borderColor: '#7BCC7C' }}>
    {/* Header section with Person icon and title */}
    <div className="flex items-center gap-3 px-6 py-4 rounded-t-lg border-b" style={{ backgroundColor: '#E7FFE8', borderBottomColor: '#7BCC7C' }}>
      <Person size={24} color="#0C672D" />
      <span className="font-semibold text-xl" style={{ color: '#0C672D' }}>Datos del Encargado de contratación o área de Talento Humano</span>
    </div>
    <div className="p-6 bg-white rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Nombre completo *</label>
          <input
            type="text"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese el nombre completo"
            value={formData.name ?? ''}
            onChange={e => updateFormData('name', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Número de teléfono *</label>
          <input type="tel" className="w-full border-2 rounded-lg px-3 py-2 text-sm" required placeholder="Ingrese el número de teléfono" value={formData.phone_number || ''} onChange={handleHumanTalentPhoneChange} disabled={disabled} />
          {humanTalentPhoneError && <span className="text-red-600 text-xs">{humanTalentPhoneError}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Correo electrónico *</label>
          <input
            type="email"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese el correo"
            value={formData.email ?? ''}
            onChange={e => updateFormData('email', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
);

export default TalentoHumanoSection;
