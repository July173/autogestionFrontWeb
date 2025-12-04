import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import React from "react";
/**
 * CustomSelect component
 * ----------------------
 * Custom select based on Radix UI, with flexible styles and options.
 * Allows selecting an option from a list and customizing the design.
 *
 * Props:
 * - value: string                  // Currently selected value
 * - onChange: (value: string) => void // Function called when selection changes
 * - options: Option[]              // Array of available options (value, label)
 * - label?: string                 // Select label (optional)
 * - placeholder?: string           // Placeholder when no selection (optional)
 * - classNames?: object            // Custom CSS classes for trigger, content, item, label (optional)
 *
 * Usage:
 * <CustomSelect
 *   value={valor}
 *   onChange={setValor}
 *   options={[{ value: '1', label: 'Uno' }, { value: '2', label: 'Dos' }]}
 *   label="Selecciona número"
 *   placeholder="Elige una opción"
 * />
 */

// Estructura de cada opción del select
interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  classNames?: {
    trigger?: string;
    content?: string;
    item?: string;
    label?: string;
  };
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  label = "Selecciona una opción",
  placeholder = "Selecciona una opción",
  classNames = {},
  disabled = false,
}: CustomSelectProps) {
  return (
    <div className="relative">
      <label
        className={classNames.label || "block text-sm font-medium mb-2"}
        style={{ color: '#2D7430', ...(classNames.label ? {} : {}) }}
      >
        {label}
      </label>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          className={
            classNames.trigger ||
            // Adjusted: use flex, items-center, and set min-h and px for better alignment
            "w-full px-3 min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43A047] focus:border-transparent font-normal bg-white flex items-center justify-between h-10"
          }
          disabled={disabled}
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          <span className="flex-1 flex items-center min-h-[38px]">
            <Select.Value
              placeholder={placeholder}
              className="text-left w-full flex items-center min-h-[38px]"
            />
          </span>
          <Select.Icon className="flex-shrink-0 flex items-center h-full">
            <ChevronDown className="h-4 w-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={classNames.content || "bg-white border border-gray-300 rounded-lg shadow-lg z-50"}>
            <Select.Viewport>
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className={classNames.item || "px-4 py-2 cursor-pointer hover:bg-[#bdbdbd] hover:text-white focus:bg-[#bdbdbd] focus:text-gray-700 rounded-md flex items-center gap-2"}
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4 text-[#43A047]" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}