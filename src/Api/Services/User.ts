import { ENDPOINTS } from "../config/ConfigApi";
import { ValidateLoginResponse ,UserStatus, User} from "../types/entities/user.types";


// methodo post for send code 2fa
export async function verifySecondFactorCode({ email, code }: { email: string; code: string }): Promise<{ success: boolean; message?: string; user?: User }> {
	const response = await fetch(ENDPOINTS.user.validateSecondFactor, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, code }),
	});
	const data = await response.json();
	if (response.ok) {
		return { success: true, user: data.user };
	} else {
		return { success: false, message: data.error || "Código inválido" };
	}
}

/**
 * Gets a user by ID, including nested person and role data.
 * Endpoint: GET /security/users/{id}/
 * @param id - User ID
 * @returns Promise with the complete user
 */
export async function getUserById(id: number | string) {
	const url = ENDPOINTS.user.getUserId.replace('{id}', String(id));
	const response = await fetch(url);
	if (!response.ok) throw new Error('Error al obtener usuario por ID');
	return response.json();
}


/**
 * Gets the list of all registered users.
 * Endpoint: GET /security/users/
 * @returns Promise with the array of users
 */
export async function getUsers() {
	const response = await fetch(ENDPOINTS.user.getUser);
	if (!response.ok) throw new Error('Error al obtener usuarios');
	return response.json();
}

/**
 * Changes the state of a user (enable or disable) using the soft-delete endpoint.
 * If the user is enabled, disables; if disabled, enables.
 * Endpoint: DELETE /security/users/{id}/soft-delete/
 * @param id - User ID to modify
 * @returns Promise with the API response (true if success)
 */
export async function deleteUser(id: string) {
	const url = ENDPOINTS.user.deleteUser.replace('{id}', id);
	const response = await fetch(url, { method: "DELETE" });
	if (!response.ok) throw new Error('Error al cambiar el estado del usuario');
	// Si la respuesta es 204 No Content, no intentes hacer response.json()
	if (response.status === 204) return true;
	try {
		return await response.json();
	} catch {
		return true;
	}
}

/**
 * Requests the password reset code for an institutional email.
 * Only allows @soy.sena.edu.co emails.
 * Endpoint: POST /security/users/request-password-reset/
 * @param email - Institutional email of the user
 * @returns Promise with the result (success, code, message)
 */
export async function requestPasswordResetCode(email: string): Promise<{ success: boolean; code?: string; message?: string }> {
	// Validar correo institucional en frontend
	const allowedDomains = ['@soy.sena.edu.co', '@sena.edu.co'];
	if (!allowedDomains.some(domain => email.endsWith(domain))) {
		return { success: false, message: 'Solo se permiten correos institucionales (@soy.sena.edu.co, @sena.edu.co)' };
	}

	const response = await fetch(ENDPOINTS.user.requestPasswordReset, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email }),
	});
	const data = await response.json();
	if (response.ok && data.code) {
		// Guardar el código en localStorage
		localStorage.setItem('reset_code', data.code);
		return { success: true, code: data.code };
	}
	return { success: false, message: data.error || 'No se pudo enviar el código' };
}

/**
 * Validates the institutional login of a user.
 * Endpoint: POST /security/users/validate-institutional-login/
 * @param email - Institutional email
 * @param password - Password
 * @returns Promise with the validation response (tokens and user data)
 */
export async function validateInstitutionalLogin(email: string, password: string): Promise<ValidateLoginResponse> {
	const response = await fetch(ENDPOINTS.user.validateLogin, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});
	if (!response.ok) {
		throw new Error("Credenciales inválidas o error de validación");
	}
	return response.json();
}

/**
 * Verifies if the password reset code is valid for the user.
 * Endpoint: POST /security/users/reset-password/
 * @param email - Institutional email
 * @param code - Recovery code
 * @returns Promise with the result (success, message)
 */
export async function verifyResetCode(email: string, code: string): Promise<{ success: boolean; message?: string }> {
	console.log('Verificando código con:', { email, code }); // DEBUG
	// Consultar a la BD si el código es correcto
	const requestBody = { email, code, new_password: "dummy" };
	console.log('Enviando al backend:', requestBody); // DEBUG
	const response = await fetch(ENDPOINTS.user.resetPassword, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(requestBody)
	});
	const data = await response.json();
	if (response.ok && !data.error) {
		return { success: true };
	}
	return { success: false, message: data.error || "Código incorrecto o expirado" };
}

/**
 * Updates the password of a user using the recovery code.
 * Endpoint: POST /security/users/reset-password/
 * @param email - Institutional email
 * @param code - Recovery code
 * @param new_password - New password
 * @returns Promise with the result (success, message)
 */
export async function resetPassword(email: string, code: string, new_password: string): Promise<{ success: boolean; message?: string }> {
	const response = await fetch(ENDPOINTS.user.resetPassword, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, code, new_password })
	});
	const data = await response.json();
	if (response.ok && data.success) {
		return { success: true };
	}
	return { success: false, message: data.error || "No se pudo actualizar la contraseña" };
}


/**
 * Gets the textual status of a user (active/disabled) according to its properties.
 * @param user - UserStatus object with state properties
 * @returns 'activo' or 'inhabilitado'
 */
export function getUserStatus(user: UserStatus) {
	return typeof user.is_active === 'boolean'
		? (user.is_active ? 'activo' : 'inhabilitado')
		: ((user.estado || '').toLowerCase().includes('habilitado') ? 'activo' : 'inhabilitado');
}


/**
 * Filters users using the backend filter endpoint.
 * Endpoint: GET /security/users/filter/?role=...&search=...
 * @param params - Filter params { role?: string, search?: string }
 * @returns Promise with the array of filtered users
 */
export async function filterUsers(params: { role?: string; search?: string }) {
	const { role, search } = params || {};
	const base = ENDPOINTS.user.filter;
	let url = `${base}?`;
	if (role) url += `role=${encodeURIComponent(String(role))}&`;
	if (search) url += `search=${encodeURIComponent(String(search))}&`;
	url = url.replace(/&$/, '');
	const response = await fetch(url);
	if (!response.ok) throw new Error('Error al filtrar usuarios');
	return response.json();
}
