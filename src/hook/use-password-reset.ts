/**
 * Hook and utilities for password reset logic.
 * Allows saving, retrieving, and clearing the reset code in localStorage.
 * Used in the password reset and change flow.
 */

/**
 * Saves the reset code and its expiration in localStorage.
 * @param {string} code - Reset code.
 * @param {string} expiration - Expiration date/time.
 */

import { isSenaEmail, isValidPassword, isValidResetCode, isCodeNotExpired } from './validationlogin';

/**
 * Saves the reset code and its expiration in localStorage.
 * @param code - Reset code to store
 * @param expiration - Expiration date/time string
 */
export function saveResetCode(code: string, expiration: string) {
  localStorage.setItem('reset_code', code);
  localStorage.setItem('reset_code_exp', expiration);
}

/**
 * Retrieves the reset code and its expiration from localStorage.
 * @returns Object containing code and expiration, or null values if not found
 */
export function getResetCode(): { code: string | null; expiration: string | null } {
  return {
    code: localStorage.getItem('reset_code'),
    expiration: localStorage.getItem('reset_code_exp'),
  };
}

/**
 * Removes the reset code and its expiration from localStorage.
 */
export function clearResetCode() {
  localStorage.removeItem('reset_code');
  localStorage.removeItem('reset_code_exp');
}
