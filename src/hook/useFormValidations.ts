import { useState } from 'react';

/**
 * Custom hook providing form validation utilities.
 * Contains validation functions for phone numbers and date ranges.
 * 
 * @returns Object with validation functions for phone and date validation
 */
export function useFormValidations() {
  // Phone: only numbers and exactly 10 digits
  const validatePhone = (value: string | number): string => {
    const str = String(value).replace(/\D/g, '');
    if (str.length !== 10) return 'El número debe tener exactamente 10 dígitos';
    return '';
  };

  // End date: minimum 6 months after start, same month and year
  const validateEndDate = (start: number | null, end: number | null): string => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Calculate expected end date (6 months after)
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setMonth(expectedEndDate.getMonth() + 6);
    
    // Must be the same year as expected date
    if (endDate.getFullYear() !== expectedEndDate.getFullYear()) {
      return 'La fecha de fin debe ser en el mismo año';
    }
    
    // Must be exactly 6 months after
    if (endDate.getMonth() !== expectedEndDate.getMonth()) {
      const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return `La fecha de fin debe ser en ${monthNames[expectedEndDate.getMonth()]} (6 meses después de ${monthNames[startDate.getMonth()]})`;
    }
    
    // Must be after start date
    if (endDate.getTime() <= startDate.getTime()) {
      return 'La fecha de fin debe ser posterior a la de inicio';
    }
    
    return '';
  };

  return { validatePhone, validateEndDate };
}
