import { ENDPOINTS } from "../config/ConfigApi";

/**
 * Gets contract types with an empty option by default for selects.
 * Endpoint: GET /general/contract-types/
 * @returns Promise<{ id: number | ""; name: string }[]> - List of contract types with empty option
 */
export async function getContractTypesWithEmpty(): Promise<{ id: number | ""; name: string }[]> {
  try {
		// Assuming there is an endpoint for contract types
    const response = await fetch(ENDPOINTS.contractType.allContractType, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error al obtener los tipos de contrato");
    }
    const contractTypes = await response.json();
    return [
			{ id: "", name: "Seleccione tipo de contrato" }, // Select contract type
      ...contractTypes
    ];
  } catch (error) {
    console.error('Error obteniendo tipos de contrato:', error);
		// In case of error, return an empty option
    return [
			{ id: "", name: "Seleccione tipo de contrato" } // Select contract type
    ];
  }
}



/**
 * Gets all contract types.
 * Endpoint: GET /general/contract-types/
 * @returns Promise with the array of contract types
 */
export async function getContractTypes() { 
	const response = await fetch(ENDPOINTS.contractType.allContractType);
	if (!response.ok) throw new Error("Error al obtener tipos de contrato");
	return response.json();
}

/**
 * Filters contract types by search and active status.
 * Endpoint: GET /general/type-contracts/filter/?search=...&active=...
 * @param params - Optional search and active params
 */
export async function filterContractTypes(params?: { search?: string; active?: string }) {
	const url = new URL(ENDPOINTS.contractType.filterContractType);
	if (params?.search) url.searchParams.append('search', params.search);
	if (params?.active) url.searchParams.append('active', params.active);

	const response = await fetch(url.toString());
	if (!response.ok) throw new Error('Error al filtrar tipos de contrato');
	return response.json();
}

/**
 * Creates a contract type.
 * Endpoint: POST /general/contract-types/
 * @param data - Contract type data
 * @returns Promise with the created contract type
 */
export async function createContractType(data) { 
	const response = await fetch(ENDPOINTS.contractType.allContractType, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		// Try to parse backend error message (e.g. { detail: '...' })
		const txt = await response.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const detail = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(detail || `Error al crear tipo de contrato (${response.status})`);
		} catch (err) {
			// If JSON parse fails, throw raw text or generic message
			throw new Error(txt || `Error al crear tipo de contrato (${response.status})`);
		}
	}
	return response.json();
}

/**
 * Updates a contract type.
 * Endpoint: PUT /general/contract-types/{id}/
 * @param id - Contract type ID to update
 * @param data - New contract type data
 * @returns Promise with the updated contract type
 */
export async function updateContractType(id, data) { 
	const url = ENDPOINTS.contractType.idContractType.replace("{id}", String(id));
	const response = await fetch(url, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		const txt = await response.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const detail = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(detail || `Error al actualizar tipo de contrato (${response.status})`);
		} catch (err) {
			throw new Error(txt || `Error al actualizar tipo de contrato (${response.status})`);
		}
	}
	return response.json();
}

/**
 * Disables (soft delete) a contract type.
 * Endpoint: DELETE /general/contract-types/{id}/soft-delete/
 * @param id - Contract type ID to disable
 * @returns Promise with the API response
 */
export async function deactivateContractType(id) {
	const url = ENDPOINTS.contractType.softDelete.replace("{id}", String(id));
	const response = await fetch(url, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	});
	if (!response.ok) throw new Error("Error al deshabilitar tipo de contrato");
	const text = await response.text();
	try {
		return text ? JSON.parse(text) : {};
	} catch {
		return {};
	}
}
