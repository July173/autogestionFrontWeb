import { ENDPOINTS } from "../config/ConfigApi";


/**
 * Gets document types with an empty option by default for selects.
 * Endpoint: GET /general/document-types/
 * @returns Promise<{ id: number | ""; name: string }[]> - List of document types with empty option
 */
export async function getDocumentTypesWithEmpty(): Promise<{ id: number | ""; name: string }[]> {
  try {
    const documentTypes = await getDocumentTypes();
    return [
      ...documentTypes.map((doc: any) => ({ id: doc.id ?? doc.ID ?? doc.typeId, name: doc.name ?? doc.typeName }))
    ];
  } catch (error) {
    console.error('Error obteniendo tipos de documento:', error);
    return [
      { id: "", name: "Seleccione tipo de documento" } // Select document type
    ];
  }
}

/**
 * Gets a document type by its id.
 * Endpoint: GET /general/document-types/{id}/
 * @param id number - Document type id
 * @returns Promise<DocumentType>
 */
export async function getDocumentTypeById(id: number): Promise<DocumentType> {
  const response = await fetch(ENDPOINTS.documentType.idDocumentType.replace("{id}", String(id)), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error al obtener el tipo de documento");
  }
  return response.json();
}

/**
 * Gets all document types.
 * Endpoint: GET /general/document-types/
 * @returns Promise with the array of document types
 */
export async function getDocumentTypes() {
  const response = await fetch(ENDPOINTS.documentType.allDocumentType);
  if (!response.ok) throw new Error("Error al obtener los tipos de documento");
  return response.json();
}

/**
 * Filters document types by search and active status.
 * Endpoint: GET /security/document-types/filter/?search=...&active=...
 * @param params - Optional search and active params
 */
export async function filterDocumentTypes(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.documentType.filterDocumentType);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.active) url.searchParams.append('active', params.active);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Error al filtrar tipos de documento');
  return response.json();
}

/**
 * Creates a document type.
 * Endpoint: POST /general/document-types/
 * @param data - Document type data
 * @returns Promise with the created document type
 */
export async function createDocumentType(data) {
  const response = await fetch(ENDPOINTS.documentType.allDocumentType, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al crear el tipo de documento");
  return response.json();
}

/**
 * Updates a document type.
 * Endpoint: PUT /general/document-types/{id}/
 * @param id - Document type ID to update
 * @param data - New document type data
 * @returns Promise with the updated document type
 */
export async function updateDocumentType(id, data) {
  const url = ENDPOINTS.documentType.idDocumentType.replace("{id}", String(id));
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al actualizar el tipo de documento");
  return response.json();
}

/**
 * Disables (soft delete) a document type.
 * Endpoint: DELETE /general/document-types/{id}/soft-delete/
 * @param id - Document type ID to disable
 * @returns Promise with the API response
 */
export async function softDeleteDocumentType(id) {
  const url = ENDPOINTS.documentType.softDelete.replace("{id}", String(id));
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Error al deshabilitar el tipo de documento");
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}