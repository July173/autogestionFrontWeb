
import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Gets the list of all regionals.
 * Endpoint: GET /general/regionals/
 * @returns Promise with the array of regionals
 */
export async function getRegionales() {
  const response = await fetch(ENDPOINTS.regional.allRegionals);
  if (!response.ok) throw new Error('Error al obtener regionales');
  return response.json();
}

/**
 * Filters regionals by search and active status.
 * Endpoint: GET /general/regionals/filter/?search=...&active=...
 */
export async function filterRegionals(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.regional.filterRegional);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.active) url.searchParams.append('active', params.active);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Error al filtrar regionales');
  return response.json();
}

/**
 * Creates a new regional.
 * Endpoint: POST /general/regionals/
 * @param data - Regional data to create
 * @returns Promise with the created regional
 */
export async function createRegional(data) {
  const response = await fetch(ENDPOINTS.regional.allRegionals, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear regional');
  return response.json();
}

/**
 * Updates an existing regional.
 * Endpoint: PUT /general/regionals/{id}/
 * @param id - Regional ID to update
 * @param data - New regional data
 * @returns Promise with the updated regional
 */
export async function updateRegional(id, data) {
  const url = ENDPOINTS.regional.idRegionals.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar regional');
  return response.json();
}

/**
 * Deactivates (soft delete) a regional.
 * Endpoint: DELETE /general/regionals/{id}/soft-delete/
 * @param id - Regional ID to deactivate
 * @returns Promise with the deactivation response
 */
export async function softDeleteRegional(id) {
  const url = ENDPOINTS.regional.softDeleteRegionals.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Error al deshabilitar regional');
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}