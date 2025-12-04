
/**
 * Generic validation functions for login and forms.
 * Includes validations for email, password, names, surnames, document, phone, and reset codes.
 * Usage: Import and use the functions in forms to validate user data.
 */

/**
 * Validates if the email is institutional SENA (@soy.sena.edu.co or @sena.edu.co).
 * @param email - Email to validate
 * @returns True if valid
 */
export function isSenaEmail(email: string): boolean {
  return email.endsWith('@soy.sena.edu.co') || email.endsWith('@sena.edu.co');
}

/**
 * Validates if the password has at least 8 characters.
 * @param password - Password to validate
 * @returns True if valid
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validates names (letters and spaces only, required).
 * @param names - Names to validate
 * @returns Error message or null if valid
 */
export function isValidNames(names: string): string | null {
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(names)) return 'Solo letras y espacios';
  if (names.trim().length === 0) return 'Campo obligatorio';
  return null;
}

/**
 * Validates surnames (letters and spaces only, required).
 * @param surnames - Surnames to validate
 * @returns Error message or null if valid
 */
export function isValidSurnames(surnames: string): string | null {
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(surnames)) return 'Solo letras y espacios';
  if (surnames.trim().length === 0) return 'Campo obligatorio';
  return null;
}

/**
 * Validates document number (digits only).
 * @param doc - Document to validate
 * @returns Error message or null if valid
 */
export function isValidDocumentNumber(doc: string): string | null {
  if (!/^\d+$/.test(doc)) return 'Dato no válido';
  return null;
}

/**
 * Validates phone number (10 digits).
 * @param phone - Phone to validate
 * @returns Error message or null if valid
 */
export function isValidPhone(phone: string): string | null {
  if (!/^\d{10}$/.test(phone)) return 'Dato no válido';
  return null;
}

/**
 * Validates reset code (6 numeric digits).
 * @param code - Code to validate
 * @returns True if valid
 */
export function isValidResetCode(code: string): boolean {
  return /^[0-9]{6}$/.test(code);
}

/**
 * Validates if the expiration date is after the current date.
 * @param expiration - Date/time in 'dd/MM/yyyy HH:mm' format
 * @returns True if not expired
 */
export function isCodeNotExpired(expiration: string): boolean {
  // expiration in 'dd/MM/yyyy HH:mm' format
  const [date, time] = expiration.split(' ');
  const [day, month, year] = date.split('/').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const expDate = new Date(year, month - 1, day, hour, minute);
  return expDate > new Date();
}

/**
 * Capitalizes each word in a text.
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
