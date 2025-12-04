import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import CustomSelect from './CustomSelect';
import ProgramAutocomplete from './ProgramAutocomplete';

/**
 * Configuration interface for select dropdowns in the filter bar.
 * Defines the structure for each select element including options and behavior.
 */
interface SelectConfig {
  /** Unique name identifier for the select field */
  name: string;
  /** Current selected value */
  value: string;
  /** Array of available options for the select */
  options: Array<{ value: string; label: string }>;
  /** Placeholder text to display when no option is selected */
  placeholder?: string;
  /** Whether this select should use autocomplete functionality */
  autocomplete?: boolean;
  /** Optional fixed CSS width (eg '320px' or '40%') */
  width?: string;
  /** Optional minimum width for the select container */
  minWidth?: string;
  /** Optional maximum width for the select container */
  maxWidth?: string;
}

/**
 * Props interface for the FilterBar component.
 * Defines the properties needed to configure the filter bar behavior.
 */
interface FilterBarProps {
  /** Callback function called whenever filters change, receives filter parameters */
  onFilter: (params: Record<string, string>) => void;
  /** Optional width for the search input field */
  inputWidth?: string;
  /** Placeholder text for the search input. Defaults to "Buscar..." */
  searchPlaceholder?: string;
  /** Array of select configurations to render additional filter dropdowns */
  selects?: SelectConfig[];
}

/**
 * FilterBar component - A comprehensive search and filter interface.
 *
 * This component provides a search input field combined with multiple select dropdowns
 * for advanced filtering capabilities. It supports both regular selects and program
 * autocomplete functionality. All filter changes are communicated through the onFilter callback.
 *
 * Features:
 * - Search input with icon
 * - Multiple configurable select dropdowns
 * - Special program autocomplete support
 * - Automatic filter state management
 * - Clear all filters functionality
 *
 * @example
 * ```tsx
 * const filterConfigs = [
 *   {
 *     name: 'status',
 *     value: '',
 *     options: [
 *       { value: 'active', label: 'Active' },
 *       { value: 'inactive', label: 'Inactive' }
 *     ],
 *     placeholder: 'Select Status'
 *   }
 * ];
 *
 * <FilterBar
 *   onFilter={(params) => console.log('Filters:', params)}
 *   searchPlaceholder="Search items..."
 *   selects={filterConfigs}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A filter bar with search input and select dropdowns
 */
const FilterBar: React.FC<FilterBarProps> = ({
  onFilter,
  inputWidth,
  searchPlaceholder = 'Buscar...',
  selects = [],
}) => {
  // State for search input value
  const [search, setSearch] = useState('');

  // State for all select dropdown values, initialized from selects config
  const [selectValues, setSelectValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    selects.forEach(sel => {
      initial[sel.name] = sel.value || '';
    });
    return initial;
  });

  // State for program autocomplete selection
  const [programOption, setProgramOption] = useState<{ value: string; label: string } | null>(null);

  // Handle search input changes (debounced filter execution)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  // Handle select dropdown changes and trigger filter callback
  const handleSelectChange = (name: string, value: string) => {
    const newSelects = { ...selectValues, [name]: value };
    setSelectValues(newSelects);
  };

  // Handle program autocomplete changes and trigger filter callback
  const handleProgramChange = (option: { value: string; label: string } | null) => {
    setProgramOption(option);
  };

  // Debounce calling onFilter to avoid firing many requests while user types or changes selects
  const debounceRef = useRef<number | null>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    // skip calling on first render to avoid emitting filters automatically on mount
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // clear existing timer
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    // schedule new call
    debounceRef.current = window.setTimeout(() => {
      onFilter({ search, ...selectValues, programa: programOption?.value || '' });
      debounceRef.current = null;
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectValues, programOption]);

  // Clear all filters and reset to initial state
  const handleClear = () => {
    setSearch('');
    const cleared: Record<string, string> = {};
    selects.forEach(sel => {
      cleared[sel.name] = '';
    });
    setSelectValues(cleared);
    setProgramOption(null);
    onFilter({ search: '', ...cleared, programa: '' });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 items-center">
      {/* Search input with search icon */}
      <div className="relative w-full" style={{ maxWidth: inputWidth || '320px' }}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={handleSearchChange}
          className="border rounded px-3 py-2 w-full pl-9"
          style={{ width: '100%' }}
        />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </span>
      </div>

      {/* Render select dropdowns based on configuration */}
      {selects.map(sel => (
        sel.name === 'programa' ? (
          // Special handling for program autocomplete
          <div key={sel.name} className="w-full sm:w-auto" style={{ minWidth: sel.minWidth || '160px', maxWidth: sel.maxWidth || '220px', display: 'flex', alignItems: 'center', gap: '0px', width: sel.width ? '100%' : undefined }}>
            <ProgramAutocomplete
              value={programOption}
              onChange={handleProgramChange}
              placeholder={sel.placeholder || 'Programa'}
            />

          </div>
        ) : (
          // Regular select dropdown
          <div key={sel.name} className="w-full sm:w-auto" style={{ minWidth: sel.minWidth || '140px', maxWidth: sel.maxWidth || '220px', width: sel.width ? '100%' : undefined }}>
            {(() => {
              // Build options for the custom select. If the provided options already include
              // a universal choice like 'TODOS' or 'all', don't prepend the default 'all' option
              const filtered = sel.options.filter(opt => opt.value !== '');
              const hasUniversal = filtered.some(o => o.value === 'TODOS' || o.value === 'all' || o.value === '');
              const optionsList = hasUniversal ? filtered : [{ value: 'all', label: sel.placeholder || 'Todos' }, ...filtered];
              return (
                <CustomSelect
                  value={selectValues[sel.name] === '' ? (hasUniversal ? (filtered[0]?.value || '') : 'all') : selectValues[sel.name]}
                  onChange={val => handleSelectChange(sel.name, val === 'all' ? '' : val)}
                  options={optionsList}
                  placeholder={sel.placeholder || 'Todos'}
                  label={''}
                  classNames={{
                    trigger: 'border rounded px-3 py-2 w-full flex items-center justify-between h-10 min-h-[40px]',
                    content: 'bg-white border border-gray-300 rounded-lg shadow-lg z-50',
                    item: 'px-4 py-2 cursor-pointer hover:bg-[#bdbdbd] hover:text-white focus:bg-[#bdbdbd] focus:text-gray-700 rounded-md flex items-center gap-2',
                  }}
                />
              );
            })()}
          </div>
        )
      ))}
    </div>
  );
};

export default FilterBar;
