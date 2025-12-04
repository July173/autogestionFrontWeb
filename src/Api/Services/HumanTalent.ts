import { ENDPOINTS } from '../config/ConfigApi';

export const getAllHumanTalents = async (): Promise<Array<Record<string, unknown>>> => {
  try {
    const response = await fetch(ENDPOINTS.HumanTalent.allHumanTalent, { method: 'GET' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al obtener talento humano');
    }
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('getAllHumanTalents error:', error);
    throw error;
  }
};

export const filterHumanTalents = async (params: Record<string, string> = {}): Promise<Array<Record<string, unknown>>> => {
  try {
    const query = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    // Use the dedicated filter endpoint when params are present, otherwise fall back to the full list
    const url = query ? `${ENDPOINTS.HumanTalent.filterHumanTalent}?${query}` : ENDPOINTS.HumanTalent.allHumanTalent;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al filtrar talento humano');
    }
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('filterHumanTalents error:', error);
    throw error;
  }
};
