import React, { useEffect, useState } from 'react';
import type { Person } from '../../Api/types/entities/person.types';
import { getDocumentTypeById } from '../../Api/Services/TypeDocument';

/**
 * Props interface for the PersonalInfoDisplay component.
 * Displays the personal data of the current person.
 */
interface PersonalInfoDisplayProps {
  /** Person's data object */
  person: Person;
  /** Person's email address */
  email: string;
}

/**
 * PersonalInfoDisplay component - Component to display the personal data of the current person.
 *
 * This component renders a comprehensive view of a person's personal information
 * including names, identification details, contact information, and document type.
 * It fetches the document type name asynchronously and displays all information
 * in a structured grid layout with custom styled fieldsets.
 *
 * Features:
 * - Asynchronous document type name resolution
 * - Responsive grid layout (1 column on mobile, 2 on desktop)
 * - Custom styled fieldsets with legends and icons
 * - Read-only input fields for data display
 * - Proper error handling for missing document types
 * - FontAwesome icons for visual enhancement
 *
 * The component displays the following information:
 * - Full name (first and second names combined)
 * - Full last names (first and second last names combined)
 * - Identification number
 * - Document type name
 * - Email address
 * - Phone number
 *
 * @param props - The component props
 * @returns A component displaying personal information in a structured layout
 *
 * @example
 * ```tsx
 * const personData = {
 *   first_name: "Juan",
 *   second_name: "Carlos",
 *   first_last_name: "Pérez",
 *   second_last_name: "Gómez",
 *   number_identification: "123456789",
 *   type_identification: "1",
 *   phone_number: "+57 300 123 4567"
 * };
 *
 * <PersonalInfoDisplay
 *   person={personData}
 *   email="juan.perez@sena.edu.co"
 * />
 * ```
 */
const PersonalInfoDisplay: React.FC<PersonalInfoDisplayProps> = ({ person, email }) => {
  // State for document type name, fetched asynchronously
  const [docTypeName, setDocTypeName] = useState('');

  // Fetch document type name when component mounts or type_identification changes
  useEffect(() => {
    if (person.type_identification) {
      getDocumentTypeById(person.type_identification)
        .then(doc => setDocTypeName(doc.name))
        .catch(() => setDocTypeName('No especificado'));
    } else {
      setDocTypeName('No especificado');
    }
  }, [person.type_identification]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-2 text-[#263238]">Información Personal</h2>
      <p className="font-semibold mb-4 text-gray-700">Datos Personales</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* First and second names combined */}
        <fieldset className="relative border-2 border-gray-500 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl px-4 pt-3 pb-2">
          <legend className="px-1 text-xs font-semibold text-[#1976d2]">Nombres</legend>
          <div className="flex items-center">
            <input value={person.first_name + (person.second_name ? ' ' + person.second_name : '')} readOnly className="w-full bg-transparent outline-none text-gray-700" />
            <span className="ml-2 text-gray-400">
              <i className="fa fa-user" />
            </span>
          </div>
        </fieldset>

        {/* First and second last names combined */}
        <fieldset className="relative border-2 border-gray-500 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl px-4 pt-3 pb-2">
          <legend className="px-1 text-xs font-semibold text-[#1976d2]">Apellidos</legend>
          <div className="flex items-center">
            <input value={person.first_last_name + (person.second_last_name ? ' ' + person.second_last_name : '')} readOnly className="w-full bg-transparent outline-none text-gray-700" />
            <span className="ml-2 text-gray-400">
              <i className="fa fa-user" />
            </span>
          </div>
        </fieldset>

        {/* Identification document number */}
        <fieldset className="relative border-2 border-gray-500 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl px-4 pt-3 pb-2">
          <legend className="px-1 text-xs font-semibold text-[#1976d2]">Documento</legend>
          <div className="flex items-center">
            <input value={person.number_identification} readOnly className="w-full bg-transparent outline-none text-gray-700" />
            <span className="ml-2 text-gray-400">
              <i className="fa fa-id-card" />
            </span>
          </div>
        </fieldset>

        {/* Document type name (fetched asynchronously) */}
        <fieldset className="relative border-2 border-gray-500 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl px-4 pt-3 pb-2">
          <legend className="px-1 text-xs font-semibold text-[#1976d2]">Tipo Documento</legend>
          <div className="flex items-center">
            <input value={docTypeName} readOnly className="w-full bg-transparent outline-none text-gray-700" />
            <span className="ml-2 text-gray-400">
              <i className="fa fa-id-card" />
            </span>
          </div>
        </fieldset>

        {/* Email address */}
        <fieldset className="relative border-2 border-gray-500 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl px-4 pt-3 pb-2">
          <legend className="px-1 text-xs font-semibold text-[#1976d2]">Correo</legend>
          <div className="flex items-center">
            <input value={email} readOnly className="w-full bg-transparent outline-none text-gray-700" />
            <span className="ml-2 text-gray-400">
              <i className="fa fa-envelope" />
            </span>
          </div>
        </fieldset>

        {/* Phone number */}
        <fieldset className="relative border-2 border-gray-500 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl px-4 pt-3 pb-2">
          <legend className="px-1 text-xs font-semibold text-[#1976d2]">Teléfono</legend>
          <div className="flex items-center">
            <input value={person.phone_number} readOnly className="w-full bg-transparent outline-none text-gray-700" />
            <span className="ml-2 text-gray-400">
              <i className="fa fa-phone" />
            </span>
          </div>
        </fieldset>
      </div>
    </>
  );
};

export default PersonalInfoDisplay;
