import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Gets the data of a role with its permissions and forms.
 * Endpoint: GET /security/roles/{id}/permissions-forms/
 * @param id - Role ID
 * @returns Promise with the role data
 */
export async function getRolPermissions(id) {
	const url = ENDPOINTS.rol.getRolPermissions.replace('{id}', id.toString());
	const response = await fetch(url);
	if (!response.ok) throw new Error('Error al obtener datos del rol');
	return response.json();
}

/**
 * Updates a role with its forms and permissions.
 * Endpoint: PUT /security/roles/{id}/permissions-forms/
 * @param id - Role ID
 * @param data - Updated role data
 * @returns Promise with the API response
 */
export async function putRolFormPerms(id, data) {
	const url = ENDPOINTS.rol.putRolFormPerms.replace('{id}', id.toString());
	const response = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error('Error al actualizar el rol');
	return response.json();
}
/**
 * Gets the matrix of role and form permissions.
 * Endpoint: GET /security/roles/permissions-forms-matrix/
 * @returns Promise with the permissions matrix
 */
export async function getRolesFormsPerms() {
	const response = await fetch(ENDPOINTS.rol.getRolesFormsPerms);
	if (!response.ok) throw new Error('Error al obtener la matriz de permisos');
	const data = await response.json();
	// Normalize backend variants to a consistent shape used by frontend
	// Backend may return keys like { rol, formulario, Ver, Editar, ... }
	if (Array.isArray(data)) {
		return (data as unknown[]).map((it: unknown) => {
			const o = it as Record<string, unknown>;
			return {
				role: o['role'] ?? o['rol'] ?? o['nombre'] ?? o['role_name'] ?? o['role_id'] ?? o['rol_id'],
				form: o['form'] ?? o['formulario'] ?? o['formulario_name'] ?? o['formulario_id'] ?? o['form_id'],
				Ver: !!o['Ver'],
				Editar: !!o['Editar'],
				Registrar: !!o['Registrar'],
				Eliminar: !!o['Eliminar'],
				Activar: !!o['Activar'],
			};
		});
	}
	return data;
}

/**
 * Changes the state of a role (enable or disable) using the soft-delete endpoint.
 * If the role is active, disables it; if inactive, reactivates it.
 * Endpoint: DELETE /security/roles/{id}/soft-delete/
 * @param id - Role ID
 * @param active - Current state of the role
 * @returns Promise with the API response (true if success)
 */
export async function toggleRoleActive(id: number, active: boolean) {
	// If active, disables (DELETE); if inactive, reactivates (DELETE)
	const url = ENDPOINTS.rol.deleteRolUsers.replace('{id}', id.toString());
	const options: RequestInit = { method: 'DELETE' };
	const response = await fetch(url, options);
	if (!response.ok) {
		let errorMsg = 'Error al cambiar el estado del rol';
		try {
			const data = await response.json();
			if (data && (data.detail || data.error)) {
				errorMsg = data.detail || data.error;
			} else {
				// If there is no detail/error, show the full JSON
				errorMsg = JSON.stringify(data);
			}
		} catch {
			// If not JSON, try to show as plain text
			try {
				const text = await response.text();
				if (text) errorMsg = text;
			} catch {
				// Intentionally left blank: no further error handling needed here
			}
		}
		throw new Error(errorMsg);
	}
	if (response.status === 204) return true;
	try {
		return await response.json();
	} catch {
		return true;
	}
}
// Fetch-get all roles

/**
 * Gets the list of all roles.
 * Endpoint: GET /security/roles/
 * @returns Promise with the array of roles
 */
export async function getRoles() {
	const response = await fetch(ENDPOINTS.rol.getRoles);
	if (!response.ok) throw new Error('Error al obtener roles');
	const data = await response.json();
	// Normalize backend shape: { id, nombre, descripcion, active, cantidad_usuarios }
	if (Array.isArray(data)) {
		return (data as unknown[]).map((r: unknown) => {
			const o = r as Record<string, unknown>;
			const id = (o['id'] as number) ?? Number(String(o['id'] ?? 0));
			return {
				id,
				// Prefer localized 'nombre', then 'name', then legacy 'type_role', finally id as string
				name: (o['nombre'] as string) ?? (o['name'] as string) ?? (o['type_role'] as string) ?? String(id),
				// keep legacy `type_role` for components that expect it
				type_role: (o['type_role'] as string) ?? (o['nombre'] as string) ?? (o['name'] as string) ?? String(id),
				description: (o['descripcion'] as string) ?? (o['description'] as string) ?? '',
				active: typeof o['active'] === 'boolean' ? (o['active'] as boolean) : ((o['active'] as boolean) ?? true),
				user_count: (o['cantidad_usuarios'] as number) ?? (o['user_count'] as number) ?? 0,
			};
		});
	}
	return data;
}


/**
 * Gets the list of roles along with the number of users assigned to each.
 * Endpoint: GET /security/roles/roles-users/
 * @returns Promise with the array of roles and users
 */
export async function getRolesUser() {
	const response = await fetch(ENDPOINTS.rol.getRolUser);
	if (!response.ok) throw new Error('Error al obtener roles con los usuarios');
	const data = await response.json();
	// Normalize backend variants to a consistent frontend shape
	if (Array.isArray(data)) {
		return (data as unknown[]).map((r: unknown) => {
			const o = r as Record<string, unknown>;
			const id = (o['id'] as number) ?? Number(String(o['id'] ?? 0));
			return {
				id,
				name: (o['nombre'] as string) ?? (o['name'] as string) ?? (o['type_role'] as string) ?? String(id),
				type_role: (o['type_role'] as string) ?? (o['nombre'] as string) ?? (o['name'] as string) ?? String(id),
				description: (o['descripcion'] as string) ?? (o['description'] as string) ?? '',
				active: typeof o['active'] === 'boolean' ? (o['active'] as boolean) : ((o['active'] as boolean) ?? true),
				user_count: (o['cantidad_usuarios'] as number) ?? (o['user_count'] as number) ?? 0,
			};
		});
	}
	return data;
}

// Helper: normalize a single role-like object (exported for reuse)
export function normalizeRoleObject(o: Record<string, unknown>) {
	const id = (o['id'] as number) ?? Number(String(o['id'] ?? 0));
	return {
		id,
		name: (o['nombre'] as string) ?? (o['name'] as string) ?? (o['type_role'] as string) ?? String(id),
		type_role: (o['type_role'] as string) ?? (o['nombre'] as string) ?? (o['name'] as string) ?? String(id),
		description: (o['descripcion'] as string) ?? (o['description'] as string) ?? '',
		active: typeof o['active'] === 'boolean' ? (o['active'] as boolean) : ((o['active'] as boolean) ?? true),
		user_count: (o['cantidad_usuarios'] as number) ?? (o['user_count'] as number) ?? 0,
	};
}

// Helper: normalize an array of role-like objects
export function normalizeRolesArray(data: unknown) {
	if (!Array.isArray(data)) return [];
	return (data as unknown[]).map(it => normalizeRoleObject(it as Record<string, unknown>));
}

/**
 * Creates a new role with associated permissions.
 * Endpoint: POST /security/roles/permissions-forms/
 * @param data - Role and permissions data
 * @returns Promise with the API response
 */
export async function postRolPermissions(data) {
	const response = await fetch(ENDPOINTS.rol.postRolPermissions, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error('Error al crear el rol');
	return response.json();
}