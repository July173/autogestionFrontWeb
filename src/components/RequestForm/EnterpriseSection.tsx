import React from 'react';
import { Enterprise } from '../../Api/types/Modules/assign.types';
import { Buildings } from 'react-bootstrap-icons';

/**
 * Props interface for the EmpresaSection component.
 * Defines the properties needed to manage company information in the form.
 */
interface EmpresaSectionProps {
  /** Form data object containing current form values */
  formData: Enterprise;
  /** Function to update form data fields */
  updateFormData: <K extends keyof Enterprise>(field: K, value: Enterprise[K]) => void;
  /** When true, inputs are disabled (used when selecting an existing enterprise) */
  disabled?: boolean;
}

/**
 * EmpresaSection component displays and manages company information in a request form.
 * 
 * This component renders a form section for collecting company details including:
 * - Company name (required)
 * - Company NIT (tax identification number, required)
 * - Company location/address (required)
 * - Company email (required)
 * 
 * The component uses a green-themed design with Buildings icon and structured layout
 * for displaying company data input fields in a professional form interface.
 * 
 * @param props - Component props as defined in EmpresaSectionProps
 * @returns React component for company information section
 */
const EmpresaSection: React.FC<EmpresaSectionProps> = ({ formData, updateFormData, disabled = false }) => (
  <div className="mb-6 bg-white rounded-lg shadow-md border-2" style={{ borderColor: '#7BCC7C' }}>
    {/* Header section with Buildings icon and title */}
    <div className="flex items-center gap-3 px-6 py-4 rounded-t-lg border-b" style={{ backgroundColor: '#E7FFE8', borderBottomColor: '#7BCC7C' }}>
      <Buildings size={24} color="#0C672D" />
      <span className="font-semibold text-xl" style={{ color: '#0C672D' }}>Datos de la Empresa</span>
    </div>
    <div className="p-6 bg-white rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Nombre de la empresa *</label>
          <input
            type="text"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese el nombre de la empresa"
            value={formData.name_enterprise ?? ''}
            onChange={e => updateFormData('name_enterprise', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>NIT de la empresa *</label>
          <input
            type="number"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese el NIT de la empresa"
            value={formData.nit_enterprise ?? ''}
            onChange={e => updateFormData('nit_enterprise', Number(e.target.value))}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Ubicación empresa *</label>
          <input
            type="text"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese la dirección ciudad"
            value={formData.locate ?? ''}
            onChange={e => updateFormData('locate', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2D7430' }}>Correo de la empresa *</label>
          <input
            type="email"
            className="w-full border-2 rounded-lg px-3 py-2 text-sm"
            required
            placeholder="Ingrese el correo "
            value={formData.email_enterprise ?? ''}
            onChange={e => updateFormData('email_enterprise', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
);

export default EmpresaSection;
