/**
 * Service for operations related to the Module entity.
 * Includes retrieval, registration, update, and query by ID.
 */
import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Gets the data of a module with its associated forms.
 * @param id - Module ID
 * @returns Promise with the module data
 */
export async function getModuleForms(id) {
	const url = ENDPOINTS.module.getModuleForms.replace('{id}', id.toString());
	const response = await fetch(url);
	if (!response.ok) throw new Error('Error al obtener datos del módulo');
	return response.json();
}

/**
 * Updates the data of a module and its associated forms.
 * @param id - Module ID
 * @param data - Updated module data
 * @returns Promise with the API response
 */
export async function putModuleForms(id, data) {
	const url = ENDPOINTS.module.putModuleForms.replace('{id}', id.toString());
	const response = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error('Error al actualizar el módulo');
	return response.json();
}
/**
 * Creates a new module in the system.
 * @param data - Module data to create
 * @returns Promise with the API response
 */
export async function postModule(data) {
	const response = await fetch(ENDPOINTS.module.post, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error('Error al crear el módulo');
	return response.json();
}

/**
 * Gets the list of all modules.
 * @returns Promise with the array of modules
 */
export async function getModules() {
	const response = await fetch(ENDPOINTS.module.getModule);
	if (!response.ok) throw new Error('Error al obtener módulos');
	return response.json();
}

/**
 * Enables or disables a module (soft delete / toggle active)
 * @param id - Module ID
 * @returns Promise with the API response
 */
export async function toggleModuleActive(id: number | string) {
	const url = ENDPOINTS.module.deleteModule.replace('{id}', String(id));
	const response = await fetch(url, {
		method: 'DELETE',
	});
	if (!response.ok) throw new Error('Error al cambiar el estado del módulo');
	const text = await response.text();
	return text ? JSON.parse(text) : {};
}
