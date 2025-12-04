import { ENDPOINTS } from '../config/ConfigApi';

// Get all centers
export async function getCenters() {
  const response = await fetch(ENDPOINTS.center.allCenters);
  if (!response.ok) throw new Error('Error al obtener centros');
  return response.json();
}

// Create center
export async function createCenter(data) {
  const response = await fetch(ENDPOINTS.center.allCenters, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear centro');
  return response.json();
}

// Update center
export async function updateCenter(id, data) {
  const url = ENDPOINTS.center.idCenters.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar centro');
  return response.json();
}

// Deactivate center (soft delete)
export async function softDeleteCenter(id) {
  const url = ENDPOINTS.center.softDeleteCenters.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Error al deshabilitar centro');
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/**
 * Filters centers using the API filter endpoint.
 * Accepts optional search and active parameters.
 * @param params - { search?: string; active?: string }
 */
export async function filterCenters(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.center.filterCenter);
  if (params) {
    if (params.search) url.searchParams.append('search', params.search);
    if (params.active !== undefined && params.active !== '') url.searchParams.append('active', params.active);
  }

  const response = await fetch(String(url));
  if (!response.ok) throw new Error('Error al filtrar centros');
  return response.json();
}