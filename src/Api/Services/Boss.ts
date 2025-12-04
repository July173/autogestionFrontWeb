import { ENDPOINTS } from '../config/ConfigApi';

export const getAllBosses = async (): Promise<Array<Record<string, unknown>>> => {
  try {
    const response = await fetch(ENDPOINTS.Boss.allBoss, { method: 'GET' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al obtener jefes');
    }
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('getAllBosses error:', error);
    throw error;
  }
};

export const filterBosses = async (params: Record<string, string> = {}): Promise<Array<Record<string, unknown>>> => {
  try {
    const query = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    // Use the dedicated filter endpoint when params are present, otherwise fall back to the full list
    const url = query ? `${ENDPOINTS.Boss.filterBoss}?${query}` : ENDPOINTS.Boss.allBoss;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al filtrar jefes');
    }
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('filterBosses error:', error);
    throw error;
  }
};
