import { useCallback, useEffect, useState } from 'react';
import { getFormRequestById, getRequestAsignationById, patchMessageRequest } from '@/Api/Services/RequestAssignaton';

interface PerformActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export default function useAssignReviewModal(
  requestId?: number,
  isOpen?: boolean,
  initialDetail?: any,
  initialMessages?: any[]
) {
  const [loading, setLoading] = useState(false);
  const [fetchedDetail, setFetchedDetail] = useState<any | null>(initialDetail ?? null);
  const [coordinatorMessage, setCoordinatorMessage] = useState<string>('');

  const fetchDetails = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      // If both initial detail and messages are provided, use them and avoid network calls
      if (initialDetail && Array.isArray(initialMessages)) {
        setFetchedDetail(initialDetail ?? null);
        const coord = initialMessages.find((m: any) => String(m.whose_message || '').toUpperCase() === 'COORDINADOR');
        setCoordinatorMessage(coord ? (coord.content || coord.message || '') : '');
        return;
      }

      // If we have only initialDetail, fetch messages/raw
      if (initialDetail && !initialMessages) {
        setFetchedDetail(initialDetail ?? null);
        const rawResp = await getRequestAsignationById(Number(requestId));
        const raw = rawResp?.data ?? rawResp ?? {};
        const messages = Array.isArray(raw?.messages) ? raw.messages : (raw?.messages || []);
        const coord = messages.find((m: any) => String(m.whose_message || '').toUpperCase() === 'COORDINADOR');
        setCoordinatorMessage(coord ? (coord.content || coord.message || '') : '');
        return;
      }

      // If we have only initialMessages, fetch form detail
      if (!initialDetail && Array.isArray(initialMessages)) {
        const formResp = await getFormRequestById(Number(requestId));
        setFetchedDetail(formResp?.data ?? null);
        const coord = initialMessages.find((m: any) => String(m.whose_message || '').toUpperCase() === 'COORDINADOR');
        setCoordinatorMessage(coord ? (coord.content || coord.message || '') : '');
        return;
      }

      // Fallback: fetch both
      const [formResp, rawResp] = await Promise.all([
        getFormRequestById(Number(requestId)),
        getRequestAsignationById(Number(requestId)),
      ]);
      setFetchedDetail(formResp?.data ?? null);

      const raw = rawResp?.data ?? rawResp ?? {};
      const messages = Array.isArray(raw?.messages) ? raw.messages : (raw?.messages || []);
      const coord = messages.find((m: any) => String(m.whose_message || '').toUpperCase() === 'COORDINADOR');
      setCoordinatorMessage(coord ? (coord.content || coord.message || '') : '');
    } catch (e) {
      console.error('Error fetching request detail in hook:', e);
      setFetchedDetail(null);
      setCoordinatorMessage('');
    } finally {
      setLoading(false);
    }
  }, [requestId, initialDetail, initialMessages]);

  useEffect(() => {
    if (!isOpen) return;
    // fetch when modal opens and requestId available
    fetchDetails();
  }, [isOpen, fetchDetails]);

  const performAction = useCallback(async (opts: { type: 'APROBADO' | 'RECHAZADO'; content: string; fecha_inicio_contrato?: string; fecha_fin_contrato?: string; request_state?: string; }) : Promise<PerformActionResult> => {
    if (!requestId) return { success: false, error: 'No request id' };
    setLoading(true);
    try {
      // Map internal action type to backend-expected type_message values
      // RECHAZADO se mantiene como RECHAZADO, APROBADO como APROBADA
      let mappedType = opts.type;
      if (opts.type === 'APROBADO') mappedType = 'APROBADA';
      // opts.type === 'RECHAZADO' se mantiene como 'RECHAZADO'

      const payload: any = {
        content: opts.content,
        type_message: mappedType,
        whose_message: 'INSTRUCTOR',
      };
      if (opts.fecha_inicio_contrato) payload.fecha_inicio_contrato = opts.fecha_inicio_contrato;
      if (opts.fecha_fin_contrato) payload.fecha_fin_contrato = opts.fecha_fin_contrato;

      // Include request_state if provided, otherwise default to PRE-APROBADO for approval
      if (opts.request_state) {
        payload.request_state = opts.request_state;
      } else if (opts.type === 'APROBADO') {
        payload.request_state = 'PRE-APROBADO';
      }

      const resp = await patchMessageRequest(Number(requestId), payload);
      try {
        console.log('[useAssignReviewModal] patch response (string)', JSON.stringify(resp));
      } catch (e) {
        /* ignore stringify errors */
      }

      // Refresh details after the update so UI can pick up any new messages.
      try {
        await fetchDetails();
        console.log('[useAssignReviewModal] fetchDetails called after patch');
      } catch (fetchErr) {
        console.warn('[useAssignReviewModal] fetchDetails failed after patch', fetchErr);
      }

      return { success: true, data: resp };
    } catch (e: any) {
      console.error('Error performing action in hook:', e);
      return { success: false, error: e?.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  return {
    loading,
    fetchedDetail,
    coordinatorMessage,
    fetchDetails,
    performAction,
  };
}
