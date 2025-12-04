
import { ENDPOINTS } from "../config/ConfigApi";
import type { SupportSchedule } from "../types/entities/support.types";

/**
 * Gets all support schedules.
 * Endpoint: GET /support/schedules/
 * @returns Promise with the array of support schedules
 */
export async function getAllSupportSchedules(): Promise<SupportSchedule[]> {
	const res = await fetch(ENDPOINTS.SupportSchedule.allSupportSchedule);
	if (!res.ok) throw new Error('Error al obtener los horarios de soporte');
	return res.json();
}

/**
 * Creates a new support schedule.
 * Endpoint: POST /support/schedules/
 * @param data - Support schedule data
 * @returns Promise with the created support schedule
 */
export async function createSupportSchedule(data: Partial<SupportSchedule>) {
	const res = await fetch(ENDPOINTS.SupportSchedule.allSupportSchedule, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const txt = await res.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(msg || `Error al crear el horario de soporte (${res.status})`);
		} catch (_err) {
			throw new Error(txt || `Error al crear el horario de soporte (${res.status})`);
		}
	}
	return res.json();
}

/**
 * Updates a support schedule.
 * Endpoint: PUT /support/schedules/{id}/
 * @param id - Support schedule ID to update
 * @param data - New support schedule data
 * @returns Promise with the updated support schedule
 */
export async function updateSupportSchedule(id: number, data: Partial<SupportSchedule>) {
	const url = ENDPOINTS.SupportSchedule.idSupportSchedule.replace('{id}', String(id));
	const res = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const txt = await res.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(msg || `Error al actualizar el horario de soporte (${res.status})`);
		} catch (_err) {
			throw new Error(txt || `Error al actualizar el horario de soporte (${res.status})`);
		}
	}
	return res.json();
}

/**
 * Disables (soft delete) a support schedule.
 * Endpoint: DELETE /support/schedules/{id}/soft-delete/
 * @param id - Support schedule ID to disable
 * @returns Promise with the API response
 */
export async function softDeleteSupportSchedule(id: number) {
	const url = ENDPOINTS.SupportSchedule.softDeleteSupportSchedule.replace('{id}', String(id));
	const res = await fetch(url, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) {
		const txt = await res.text();
		try {
			const parsed = txt ? JSON.parse(txt) : null;
			const msg = parsed && (parsed.detail || parsed.message || parsed.error) ? (parsed.detail || parsed.message || parsed.error) : null;
			throw new Error(msg || `Error al deshabilitar el horario de soporte (${res.status})`);
		} catch (_err) {
			throw new Error(txt || `Error al deshabilitar el horario de soporte (${res.status})`);
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
 * Filters support schedules by search text and active flag.
 * Endpoint: GET /support/schedules/filter/?search=...&active=...
 * @param params - Optional search and active params
 * @returns Promise with filtered array of support schedules
 */
export async function filterSupportSchedules(params?: { search?: string; active?: string }): Promise<SupportSchedule[]> {
    const url = new URL(ENDPOINTS.SupportSchedule.filterSupportSchedule, window.location.origin);
    if (params?.search) url.searchParams.append('search', params.search);
    if (params?.active) url.searchParams.append('active', params.active);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Error al filtrar los horarios de soporte');
    return res.json();
}
