import React, { useEffect, useState } from 'react';
import useAssignReviewModal from '@/hook/useAssignReviewModal';
import ConfirmModal from '@/components/ConfirmModal';
import NotificationModal from '@/components/NotificationModal';
import LoadingOverlay from '@/components/LoadingOverlay';
import ModalReject from '@/components/assing/ModalReject';

// Interface similar to ModalAssign's apprentice shape
interface ApprenticeData {
  name: string;
  type_identification: number;
  number_identification: string;
  file_number: string;
  date_start_production_stage?: string;
  program?: string;
  request_date?: string;
  request_id?: number;
  modality_productive_stage?: string;
}

interface AssignReviewModalProps {
  apprentice: ApprenticeData;
  isOpen: boolean;
  onClose: () => void;
  // callbacks invoked after a successful API call (no payload required)
  onApprove?: () => void;
  onReject?: () => void;
  // Optional initial data to avoid refetching when the parent already has details/messages
  initialDetail?: any;
  initialMessages?: any[];
}

export default function AssignReviewModal({ apprentice, isOpen, onClose, onApprove, onReject, initialDetail, initialMessages }: AssignReviewModalProps) {
  // coordinatorMessage comes from the hook; no local setter needed
  const [valuationMessage, setValuationMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<{ coordinator?: string; dates?: string; valuation?: string }>({});
  const { loading, fetchedDetail, coordinatorMessage, performAction, fetchDetails } = useAssignReviewModal(
    apprentice.request_id,
    isOpen,
    initialDetail,
    initialMessages
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'warning'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    // reset on open
    setValuationMessage('');
    setStartDate('');
    setEndDate('');
    setErrors({});

    // hook already fetches when isOpen/requestId change; fetchDetails is exposed for manual refresh if needed
    fetchDetails();
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAll = () => {
    const next: typeof errors = {};
    if (!startDate) next.dates = 'Fecha de inicio es obligatoria.';
    if (!endDate) next.dates = (next.dates ? next.dates + ' ' : '') + 'Fecha de fin es obligatoria.';
    if (startDate && endDate && endDate < startDate) next.dates = 'La fecha fin no puede ser anterior a la fecha inicio.';
    if (!valuationMessage.trim()) next.valuation = 'El mensaje de valoración es obligatorio.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleApprove = () => {
    if (!validateAll()) return;
    // open confirmation modal for approve
    setConfirmAction('approve');
    setConfirmOpen(true);
  };

  const handleReject = () => {
    // For rejection we open a dedicated modal to collect the rejection reason.
    // Do NOT require the 'Mensaje de valoración' here — that field is only required when approving.
    setErrors((prev) => {
      const next = { ...prev } as typeof errors;
      if ('valuation' in next) delete next.valuation;
      return next;
    });
    setShowRejectModal(true);
  };

  const performConfirmedAction = async () => {
    if (!confirmAction || !apprentice.request_id) return;
    setConfirmOpen(false);
    const currentAction = confirmAction; // Save current action before any state changes
    try {
      let payload: any = {};
      if (currentAction === 'approve') {
        payload = {
          type: 'APROBADO',
          content: valuationMessage,
          fecha_inicio_contrato: startDate || undefined,
          fecha_fin_contrato: endDate || undefined,
          request_state: 'PRE-APROBADO',
        };
      } else if (currentAction === 'reject') {
        payload = {
          type: 'RECHAZADO',
          content: valuationMessage,
          request_state: 'PRE-APROBADO',
        };
      }
      const result = await performAction(payload);
      if (result.success) {
        setNotifType('success');
        setNotifTitle(currentAction === 'approve' ? 'Aprobación enviada' : 'Rechazo enviado');
        setNotifMessage('La acción se envió correctamente.');
        setNotifOpen(true);
        // Keep confirmAction set so NotificationModal onClose can call the correct callback
        // confirmAction will be reset when the notification closes
      } else {
        setNotifType('warning');
        setNotifTitle('Error');
        setNotifMessage(result.error || 'Ocurrió un error al procesar la acción');
        setNotifOpen(true);
        setErrors((s) => ({ ...s, valuation: 'Error al enviar la solicitud. Intenta nuevamente.' }));
        // Reset confirmAction only on error so we don't trigger callbacks
        setConfirmAction(null);
      }
    } catch (err) {
      // Reset on exception
      setConfirmAction(null);
    }
  };

  // Handler passed to ModalReject: receives rejectionMessage and performs API call
  const handleRejectConfirm = async (rejectionMessage: string) => {
    // Log start of rejection flow
    if (!apprentice.request_id) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage('No se encontró el id de la solicitud. Intenta nuevamente.');
      setNotifOpen(true);
      return;
    }

    try {
      // Usar la estructura correcta que espera performAction del hook
      // Incluir request_state para mantener el estado en PRE-APROBADO durante la valoración
      const payload = {
        type: 'RECHAZADO' as const,
        content: rejectionMessage,
        request_state: 'PRE-APROBADO', // Mantener en PRE-APROBADO para que el coordinador pueda revisar
      };
      const result = await performAction(payload);
      // Close the reject modal only after the network call finished
      setShowRejectModal(false);
      if (result.success) {
        // Set confirmAction to 'reject' so the notification close handler can call onReject
        setConfirmAction('reject');
        setNotifType('success');
        setNotifTitle('Rechazo enviado');
        setNotifMessage('La solicitud fue rechazada correctamente.');
        setNotifOpen(true);
        // Don't call onReject/onClose here - let the NotificationModal onClose handler do it
      } else {
        setNotifType('warning');
        setNotifTitle('Error');
        setNotifMessage(result.error || 'Ocurrió un error al enviar el rechazo');
        setNotifOpen(true);
      }
    } finally {
      /* noop */
    }
  };

  const getFullName = () => {
    return apprentice.name || 'Sin nombre';
  };

  const formatDate = (d?: string) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return d;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <LoadingOverlay isOpen={loading} message="Enviando..." />
      <NotificationModal
        isOpen={notifOpen}
        onClose={() => {
          setNotifOpen(false);
          // Solo cerrar el modal principal y llamar callbacks si fue éxito
          if (notifType === 'success') {
            if (confirmAction === 'approve' && onApprove) onApprove();
            if (confirmAction === 'reject' && onReject) onReject();
            setConfirmAction(null); // Reset after calling callbacks
            onClose();
          } else {
            setConfirmAction(null); // Reset on error close as well
          }
        }}
        type={notifType === 'success' ? 'success' : 'warning'}
        title={notifTitle}
        message={notifMessage}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmAction === 'approve' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
        message={confirmAction === 'approve' ? '¿Deseas aprobar la solicitud?' : '¿Deseas rechazar la solicitud?'}
        confirmText={confirmAction === 'approve' ? 'Aprobar' : 'Rechazar'}
        cancelText={'Cancelar'}
        onConfirm={performConfirmedAction}
        onCancel={() => setConfirmOpen(false)}
        errorMessage={null}
      />
      {showRejectModal && (
        <ModalReject
          apprenticeName={apprentice.name}
          requestId={Number(apprentice.request_id || 0)}
          onClose={() => setShowRejectModal(false)}
          onConfirm={(msg) => handleRejectConfirm(msg)}
          title="Rechazo en valoración"
          description={`Dará un rechazo al hacer la valoración de seguimiento para ${apprentice.name}. Esta acción no se puede deshacer.`}
          reasonLabel="Motivo del rechazo (obligatorio)"
          reasonPlaceholder="Describe el motivo del rechazo"
          confirmText="Rechazar solicitud"
          cancelText="Cancelar"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="bg-white rounded-[10px] shadow-lg max-w-3xl w-full mx-4 p-6 relative z-10" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1-6.5 6.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Asignación - Revisión</h3>
            <p className="text-sm text-neutral-600">Revisa y completa la información requerida antes de aprobar o rechazar</p>
          </div>
        </div>

        {/* Apprentice info card */}
        <div className="border rounded-lg p-6 mb-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-full w-14 h-14 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#22c55e" viewBox="0 0 16 16">
                <path d="M8 0a5 5 0 100 10A5 5 0 008 0zM2 14s1-1 6-1 6 1 6 1v1H2v-1z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{getFullName()}</div>
              <div className="text-sm text-neutral-500 mt-1">Información del aprendiz</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-neutral-600">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6z"/>
              </svg>
              <div>
                <div className="font-medium">Identificación</div>
                <div className="text-neutral-500">{apprentice.number_identification || '-'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a2 2 0 100 4 2 2 0 000-4zM2 6a6 6 0 1112 0v2H2V6z"/>
              </svg>
                <div>
                <div className="font-medium">Tipo</div>
                <div className="text-neutral-500">{fetchedDetail?.tipo_identificacion_nombre ?? apprentice.type_identification ?? '-'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 2v2H2v9a1 1 0 001 1h10a1 1 0 001-1V4H10V2H6z"/>
              </svg>
              <div>
                <div className="font-medium">Ficha</div>
                <div className="text-neutral-500">{fetchedDetail?.numero_ficha || fetchedDetail?.ficha || apprentice.file_number || '-'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              <div>
                <div className="font-medium">Fecha de solicitud</div>
                <div className="text-neutral-500">{formatDate(apprentice.request_date) || '-'}</div>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <hr className="my-3" />
            </div>


            <div className="col-span-2 mt-4 text-center">
              <div className="font-medium">Programa</div>
              <div className="text-neutral-500">{fetchedDetail?.program || apprentice.program || '-'}</div>
            </div>

            <div className="col-span-2 mt-2 text-center">
              <div className="font-medium">Modalidad etapa práctica</div>
              <div className="text-neutral-500">{fetchedDetail?.modalidad_nombre || apprentice.modality_productive_stage || '-'}</div>
            </div>
          </div>
        </div>

        {/* Coordinator message (read-only, taken from request messages when available) */}
        <div className="mb-4">
          <label className="font-semibold">Mensaje del Coordinador</label>
          <div className="w-full mt-2 border rounded-lg p-3 text-sm bg-gray-50 text-neutral-700">
            {loading ? 'Cargando...' : (coordinatorMessage ? coordinatorMessage : 'No hay mensaje del coordinador')}
          </div>
        </div>

        {/* Dates */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Fechas de tipo de modalidad</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Fecha inicio</label>
              <input
                type="date"
                className="w-full mt-2 border rounded-lg p-2"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // if endDate exists and becomes earlier, clear endDate to force re-entry
                  if (endDate && e.target.value && endDate < e.target.value) setEndDate('');
                }}
              />
            </div>
            <div>
              <label className="text-sm">Fecha fin</label>
              <input
                type="date"
                className="w-full mt-2 border rounded-lg p-2"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {errors.dates && <div className="text-sm text-red-600 mt-2">{errors.dates}</div>}
        </div>

        {/* Valuation message */}
        <div className="mb-4">
          <label className="font-semibold">Mensaje de valoración</label>
          <textarea
            className="w-full mt-2 border rounded-lg p-3 text-sm"
            rows={4}
            value={valuationMessage}
            onChange={(e) => setValuationMessage(e.target.value)}
            placeholder="Escribe la valoración (obligatorio)"
          />
          {errors.valuation && <div className="text-sm text-red-600 mt-1">{errors.valuation}</div>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-between mt-4">
          <button
            className="bg-[#fb8383] border border-[#773939] text-white font-bold px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-[#fbbcbc]"
            onClick={handleReject}
          >
            Rechazar solicitud
          </button>

          <div className="flex items-center gap-3">
            <button className="bg-white border border-[#a39f9f] text-black font-bold px-6 py-2 rounded-[10px] hover:bg-gray-100" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="bg-[#7bcc7f] border border-[#c0fbcd] text-white font-bold px-4 py-2 rounded-[10px] hover:bg-[#a6e6ad] disabled:opacity-50"
              onClick={handleApprove}
            >
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
