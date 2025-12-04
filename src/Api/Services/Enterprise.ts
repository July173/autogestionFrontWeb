import { ENDPOINTS } from '../config/ConfigApi';

/**
 * Gets the list of enterprises.
 * Endpoint: GET /assign/enterprise/
 */
export const getAllEnterprises = async (): Promise<Array<Record<string, unknown>>> => {
  try {
    const response = await fetch(ENDPOINTS.Enterprise.allEnterprise, { method: 'GET' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al obtener empresas');
    }
    const result = await response.json();
    // The backend may return { data: [...] } or the array directly
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('getAllEnterprises error:', error);
    throw error;
  }
};

/**
 * Gets a single enterprise by id.
 * Endpoint: GET /assign/enterprise/{id}/
 * @param id enterprise id
 */
export const getEnterpriseById = async (id: number): Promise<Record<string, any> | null> => {
  try {
    const url = ENDPOINTS.Enterprise.idEnterprise.replace('{id}', String(id));
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al obtener la empresa');
    }
    const result = await response.json();
    // Normalize to returned data object
    return result.data ?? result ?? null;
  } catch (error) {
    console.error('getEnterpriseById error:', error);
    throw error;
  }
};

