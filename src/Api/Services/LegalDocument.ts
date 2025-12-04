import { ENDPOINTS } from "../config/ConfigApi";
import type { LegalDocument, LegalSection } from "../types/entities/legalDocument.types";

// Gets the active legal document of type "privacy"
export async function fetchActivePrivacyDocument(): Promise<LegalDocument | null> {
	try {
		const res = await fetch(ENDPOINTS.legalDocument.allLegalDocument);
		const docs: LegalDocument[] = await res.json();
		return docs.find(doc => doc.type === "privacy" && doc.active) || null;
	} catch (e) {
		return null;
	}
}

// Gets the active legal document of type "terms"
export async function fetchActiveTermsDocument(): Promise<LegalDocument | null> {
	try {
		const res = await fetch(ENDPOINTS.legalDocument.allLegalDocument);
		const docs: LegalDocument[] = await res.json();
		return docs.find(doc => doc.type === "terms" && doc.active) || null;
	} catch (e) {
		return null;
	}
}

// Note: operations on sections are exposed from `LegalSection.ts`

// -------------------------
// CRUD methods for LegalDocument
// -------------------------
export async function getAllLegalDocuments(): Promise<LegalDocument[]> {
	const res = await fetch(ENDPOINTS.legalDocument.allLegalDocument);
	if (!res.ok) throw new Error('Error al obtener documentos legales');
	return res.json();
}

/**
 * Filters legal documents by search and active status.
 * Endpoint: GET /general/legal-documents/filter/?search=...&active=...
 */
export async function filterLegalDocuments(params?: { search?: string; active?: string }) {
	const url = new URL(ENDPOINTS.legalDocument.filterLegalDocument);
	if (params?.search) url.searchParams.append('search', params.search);
	if (params?.active) url.searchParams.append('active', params.active);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error('Error al filtrar documentos legales');
	return res.json();
}

export async function getLegalDocumentById(id: number) {
	const url = ENDPOINTS.legalDocument.idLegalDocument.replace('{id}', String(id));
	const res = await fetch(url);
	if (!res.ok) throw new Error('Error al obtener documento legal');
	return res.json();
}

export async function createLegalDocument(data: Partial<LegalDocument>) {
	const res = await fetch(ENDPOINTS.legalDocument.allLegalDocument, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error('Error al crear documento legal');
	return res.json();
}

export async function updateLegalDocument(id: number, data: Partial<LegalDocument>) {
	const url = ENDPOINTS.legalDocument.idLegalDocument.replace('{id}', String(id));
	const res = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error('Error al actualizar documento legal');
	return res.json();
}

export async function softDeleteLegalDocument(id: number) {
	const url = ENDPOINTS.legalDocument.softDeleteLegalDocument.replace('{id}', String(id));
	const res = await fetch(url, { method: 'DELETE' });
	if (!res.ok) throw new Error('Error al deshabilitar documento legal');
	const text = await res.text();
	try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}
// re-export of section functions for compatibility
export { fetchSectionsByDocumentId, getAllLegalSections, createLegalSection, updateLegalSection, softDeleteLegalSection } from './LegalSection';
