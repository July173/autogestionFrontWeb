import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Creates a new form in the system.
 * @param data - Data of the form to create
 * @returns Promise with the API response
 */
export async function postForm(data: unknown) {
	const response = await fetch(ENDPOINTS.form.post, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error('Error al crear el formulario');
	return response.json();
}


/**
 * Gets the list of all forms.
 * @returns Promise with the array of forms
 */
export async function getForms() {
	const response = await fetch(ENDPOINTS.form.getForm);
	if (!response.ok) throw new Error('Error al obtener formularios');
	return response.json();
}

/**
 * Filters forms using the API filter endpoint.
 * @param params - Object with optional filter params (search, active, etc.)
 * @returns Promise with filtered forms
 */
export async function filterForms(params: { search?: string; active?: string } = {}) {
	const query: string[] = [];
	if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
	if (params.active !== undefined && params.active !== '') query.push(`active=${params.active}`);
	const url = `${ENDPOINTS.form.filterForm}${query.length ? '?' + query.join('&') : ''}`;
	const response = await fetch(url);
	if (!response.ok) throw new Error('Error al filtrar formularios');
	return response.json();
}

/**
 * Gets a form by id.
 * @param id - Form id
 * @returns Promise with the form data
 */
export async function getFormById(id: number | string) {
	const url = ENDPOINTS.form.getFormById.replace('{id}', String(id));
	const response = await fetch(url);
	if (!response.ok) throw new Error('Error al obtener el formulario');
	return response.json();
}

/**
 * Updates a form by id.
 * @param id - Form id
 * @param data - Updated form data
 * @returns Promise with the API response
 */
export async function putForm(id: number | string, data: unknown) {
	const url = ENDPOINTS.form.putForm.replace('{id}', String(id));
	const response = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error('Error al actualizar el formulario');
	return response.json();
}

/**
 * Deletes (soft-delete) a form by id.
 * @param id - Form id
 * @returns Promise with the API response
 */
export async function deleteForm(id: number | string) {
	const url = ENDPOINTS.form.deleteForm.replace('{id}', String(id));
	const response = await fetch(url, { method: 'DELETE' });
	if (!response.ok) throw new Error('Error al eliminar el formulario');
	const text = await response.text();
	return text ? JSON.parse(text) : {};
}
