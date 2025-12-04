
import { ENDPOINTS } from "../config/ConfigApi";

/**
 * Gets all query types.
 * Endpoint: GET /general/type-of-queries/
 * @returns Promise with the array of query types
 */
export async function getAllTypeOfQueries() {
	const response = await fetch(ENDPOINTS.TypeOfQueries.allTypeOfQueries);
	return response.json();
}

/**
 * Gets a query type by ID.
 * Endpoint: GET /general/type-of-queries/{id}/
 * @param id - Query type ID
 * @returns Promise with the query type
 */
export async function getTypeOfQueriesById(id: string | number) {
	const url = ENDPOINTS.TypeOfQueries.idTypeOfQueries.replace("{id}", String(id));
	const response = await fetch(url);
	return response.json();
}

/**
 * Creates a query type.
 * Endpoint: POST /general/type-of-queries/
 * @param data - Query type data
 * @returns Promise with the created query type
 */
export async function createTypeOfQueries(data: any) {
	const response = await fetch(ENDPOINTS.TypeOfQueries.allTypeOfQueries, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	return response.json();
}

/**
 * Updates a query type.
 * Endpoint: PUT /general/type-of-queries/{id}/
 * @param id - Query type ID to update
 * @param data - New query type data
 * @returns Promise with the updated query type
 */
export async function updateTypeOfQueries(id: string | number, data: any) {
	const url = ENDPOINTS.TypeOfQueries.idTypeOfQueries.replace("{id}", String(id));
	const response = await fetch(url, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	return response.json();
}

/**
 * Disables (soft delete) a query type.
 * Endpoint: DELETE /general/type-of-queries/{id}/soft-delete/
 * @param id - Query type ID to disable
 * @returns Promise with the API response
 */
export async function softDeleteTypeOfQueries(id: string | number) {
	const url = ENDPOINTS.TypeOfQueries.softDeleteTypeOfQueries.replace("{id}", String(id));
	const response = await fetch(url, { method: "DELETE" });
	return response.json();
}

/**
 * Filters type of queries by search and active status.
 * Endpoint: GET /general/type-of-queries/filter/?search=...&active=...
 * @param params - Optional search and active params
 */
export async function filterTypeOfQueries(params?: { search?: string; active?: string }) {
	const url = new URL(ENDPOINTS.TypeOfQueries.filterTypeOfQueries);
	if (params?.search) url.searchParams.append('search', params.search);
	if (params?.active) url.searchParams.append('active', params.active);

	const response = await fetch(url.toString());
	if (!response.ok) throw new Error('Error al filtrar tipos de pregunta');
	return response.json();
}
