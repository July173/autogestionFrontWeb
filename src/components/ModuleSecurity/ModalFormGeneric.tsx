import React, { useState } from 'react';
import CustomSelect from '../CustomSelect';

/**
 * ModalFormGeneric component
 * 
 * Reusable modal for creating entities (role, module, form, etc.)
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {string} props.title - Modal title
 * @param {Array} props.fields - Array of field objects { name, label, type, placeholder, options? }
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Submit handler (values) => void
 * @param {string} props.submitText - Submit button text
 * @param {string} props.cancelText - Cancel button text
 * @param {Object} props.initialValues - Initial form values
 * @param {Function} props.customRender - Custom render function
 * @param {Function} props.onProgramChange - Program change handler
 */

/**
 * Generic modal form component for creating and editing various entities in the system.
 * Provides a flexible, reusable interface for forms with different field types including
 * text inputs, selects, checkboxes, and checkbox groups. Handles form validation,
 * state management, and submission with customizable rendering and behavior.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {string} title - Modal title text
 * @param {Array} fields - Field configuration array with properties: name, label, type, placeholder, options, required, maxLength, disabled
 * @param {Function} onClose - Callback when modal is closed
 * @param {Function} onSubmit - Callback when form is submitted with form values
 * @param {string} [submitText='Registrar'] - Submit button text
 * @param {string} [cancelText='Cancelar'] - Cancel button text
 * @param {Object} [initialValues={}] - Initial form values object
 * @param {Function} [customRender] - Custom rendering function for special field types
 * @param {Function} [onProgramChange] - Special handler for program selection changes
 */
