import React from 'react';
import { Boss } from '../../Api/types/Modules/assign.types';
import { Person } from 'react-bootstrap-icons';

/**
 * Props interface for the JefeSection component.
 * Defines the properties needed to manage immediate supervisor information in the form.
 */
interface JefeSectionProps {
  /** Form data object containing current form values */
  formData: Boss;
  /** Function to update form data fields */
  updateFormData: <K extends keyof Boss>(field: K, value: Boss[K]) => void;
  /** Error message for phone number validation */
  phoneError: string;
  /** Handler for phone number input changes with validation */
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** When true, inputs are disabled (used when selecting an existing boss) */

    disabled?: boolean;
}

/**
 * JefeSection component displays and manages immediate supervisor information in a request form.
 * 
 * This component renders a form section for collecting supervisor details including:
 * - Full name (required)
 * - Phone number with validation (required)
 * - Email address (required)
 * - Job position/role (required)
 * 
 * The component includes phone number validation with error display and uses
 * a green-themed design with Person icon for the supervisor information section.
 * 
 * @param props - Component props as defined in JefeSectionProps
 * @returns React component for immediate supervisor information section
 */
const JefeSection: React.FC<JefeSectionProps> = ({ formData, updateFormData, phoneError, handlePhoneChange, disabled = false }) => (
  <div className="mb-6 bg-white rounded-lg shadow-md border-2" style={{ borderColor: '#7BCC7C' }}>
    {/* Header section with Person icon and title */}
    <div className="flex items-center gap-3 px-6 py-4 rounded-t-lg border-b" style={{ backgroundColor: '#E7FFE8', borderBottomColor: '#7BCC7C' }}>
      <Person size={24} color="#0C672D" />
      <span className="font-semibold text-xl" style={{ color: '#0C672D' }}>Datos del Jefe Inmediato</span>
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
            value={formData.name_boss ?? ''}
            onChange={e => updateFormData('name_boss', e.target.value)}
            disabled={disabled}
          />
 
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Número de teléfono *</label>
          <input type="tel" className="w-full border-2 rounded-lg px-3 py-2 text-sm" required placeholder="Ingrese el número de teléfono" value={formData.phone_number || ''} onChange={handlePhoneChange} disabled={disabled} />
          {phoneError && <span className="text-red-600 text-xs">{phoneError}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Correo electrónico *</label>
          <input
            type="email"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese el correo"
            value={formData.email_boss ?? ''}
            onChange={e => updateFormData('email_boss', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Cargo *</label>
          <input
            type="text"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Cargo del jefe"
            value={formData.position ?? ''}
            onChange={e => updateFormData('position', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
);

export default JefeSection;
