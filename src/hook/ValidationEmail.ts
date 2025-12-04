/**
 * Generic hook for validating SENA institutional emails.
 * Checks if the email has the correct format (@soy.sena.edu.co).
 *
 * Usage:
 * - Call `useValidationEmail(email)` and receive whether it's valid and the error message.
 */
/**
 * Validates if the email is institutional SENA (@soy.sena.edu.co).
 * @param email - Email to validate
 * @returns Object with isValid boolean and error message string
 */
export function useValidationEmail(email: string) {
	const senaRegex = /^[a-zA-Z0-9._%+-]+@soy\.sena\.edu\.co$/;
	const isValid = senaRegex.test(email);
	const error = isValid ? '' : 'Solo se permiten correos @soy.sena.edu.co y @sena.edu.co';
	return { isValid, error };
}
	