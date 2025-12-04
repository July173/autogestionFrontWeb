/**
 * Service for operations related to the Ficha entity.
 * Includes retrieval of fichas.
 */
import { ENDPOINTS } from '../config/ConfigApi';


/**
 * Gets the list of available fichas.
 * @returns Promise with the array of fichas
 */
export async function getFichas() {
  const response = await fetch(ENDPOINTS.ficha.allFichas);
  if (!response.ok) throw new Error('Error al obtener fichas');
  return response.json();
}

/**
 * Filters fichas by search and active status.
 * Endpoint: GET /general/fichas/filter/?search=...&active=...
 * @param params Optional search and active params
 */
export async function filterFichas(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.ficha.filterFichas);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.active) url.searchParams.append('active', params.active);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Error al filtrar fichas');
  return response.json();
}

/**
 * Creates a new ficha.
 * @param data - Ficha data
 * @returns Promise with the created ficha
 */
export async function createFicha(data) {
  const response = await fetch(ENDPOINTS.ficha.allFichas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear ficha');
  return response.json();
}

/**
 * Deletes an existing ficha.
 * @param id - ID of the ficha to delete
 * @returns Promise with the deletion response
 */
export async function deleteFicha(id: number | string) {
  const url = ENDPOINTS.ficha.deleteIdFicha.replace('{id}', String(id));
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error('Error al deshabilitar ficha');
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

/**
 * Updates an existing ficha.
 * @param id - ID of the ficha to update
 * @param data - New data for the ficha
 * @returns Promise with the updated ficha
 */
export async function updateFicha(id: number | string, data) {
  const url = ENDPOINTS.ficha.IdFicha.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar ficha');
  return response.json();
}