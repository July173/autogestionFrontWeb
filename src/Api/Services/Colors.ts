import { ENDPOINTS } from '../config/ConfigApi';

// Get all colors
export async function getColors() {
  const response = await fetch(ENDPOINTS.Colors.allColors);
  if (!response.ok) throw new Error('Error al obtener colores');
  return response.json();
}

// Create color
export async function createColor(data) {
  const response = await fetch(ENDPOINTS.Colors.allColors, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const txt = await response.text();
    try {
      const parsed = txt ? JSON.parse(txt) : null;
      const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
      throw new Error(msg || `Error al crear color (${response.status})`);
    } catch (_err) {
      throw new Error(txt || `Error al crear color (${response.status})`);
    }
  }
  return response.json();
}

// Update color
export async function updateColor(id, data) {
  const url = ENDPOINTS.Colors.idColors.replace('{id}', String(id));
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
      throw new Error(msg || `Error al actualizar color (${response.status})`);
    } catch (_err) {
      throw new Error(txt || `Error al actualizar color (${response.status})`);
    }
  }
  return response.json();
}

// Deactivate color (soft delete)
export async function softDeleteColor(id) {
  const url = ENDPOINTS.Colors.softDeleteColors.replace('{id}', String(id));
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const txt = await response.text();
    try {
      const parsed = txt ? JSON.parse(txt) : null;
      const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
      throw new Error(msg || `Error al deshabilitar color (${response.status})`);
    } catch (_err) {
      throw new Error(txt || `Error al deshabilitar color (${response.status})`);
    }
  }
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/**
 * Filters colors using the API filter endpoint.
 * Accepts optional search and active parameters.
 * @param params - { search?: string; active?: string }
 */
export async function filterColors(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.Colors.filterColors);
  if (params) {
    if (params.search) url.searchParams.append('search', params.search);
    if (params.active !== undefined && params.active !== '') url.searchParams.append('active', params.active);
  }

  const response = await fetch(String(url));
  if (!response.ok) throw new Error('Error al filtrar colores');
  return response.json();
}
