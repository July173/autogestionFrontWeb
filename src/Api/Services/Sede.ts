import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Gets all headquarters (sedes).
 * Endpoint: GET /general/sedes/
 * @returns Promise with the array of headquarters
 */
export async function getSedes() {
  const response = await fetch(ENDPOINTS.sede.allSedes);
  if (!response.ok) throw new Error('Error al obtener sedes');
  return response.json();
}

/**
 * Filters sedes by search and active status.
 * Endpoint: GET /general/sedes/filter/?search=...&active=...
 */
export async function filterSedes(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.sede.filterSede);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.active) url.searchParams.append('active', params.active);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Error al filtrar sedes');
  return response.json();
}

/**
 * Creates a new headquarters (sede).
 * Endpoint: POST /general/sedes/
 * @param data - Headquarters data
 * @returns Promise with the created headquarters
 */
export async function createSede(data) {
  const response = await fetch(ENDPOINTS.sede.allSedes, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const txt = await response.text();
    try {
      const parsed = txt ? JSON.parse(txt) : null;
      const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
      throw new Error(msg || `Error al crear sede (${response.status})`);
    } catch (_err) {
      throw new Error(txt || `Error al crear sede (${response.status})`);
    }
  }
  return response.json();
}

/**
 * Updates an existing headquarters (sede).
 * Endpoint: PUT /general/sedes/{id}/
 * @param id - Headquarters ID to update
 * @param data - New headquarters data
 * @returns Promise with the updated headquarters
 */
export async function updateSede(id, data) {
  const url = ENDPOINTS.sede.idSedes.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const txt = await response.text();
    try {
      const parsed = txt ? JSON.parse(txt) : null;
      const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
      throw new Error(msg || `Error al actualizar sede (${response.status})`);
    } catch (_err) {
      throw new Error(txt || `Error al actualizar sede (${response.status})`);
    }
  }
  return response.json();
}

/**
 * Disables a headquarters (soft delete).
 * Endpoint: DELETE /general/sedes/{id}/soft-delete/
 * @param id - Headquarters ID to disable
 * @returns Promise with the API response
 */
export async function softDeleteSede(id) {
  const url = ENDPOINTS.sede.softDeleteSedes.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const txt = await response.text();
    try {
      const parsed = txt ? JSON.parse(txt) : null;
      const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
      throw new Error(msg || `Error al deshabilitar sede (${response.status})`);
    } catch (_err) {
      throw new Error(txt || `Error al deshabilitar sede (${response.status})`);
    }
  }
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}