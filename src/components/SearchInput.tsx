import React from "react";


/**
 * Props interface for the BuscarInput component.
 * Defines the properties needed for the search input functionality.
 */
interface BuscarInputProps {
  /** Current value of the search input */
  value: string;
  /** Callback function called when the input value changes */
  onChange: (value: string) => void;
  /** Placeholder text shown when input is empty. Defaults to "Buscar..." */
  placeholder?: string;
}

/**
 * BuscarInput component - A styled search input with icon.
 *
 * This component provides a search input field with a magnifying glass icon,
 * commonly used for filtering or searching through data. It features a clean
 * design with proper focus states and consistent styling.
 *
 * Features:
 * - Search icon positioned on the left side
 * - Customizable placeholder text
 * - Controlled input with external state management
 * - Focus outline removal for cleaner appearance
 * - Fixed dimensions with responsive design considerations
 * - Bootstrap-inspired search icon using SVG
 *
 * @param props - The component props
 * @returns A styled search input component with icon
 *
 * @example
 * ```tsx
 * <BuscarInput
 *   value={searchTerm}
 *   onChange={(value) => setSearchTerm(value)}
 *   placeholder="Buscar productos..."
 * />
 * ```
 */
const BuscarInput: React.FC<BuscarInputProps> = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="bg-white relative rounded-[4px] w-full max-w-[229px] h-[30px]">
      {/* Search input field with left padding for icon */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute left-0 top-0 w-full h-full px-10 py-1 rounded-[4px] border border-[#c5c5c5] text-base text-gray-800 focus:outline-none"
        placeholder={placeholder}
        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}
      />

      {/* Search icon positioned on the left side of the input */}
      <span className="absolute left-[11px] top-[4px] w-5 h-5 flex items-center justify-center pointer-events-none">
        {/* Bootstrap search icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
      </span>
    </div>
  );
};

export default BuscarInput;


