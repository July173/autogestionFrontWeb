
import { ENDPOINTS } from '../config/ConfigApi';
import { CreateApprentice} from '../types/entities/apprentice.types';

/**
 * Gets apprentices filtered by person ID.
 * @param personId - Person ID
 * @returns Promise with the array of apprentices
 */

export async function getApprenticesByPerson(personId: string | number) {
  const baseUrl = ENDPOINTS.apprentice.getAllApprentices;
  // If the URL already has parameters, add with &
  const url = baseUrl.includes('?')
    ? `${baseUrl}&person=${personId}`
    : `${baseUrl}?person=${personId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener aprendices por persona');
  return response.json();
}
/**
 * Service for operations related to the Apprentice entity.
 * Includes retrieval, registration, update, and query by ID.
 */

/**
 * Gets the list of all apprentices.
 * @returns Promise with the array of apprentices
 */
export async function getApprentices() {
  const response = await fetch(ENDPOINTS.apprentice.getAllApprentices);
  if (!response.ok) throw new Error('Error al obtener aprendices');
  return response.json();
}

/**
 * Registers a new apprentice in the system.
 * @param data - Apprentice data to register
 * @returns Promise with the API response
 */
export async function postApprentice(data: CreateApprentice) {
  const response = await fetch(ENDPOINTS.apprentice.allApprentices, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al registrar aprendiz, Verifique los datos e intente nuevamente, recuerda el numero de docuemento y numero de telefono deben llevar maximo 10 digitos   ');
  return response.json();
}

/**
 * Updates the data of an existing apprentice.
 * @param id - Apprentice ID
 * @param data - Updated apprentice data
 * @returns Promise with the API response
 */
export async function putApprentice(id: string, data: CreateApprentice) {
  const url = ENDPOINTS.apprentice.putIdApprentice.replace('{id}', id);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
 // Try to parse JSON body so caller can inspect server validation errors
  let respJson: unknown = null;
  try {
    respJson = await response.json();
  } catch (e) {
    // ignore parse errors
  }
  if (!response.ok) {
    // Throw an Error but attach the parsed response so callers can extract backend messages
  const err = new Error('Error al actualizar aprendiz') as Error & { response?: { data?: unknown; status?: number } };
  err.response = { data: respJson, status: response.status };
  throw err;
  }
  return respJson;
}


/**
 * Gets a single apprentice by person id.
 * Uses the existing filtered endpoint and returns the first match or null.
 * @param personId - Person ID to look up
 */
export async function getApprenticeById(personId: string | number) {
  const apprentices = await getApprenticesByPerson(personId);
  if (Array.isArray(apprentices) && apprentices.length > 0) return apprentices[0];
  return null;
}

