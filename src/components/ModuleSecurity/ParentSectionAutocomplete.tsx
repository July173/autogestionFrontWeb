
import React from 'react';
import Select from 'react-select';

export interface ParentSectionOption {
  value: number | null;
  code: string;
  title: string;
  label: string;
}

interface OptionType {
  value: number | null;
  label: string;
  code: string;
  title: string;
}

interface ParentSectionAutocompleteProps {
  options: OptionType[];
  value: OptionType | null;
  onChange: (option: OptionType | null) => void;
  placeholder?: string;
}

const formatOptionLabel = (option: OptionType) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ fontWeight: 'bold', marginRight: 8 }}>{option.code}</span>
    <span>{option.title}</span>
  </div>
);

const ParentSectionAutocomplete: React.FC<ParentSectionAutocompleteProps> = ({ options, value, onChange, placeholder }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      isClearable
      isSearchable
      placeholder={placeholder || 'Buscar sección padre...'}
      formatOptionLabel={formatOptionLabel}
      getOptionValue={opt => String(opt.value)}
      getOptionLabel={opt => opt.label}
      styles={{
        container: (base) => ({ ...base, width: '100%', height: 40, display: 'flex', alignItems: 'center' }),
        control: (base) => ({ ...base, minHeight: 40, height: 40, borderRadius: 8, borderColor: '#d1d5db', boxShadow: 'none', fontSize: '1rem', width: '100%' }),
        valueContainer: (base) => ({ ...base, height: 40, padding: '0 8px', display: 'flex', alignItems: 'center' }),
        input: (base) => ({ ...base, margin: 0, padding: 0 }),
        indicatorsContainer: (base) => ({ ...base, height: 40 }),
        placeholder: (base) => ({ ...base, fontSize: '1rem', color: '#000' }),
        option: (base, state) => ({ ...base, fontSize: '1rem', backgroundColor: state.isFocused ? '#bdbdbd' : '#fff', color: state.isFocused ? '#000' : '#222' }),
        menu: (base) => ({ ...base, zIndex: 50 }),
      }}
    />
  );
};

export default ParentSectionAutocomplete;
