/**
 * Service for operations related to the Permission entity.
 * Includes retrieval of permissions.
 */
import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Gets the list of available permissions.
 * @returns Promise with the array of permissions
 */
export async function getPermissions() {
	const response = await fetch(ENDPOINTS.permission.getPermissions);
	if (!response.ok) throw new Error('Error al obtener los permisos');
	return response.json();
}
