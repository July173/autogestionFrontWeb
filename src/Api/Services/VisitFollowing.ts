import { ENDPOINTS } from '@/Api/config/ConfigApi';
import { UpdateVisitPayload } from '@/Api/types/Modules/assign.types';

/**
 * Update visit information (excluding PDF)
 * @param visitId - ID of the visit
 * @param payload - Data to update
 * @returns Promise with response
 */
export async function updateVisit(visitId: number, payload: UpdateVisitPayload) {
  const url = ENDPOINTS.VisitFollowing.PatchExluding.replace('{id}', String(visitId));
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(txt || 'Error al actualizar la visita');
  }

  return response.json();
}

/**
 * Upload PDF report for a visit
 * @param visitId - ID of the visit
 * @param pdfFile - PDF file to upload
 * @returns Promise with response
 */
export async function uploadVisitPdf(visitId: number, pdfFile: File) {
  const url = ENDPOINTS.VisitFollowing.PatchPdf.replace('{id}', String(visitId));
  const formData = new FormData();
  formData.append('pdf_report', pdfFile);

  const response = await fetch(url, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(txt || 'Error al subir el PDF');
  }

  return response.json();
}

export default { updateVisit, uploadVisitPdf };

