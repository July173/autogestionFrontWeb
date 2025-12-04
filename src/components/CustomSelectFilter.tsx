import { useState, useEffect } from 'react';

/**
 * CustomSelectFilter component
 * ----------------------------
 * Custom select component for filtering with API data loading.
 * Fetches options from an API endpoint and provides a searchable dropdown.
 *
 * Props:
 * - placeholder?: string                    // Placeholder text for the select
 * - apiEndpoint: string                    // API endpoint to fetch options from
 * - value: string | number                 // Currently selected value
 * - onChange: (value: string | number) => void // Function called when selection changes
 * - className?: string                     // Additional CSS classes
 * - disabled?: boolean                     // Whether the select is disabled
 * - allOptionText?: string                 // Text for "All" option (default: "Todos")
 */

interface Option {
    id: number;
    name: string;
}

interface CustomSelectFilterProps {
    placeholder?: string;
    apiEndpoint: string;
    value: string | number;
    onChange: (value: string | number) => void;
    className?: string;
    disabled?: boolean;
    allOptionText?: string; // Text for "All" option
}

const CustomSelectFilter: React.FC<CustomSelectFilterProps> = ({
    placeholder = "Seleccione una opción",
    apiEndpoint,
    value,
    onChange,
    className = "",
    disabled = false,
    allOptionText = "Todos"
}: CustomSelectFilterProps) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // Fetch options from API endpoint
        const fetchOptions = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(apiEndpoint);
                if (!response.ok) {
                    throw new Error("Error al cargar las opciones");
                }
                const data = await response.json();
                setOptions(data);
            } catch (err) {
                setError("Error al cargar las opciones");
                console.error("Error fetching options:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [apiEndpoint]);

    // Determine display text based on selected value
    const selectedOption = options.find(opt => opt.id === value);
    const displayText = selectedOption ? selectedOption.name : (value === "" || value === "all" ? allOptionText : placeholder);

    return (
        <div className={`w-full inline-flex flex-col justify-center items-center gap-px ${className}`}>
            {/* Main select container with custom styling */}
            <div className="self-stretch px-6 py-2.5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-500 inline-flex justify-between items-center overflow-hidden bg-white relative">
                {/* Display text based on current state */}
                {loading ? (
                    <span className="flex-1 text-gray-400 text-lg font-normal font-['Inter'] truncate">
                        Cargando...
                    </span>
                ) : error ? (
                    <span className="flex-1 text-red-500 text-lg font-normal font-['Inter'] truncate">
                        {error}
                    </span>
                ) : (
                    <span className="flex-1 text-black text-lg font-normal font-['Inter'] truncate">
                        {displayText}
                    </span>
                )}
                
                {/* Dropdown arrow icon */}
                <svg 
                    width="18" 
                    height="18" 
                    fill="none" 
                    stroke="#666" 
                    strokeWidth="2" 
                    className="ml-2 flex-shrink-0" 
                    viewBox="0 0 24 24"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
                
                {/* Hidden native select element for functionality */}
                <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled || loading}
                >
                    <option value="">{allOptionText}</option>
                    {options.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
    }

    export default CustomSelectFilter;
