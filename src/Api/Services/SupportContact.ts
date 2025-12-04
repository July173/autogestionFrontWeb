
import { ENDPOINTS } from "../config/ConfigApi";
import type { SupportContact } from "../types/entities/support.types";

/**
 * Gets all support contacts.
 * Endpoint: GET /support/contacts/
 * @returns Promise with the array of support contacts
 */
export async function getAllSupportContacts(): Promise<SupportContact[]> {
	const res = await fetch(ENDPOINTS.SupportContact.allSupportContact);
	if (!res.ok) throw new Error('Error al obtener contactos de soporte');
	return res.json();
}

/**
 * Creates a support contact.
 * Endpoint: POST /support/contacts/
 * @param data - Support contact data
 * @returns Promise with the created support contact
 */
export async function createSupportContact(data: Partial<SupportContact>) {
	const payload: Partial<SupportContact> = { ...(data || {}) };
	if (payload.extra_info === undefined || payload.extra_info === null) payload.extra_info = '';
	const res = await fetch(ENDPOINTS.SupportContact.allSupportContact, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const txt = await res.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(msg || `Error al crear el contacto de soporte (${res.status})`);
		} catch (_err) {
			throw new Error(txt || `Error al crear el contacto de soporte (${res.status})`);
		}
	}
	return res.json();
}

/**
 * Updates a support contact.
 * Endpoint: PUT /support/contacts/{id}/
 * @param id - Support contact ID to update
 * @param data - New support contact data
 * @returns Promise with the updated support contact
 */
export async function updateSupportContact(id: number, data: Partial<SupportContact>) {
	const url = ENDPOINTS.SupportContact.idSupportContact.replace('{id}', String(id));
	const payload: Partial<SupportContact> = { ...(data || {}) };
	if (payload.extra_info === undefined || payload.extra_info === null) payload.extra_info = '';
	const res = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const txt = await res.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(msg || `Error al actualizar el contacto de soporte (${res.status})`);
		} catch (_err) {
			throw new Error(txt || `Error al actualizar el contacto de soporte (${res.status})`);
		}
	}
	return res.json();
}

/**
 * Disables (soft delete) a support contact.
 * Endpoint: DELETE /support/contacts/{id}/soft-delete/
 * @param id - Support contact ID to disable
 * @returns Promise with the API response
 */
export async function softDeleteSupportContact(id: number) {
	const url = ENDPOINTS.SupportContact.softDeleteSupportContact.replace('{id}', String(id));
	const res = await fetch(url, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) {
		const txt = await res.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(msg || `Error al deshabilitar el contacto de soporte (${res.status})`);
		} catch (_err) {
			throw new Error(txt || `Error al deshabilitar el contacto de soporte (${res.status})`);
		}
	}
	const text = await res.text();
	try {
		return text ? JSON.parse(text) : {};
	} catch {
		return {};
	}
}

/**
 * Filters support contacts by search text and active flag.
 * Endpoint: GET /support/contacts/filter/?search=...&active=...
 * @param params - Optional search and active params
 * @returns Promise with filtered array of support contacts
 */
export async function filterSupportContacts(params?: { search?: string; active?: string }): Promise<SupportContact[]> {
    const url = new URL(ENDPOINTS.SupportContact.filterSupportContact, window.location.origin);
    if (params?.search) url.searchParams.append('search', params.search);
    if (params?.active) url.searchParams.append('active', params.active);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Error al filtrar los contactos de soporte');
    return res.json();
}

