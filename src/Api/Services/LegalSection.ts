import { ENDPOINTS } from "../config/ConfigApi";
import type { LegalSection } from "../types/entities/legalDocument.types";

// Gets the active sections of a legal document by id
export async function fetchSectionsByDocumentId(documentId: number): Promise<LegalSection[]> {
  try {
    const res = await fetch(ENDPOINTS.legalSection.allLegalSection);
    if (!res.ok) throw new Error('Error al obtener secciones legales');
    const sections: LegalSection[] = await res.json();
  // Filters by documentId and active
    return sections.filter((section) => section.active && section.document === documentId).sort((a, b) => a.order - b.order);
  } catch (e) {
    return [];
  }
}

// -------------------------
// CRUD methods for LegalSection
// -------------------------
export async function getAllLegalSections(): Promise<LegalSection[]> {
  const res = await fetch(ENDPOINTS.legalSection.allLegalSection);
  if (!res.ok) throw new Error('Error al obtener secciones legales');
  return res.json();
}

/**
 * Filters legal sections by search and active status.
 * Endpoint: GET /general/legal-sections/filter/?search=...&active=...
 */
export async function filterLegalSections(params?: { search?: string; active?: string }) {
  const url = new URL(ENDPOINTS.legalSection.filterLegalSection);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.active) url.searchParams.append('active', params.active);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Error al filtrar secciones legales');
  return res.json();
}

export async function createLegalSection(data: Partial<LegalSection>) {
  const res = await fetch(ENDPOINTS.legalSection.allLegalSection, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear sección legal');
  return res.json();
}

export async function updateLegalSection(id: number, data: Partial<LegalSection>) {
  const url = ENDPOINTS.legalSection.idLegalSection.replace('{id}', String(id));
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar sección legal');
  return res.json();
}

export async function softDeleteLegalSection(id: number) {
  const url = ENDPOINTS.legalSection.softDeleteLegalSection.replace('{id}', String(id));
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al deshabilitar sección legal');
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}

export default {};