const ModalFormGeneric = ({
  isOpen,
  title,
  fields,
  onClose,
  onSubmit,
  submitText = 'Registrar',
  cancelText = 'Cancelar',
  initialValues = {},
  customRender,
  onProgramChange,
}) => {
  // State for form values - dynamically updated based on field changes
  const [values, setValues] = React.useState(initialValues);
  // State for form validation errors
  const [error, setError] = React.useState('');

  // Only update values when modal opens for the first time or initialValues actually change
  const prevIsOpen = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setValues(initialValues);
    }
    prevIsOpen.current = isOpen;
    // Only depends on isOpen
    // eslint-disable-next-line
  }, [isOpen]);

  /**
   * Handles input changes for all field types including special cases for checkboxes and program selection
   * @param {Event} e - Change event from input/select/checkbox
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If it's the program select and special handler exists, use it
    if (name === 'program_id' && typeof onProgramChange === 'function') {
      onProgramChange(e);
    }
    // Handle checkbox-group type fields with array values
    if (type === 'checkbox' && Array.isArray(fields.find(f => f.type === 'checkbox-group')?.options)) {
      setValues((prev) => {
        const groupField = fields.find(f => f.type === 'checkbox-group');
        if (groupField && groupField.options.some(opt => String(opt.value) === name)) {
          let prevArr = Array.isArray(prev[groupField.name]) ? prev[groupField.name].map(String) : [];
          if (checked) {
            if (!prevArr.includes(String(name))) {
              prevArr = [...prevArr, String(name)];
            }
            return {
              ...prev,
              [groupField.name]: prevArr,
              [name]: true,
            };
          } else {
            return {
              ...prev,
              [groupField.name]: prevArr.filter((id) => id !== String(name)),
              [name]: false,
            };
          }
        }
        // ...existing code...
        return {
          ...prev,
          [name]: checked,
        };
      });
    } else if (type === 'checkbox') {
      // single checkbox (not a checkbox-group)
      setValues((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /**
   * Handles form submission with validation of required fields
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields except those explicitly marked as not required
    // By convention, non-required fields should have required: false
    const missing = fields.filter(f => {
      if (f.required === false) return false;
      const v = values[f.name];
      // For selects/autocomplete, accept any number, numeric string, null or 0 as valid
      if (f.type === 'select' || f.type === 'autocomplete') {
        if (v === 0 || v === null || (typeof v === 'number' && !isNaN(v))) return false;
        if (typeof v === 'string' && v !== '' && !isNaN(Number(v))) return false;
      }
      if (Array.isArray(v)) return v.length === 0;
      return v === undefined || v === '';
    });
    if (missing.length > 0) {
      setError('Todos los campos con * son obligatorios');
      return;
    }
    setError('');
    onSubmit(values);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col"
        onSubmit={handleSubmit}
        style={{ maxHeight: '80vh' }}
      >
        {/* Modal title */}
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {/* Error message display */}
        {error && (
          <div className="text-red-600 text-sm mb-2 font-semibold">{error}</div>
        )}
        {/* Scrollable form fields container */}
        <div className="space-y-4 mb-6 overflow-y-auto" style={{ maxHeight: '48vh' }}>
          {fields.map(field => {
            // Determine if field is required (default true)
            const isRequired = field.required !== false;
            // Renderizar label whith asterisk if required
            const labelContent = (
              <span>
                {field.label}
                {isRequired && <span className="text-red-600 font-bold"> *</span>}
              </span>
            );
            // Custom permissions field with special rendering
            if (field.type === 'custom-permissions' && typeof customRender === 'function') {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-1">{labelContent}</label>
                  {customRender({ values, setValues })}
                </div>
              );
            }
            // Custom select field with enhanced styling
            if (field.type === 'autocomplete' && typeof field.customRender === 'function') {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-1">{labelContent}</label>
                  {field.customRender({
                    value: values[field.name] || null,
                    setValue: (val) => setValues(prev => ({ ...prev, [field.name]: val }))
                  })}
                </div>
              );
            }
            if (field.type === 'select' && field.customSelect) {
              return (
                <CustomSelect
                  key={field.name}
                  value={values[field.name] !== undefined && values[field.name] !== null ? String(values[field.name]) : ''}
                  onChange={val => {
                    setValues(prev => ({ ...prev, [field.name]: val }));
                    if ((field.name === 'documentId' || field.name === 'document_id') && typeof onProgramChange === 'function') {
                          // Simulate event object for compatibility with both naming conventions
                          onProgramChange({ target: { name: field.name, value: val } });
                        }
                  }}
                  options={field.options.map(opt => ({
                    ...opt,
                    value: String(opt.value)
                  }))}
                  label={field.label}
                  placeholder={field.placeholder}
                  classNames={{
                    trigger: "w-full border border-gray-300 rounded px-3 py-2 bg-white flex items-center justify-between",
                    content: "bg-white border border-gray-300 rounded-lg shadow-lg z-50",
                    item: "px-4 py-2 cursor-pointer hover:bg-[#bdbdbd] hover:text-white focus:bg-[#bdbdbd] focus:text-gray-700 rounded-md flex items-center gap-2",
                    label: "block text-sm font-medium text-gray-700 mb-2"
                  }}
                />
              );
            }
            // Checkbox group field with "select all" functionality and two-column layout
            if (field.type === 'checkbox-group') {
              const allChecked = Array.isArray(values[field.name]) && field.options?.length > 0 && field.options.every(opt => values[field.name].includes(opt.value));
              const handleCheckAll = (e) => {
                const checked = e.target.checked;
                setValues((prev) => ({
                  ...prev,
                  [field.name]: checked ? field.options.map(opt => opt.value) : [],
                }));
              };
              // Layout with two columns
              const colCount = 2;
              const rows = [];
              for (let i = 0; i < field.options.length; i += colCount) {
                rows.push(field.options.slice(i, i + colCount));
              }
              return (
                <div key={field.name}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-base  font-semibold">{labelContent}</label>
                    <label className="flex items-center gap-4 text-sm">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={handleCheckAll}
                      />
                      Todos
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-14">
                    {rows.map((row, rowIdx) => (
                      row.map((opt, colIdx) => (
                        <label key={opt.value} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={String(opt.value)}
                            checked={Array.isArray(values[field.name]) ? values[field.name].map(String).includes(String(opt.value)) : false}
                            onChange={handleChange}
                            disabled={opt.disabled === true}
                          />
                          <span className="text-base">{opt.label}</span>
                        </label>
                      ))
                    ))}
                  </div>
                </div>
              );
            }
            // Generic input field with character counter for maxLength fields
            if (field.type === 'info') {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-1">{labelContent}</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800 select-none">{field.value}</div>
                </div>
              );
            }
            return (
              <div key={field.name}>
                <label className="block text-sm font-semibold mb-1">{labelContent}</label>
                {field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!values[field.name]}
                    onChange={handleChange}
                    className=""
                    disabled={field.disabled === true}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={typeof values[field.name] === 'undefined' ? '' : values[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full border rounded px-3 py-2"
                    autoComplete="off"
                    disabled={field.disabled === true}
                    maxLength={field.maxLength ? field.maxLength : undefined}
                  />
                )}
                {/* Character counter for fields with maxLength */}
                {field.maxLength && (
                  <div className={`text-xs mt-1 flex justify-end ${values[field.name]?.length > field.maxLength ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    {values[field.name]?.length || 0} / {field.maxLength} 
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Action buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            className="flex-1 py-2 rounded font-bold text-white bg-red-600 hover:bg-red-700"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded font-bold text-white bg-green-600 hover:bg-green-700"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalFormGeneric;
