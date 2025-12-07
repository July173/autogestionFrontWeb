/**
 * Service for operations related to the Person entity.
 * Includes apprentice registration, retrieval, and update of person data.
 */
import {  RegisterResponse } from "../types/entities/user.types";
import { ENDPOINTS } from "../config/ConfigApi";
import { Person, RegisterPayload } from "../types/entities/person.types";

/**
 * Updates the profile image of a person.
 * @param id - ID of the person to update
 * @param imageFile - Image file (File)
 * @returns Promise with the updated Person object
 */
export async function patchPersonImage(id: string, imageFile: File): Promise<Person> {
  const url = ENDPOINTS.person.IdPerson.replace('{id}', id);
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch(url, {
    method: 'PATCH',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Error al actualizar la imagen');
  }
  return response.json();
}

/**
 * Gets the data of a person by their ID.
 * @param id - Person ID
 * @returns Promise with the Person object
 */
export async function getPersonById(id: string): Promise<Person> {
  const url = ENDPOINTS.person.IdPerson.replace('{id}', id);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error al obtener los datos de la persona");
  }
  return response.json();
}

/**
 * Registers a new apprentice in the system.
 * @param payload - Apprentice data to register
 * @returns Promise with the registration response (person and user)
 */
export async function registerApprentice(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await fetch(ENDPOINTS.person.registerApprentice, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    // Extract backend response for debugging
    const errorResponse = await response.text(); 
    // debugging
    throw new Error(errorResponse || "Error en el registro");
  }
  return response.json();
}

