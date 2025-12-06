import React, { useState, useEffect } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import NotificationModal from '@/components/NotificationModal';
import ConfirmModal from '@/components/ConfirmModal';
import ModalReject from './ModalReject';
import { patchMessageRequest, getRequestMessages, rejectRequest } from '@/Api/Services/RequestAssignaton';
import type { RequestMessage } from '@/Api/types/Modules/assign.types';

interface ApprenticeData {
  name: string;
  type_identification: number;
  number_identification: string;
  file_number: string;
  date_start_production_stage: string;
  program: string;
  request_date: string;
  request_id?: number;
  modality_productive_stage?: string;
}

interface ModalPreApproveProps {
  apprentice: ApprenticeData;
  onClose: () => void;
  onAssignmentComplete?: () => void;
  assignedInstructor?: any | null;
  initialMessages?: any[];
}

export default function ModalPreApprove({ apprentice, onClose, onAssignmentComplete, assignedInstructor = null, initialMessages = [] }: ModalPreApproveProps) {
  const [assigning, setAssigning] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmApproveModal, setShowConfirmApproveModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<'success' | 'warning'>('success');
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [instructor, setInstructor] = useState<any>(null);
  const [loadingInstructor, setLoadingInstructor] = useState(false);
  const MAX_MESSAGE_LENGTH = 500;

  const requestAsignationId = apprentice.request_id ?? null;

  // Cargar los mensajes y el instructor al abrir el modal
  useEffect(() => {
    const loadData = async () => {
      if (!requestAsignationId) return;
      
      // Cargar mensajes
      setLoadingMessages(true);
      try {
        const result = await getRequestMessages(requestAsignationId);
        if (result.success && result.data) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      } finally {
        setLoadingMessages(false);
      }
      
      // Cargar instructor desde form-request-list
      setLoadingInstructor(true);
      try {
        const { getAllRequests } = await import('@/Api/Services/RequestAssignaton');
        const requests = await getAllRequests();
        // Buscar la solicitud con el ID correspondiente
        const currentRequest = requests.find(req => req.id === requestAsignationId);
        if (currentRequest && currentRequest.instructor) {
          setInstructor({
            name: currentRequest.instructor,
            id: currentRequest.instructor_id
          });
        }
      } catch (error) {
        console.error('Error al cargar instructor:', error);
      } finally {
        setLoadingInstructor(false);
      }
    };
    loadData();
  }, [requestAsignationId]);

  // Verificar si existe un mensaje del instructor con tipo RECHAZADO
  const hasInstructorRejection = messages.some((m) => {
    const whoseMsg = String(m.whose_message || '').toUpperCase();
    const typeMsg = String(m.type_message || '').toUpperCase();
    return whoseMsg === 'INSTRUCTOR' && typeMsg.includes('RECHAZAD');
  });

  const handleApprove = () => {
    if (!message || !message.trim()) {
      setMessageError('El mensaje es obligatorio');
      return;
    }
    // Abrir modal de confirmación
    setShowConfirmApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!requestAsignationId) return;
    setShowConfirmApproveModal(false);
    setAssigning(true);
    try {
      const payload: any = {
        content: message,
        type_message: 'ASIGNADO',
        whose_message: 'COORDINADOR',
        request_state: 'ASIGNADO',
      };
      if (apprentice.date_start_production_stage) payload.fecha_inicio_contrato = apprentice.date_start_production_stage;
      if ((apprentice as any).date_end_production_stage) payload.fecha_fin_contrato = (apprentice as any).date_end_production_stage;

      const resp = await patchMessageRequest(requestAsignationId, payload);
      // Try to extract message
      let msg = 'Se ha llevado a cabo con éxito tu solicitud.';
      let t: 'success' | 'warning' = 'success';
      try {
        const maybe = (resp as { data?: unknown }).data;
        const rawData = maybe ?? resp;
        if (rawData && typeof rawData === 'object') {
          const d = rawData as Record<string, unknown>;
          const statusVal = typeof d.status === 'string' ? d.status.toLowerCase() : undefined;
          if (statusVal === 'error') {
            t = 'warning';
            if (typeof d.detail === 'string') msg = d.detail;
            else if (typeof d.message === 'string') msg = d.message as string;
          } else if (typeof d.detail === 'string') msg = d.detail;
        }
      } catch (e) { }

      setResultType(t);
      setResultMessage(msg);
      setShowResultModal(true);
    } catch (err) {
      console.error('Error aprobar pre-approve:', err);
      setResultType('warning');
      setResultMessage('Error al procesar la aprobación');
      setShowResultModal(true);
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmReject = async (rejectionMessage: string) => {
    if (!requestAsignationId) return;
    setAssigning(true);
    try {
      // Usar el endpoint rejectRequest (igual que ModalAssign con ModalReject)
      await rejectRequest(requestAsignationId, rejectionMessage);
      setResultType('success');
      setResultMessage('Solicitud rechazada correctamente.');
      setShowResultModal(true);
    } catch (err) {
      console.error('Error rechazar pre-approve:', err);
      setResultType('warning');
      setResultMessage('Error al procesar el rechazo');
      setShowResultModal(true);
    } finally {
      setAssigning(false);
      setShowRejectModal(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <LoadingOverlay isOpen={assigning} message={assigning ? 'Procesando...' : undefined} zIndex={1000} />
        <div className="absolute inset-0 bg-black bg-opacity-40" style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()} />
        <div className="bg-white rounded-[10px] shadow-lg max-w-2xl w-full mx-4 p-6 relative flex flex-col gap-6 z-10" style={{ pointerEvents: 'auto', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">Pre-Aprobación — Aprobar/Rechazar</h3>
              <p className="text-sm text-neutral-600">Revisa la información y aprueba o rechaza la solicitud</p>
            </div>
          </div>

          {/* Apprentice card */}
          <div className="border rounded-lg p-5 flex flex-col gap-2 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-200/90 rounded-full w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#22c55e" viewBox="0 0 16 16">
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
                </svg>
              </div>
              <div>
                <div className="text-black text-2xl font-semibold font-['Roboto'] leading-loose">{apprentice.name}</div>
                <div className="text-neutral-500 text-base font-normal font-['Roboto'] leading-loose text-left">Información del aprendiz</div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="grid grid-cols-2 gap-x-20 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                  </svg>
                  <span className="text-neutral-500">Identificación:</span>
                  <span className="text-black font-medium">{apprentice.number_identification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                    <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
                  </svg>
                  <span className="text-neutral-500">Ficha:</span>
                  <span className="text-black font-medium">{apprentice.file_number}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                  </svg>
                  <span className="text-neutral-500">Fecha de solitud:</span>
                  <span className="text-black font-medium">{apprentice.date_start_production_stage}</span>
                </div>
              </div>
            </div>

            <hr className="my-2 border-t border-gray-200" />
            <div className="text-stone-500 text-base font-medium font-['Roboto'] leading-loose mt-1">
              Programa: <span className="text-neutral-500 font-normal">{apprentice.program}</span>
            </div>
          </div>

          {/* Assigned instructor */}
          <div>
            <label className="text-lg font-semibold text-black mb-2 block">Instructor Asignado</label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center gap-3">
              {loadingInstructor ? (
                <>
                  <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#9ca3af" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                  </div>
                  <div className="text-neutral-500">Cargando instructor...</div>
                </>
              ) : instructor ? (
                <>
                  <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#22c55e" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                  </div>
                  <div className="text-black font-medium">{instructor.name || 'Sin nombre'}</div>
                </>
              ) : (
                <>
                  <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#9ca3af" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                  </div>
                  <div className="text-neutral-500 italic">No hay instructor asignado</div>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div>
            <label className="text-lg font-semibold text-black mb-2 block">Historial de Mensajes</label>
            {loadingMessages ? (
              <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-600">
                <div className="animate-pulse">Cargando mensajes...</div>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
                <div className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <div key={m.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#22c55e" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">{m.whose_message || 'Sistema'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-medium">{m.type_message}</span>
                      </div>
                      <div className="text-gray-700 text-sm ml-10">{m.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#9ca3af" className="mx-auto mb-2" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894m-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                </svg>
                <div className="text-gray-500">No hay mensajes para esta solicitud</div>
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="mt-4 flex flex-col items-start">
            <label className="text-black font-medium font-['Roboto'] mb-2 w-full text-left">Mensaje de Aprobación*</label>
            <textarea
              value={message}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length > MAX_MESSAGE_LENGTH) {
                  setMessage(v.slice(0, MAX_MESSAGE_LENGTH));
                  setMessageError(`Máximo ${MAX_MESSAGE_LENGTH} caracteres`);
                } else {
                  setMessage(v);
                  if (messageError && messageError.startsWith('Máximo')) setMessageError('');
                }
              }}
              placeholder="Escribe un mensaje para aprobar la solicitud..."
              rows={3}
              className="w-full mt-2 border rounded-lg p-3 text-sm font-['Roboto']"
            />
            <div className="w-full flex justify-between items-center">
              <div />
              <div className="text-sm mt-2">
                <span className={message.length >= MAX_MESSAGE_LENGTH ? 'text-red-600' : 'text-neutral-500'}>
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>
            {messageError && <div className="text-sm text-red-600 mt-2">{messageError}</div>}
            {hasInstructorRejection && (
              <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#dc2626" viewBox="0 0 16 16" className="flex-shrink-0 mt-0.5">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                </svg>
                <div className="text-sm text-red-700">
                  <span className="font-semibold">No se puede aprobar:</span> El instructor ha rechazado esta solicitud.
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-4 justify-start mt-4">
            <button
              className="bg-[#fb8383] border border-[#773939] text-[#ffffff] font-bold px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-[#fbbcbc]"
              onClick={() => setShowRejectModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffff" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
              Rechazar solicitud
            </button>
            <div className="flex-1" />
            <button
              className="bg-white border border-[#a39f9f] text-black font-bold px-6 py-2 rounded-[10px] flex items-center gap-2 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="bg-[#7bcc7f] border border-[#c0fbcd] text-[#ffffff] font-bold px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-[#a6e6ad] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApprove}
              disabled={assigning || !message || !message.trim() || hasInstructorRejection}
              title={hasInstructorRejection ? 'No se puede aprobar porque el instructor ha rechazado la solicitud' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
              </svg>
              {assigning ? 'Aprobando...' : 'Aprobar Solicitud'}
            </button>
          </div>
        </div>
      </div>

      {showRejectModal && requestAsignationId && (
        <ModalReject apprenticeName={apprentice.name} requestId={requestAsignationId} onClose={() => setShowRejectModal(false)} onConfirm={handleConfirmReject} />
      )}

      <ConfirmModal
        isOpen={showConfirmApproveModal}
        title="Confirmar aprobación"
        message="¿Estás seguro de que deseas aprobar esta solicitud?"
        confirmText="Sí, aprobar"
        cancelText="Cancelar"
        onConfirm={handleConfirmApprove}
        onCancel={() => setShowConfirmApproveModal(false)}
        zIndex={60}
      />

      {showResultModal && (
        <NotificationModal isOpen={showResultModal} onClose={() => { setShowResultModal(false); onAssignmentComplete?.(); onClose(); }} type={resultType} title={resultType === 'success' ? 'Acción completada' : 'Error'} message={resultMessage} />
      )}
    </>
  );
}
