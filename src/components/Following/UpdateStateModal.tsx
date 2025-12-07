import React, { useEffect, useState } from 'react';
import { getVisitsByAsignation } from '@/Api/Services/AssignationInstructor';
import { updateVisit, uploadVisitPdf } from '@/Api/Services/VisitFollowing';
import { VisitFollowing } from '@/Api/types/Modules/assign.types';
import ConfirmModal from '@/components/ConfirmModal';
import LoadingOverlay from '@/components/LoadingOverlay';
import NotificationModal from '@/components/NotificationModal';
import { Calendar, FileText } from 'lucide-react';

interface UpdateStateModalProps {
  apprenticeData: {
    name: string;
    number_identification: string;
    tipo_identificacion?: string;
    file_number?: string;
    request_date?: string;
    date_start_production_stage?: string;
    program?: string;
    modalidad?: string;
  };
  asignationInstructorId: number;
  currentState: string; // state_asignation actual
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateStateModal: React.FC<UpdateStateModalProps> = ({
  apprenticeData,
  asignationInstructorId,
  currentState,
  onClose,
  onSuccess,
}) => {
  const [visits, setVisits] = useState<VisitFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'warning';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const MAX_OBSERVATIONS_LENGTH = 500;

  // Determinar el siguiente estado disponible
  const getNextState = () => {
    if (!currentState || currentState === '') return 'Concertación';
    if (currentState === 'Concertación') return 'Visita parcial';
    if (currentState === 'Visita parcial') return 'Visita final';
    return '';
  };

  const nextState = getNextState();

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        const response = await getVisitsByAsignation(asignationInstructorId);
        if (response.success && response.visits) {
          setVisits(response.visits);
          // Preseleccionar el siguiente estado
          setSelectedState(nextState);
        }
      } catch (error) {
        console.error('Error al cargar visitas:', error);
        setNotification({
          show: true,
          type: 'warning',
          title: 'Error',
          message: 'No se pudieron cargar las visitas.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [asignationInstructorId]);

  // Obtener la fecha recomendada según el estado seleccionado
  const getRecommendedDate = (stateName: string) => {
    const visit = visits.find((v) =>
      v.name_visit.toLowerCase().includes(stateName.toLowerCase())
    );
    return visit?.scheduled_date || '';
  };

  // Obtener el ID de la visita según el estado seleccionado
  const getVisitId = (stateName: string) => {
    const visit = visits.find((v) =>
      v.name_visit.toLowerCase().includes(stateName.toLowerCase())
    );
    return visit?.id || null;
  };

  const handleSubmit = async () => {
    if (!selectedState) {
      setNotification({
        show: true,
        type: 'warning',
        title: 'Campo requerido',
        message: 'Debe seleccionar un estado.',
      });
      return;
    }

    if (!observations.trim()) {
      setNotification({
        show: true,
        type: 'warning',
        title: 'Campo requerido',
        message: 'El comentario es obligatorio.',
      });
      return;
    }

    // Si el estado actual es Visita parcial y va a cambiar a Visita final, requiere PDF
    if (currentState === 'Visita parcial' && selectedState === 'Visita final' && !pdfFile) {
      setNotification({
        show: true,
        type: 'warning',
        title: 'PDF requerido',
        message: 'Debe adjuntar un archivo PDF para la visita final.',
      });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setSubmitting(true);

    try {
      const visitId = getVisitId(selectedState);
      if (!visitId) {
        throw new Error('No se encontró el ID de la visita');
      }

      // 1. Actualizar la visita (info)
      const today = new Date().toISOString().split('T')[0];
      await updateVisit(visitId, {
        observations,
        state_visit: 'hecho',
        date_visit_made: today,
        state_asignation: selectedState,
      });

      // 2. Si hay PDF, subirlo (solo cuando se pasa de Visita parcial a Visita final)
      if (pdfFile && currentState === 'Visita parcial' && selectedState === 'Visita final') {
        await uploadVisitPdf(visitId, pdfFile);
      }

      setNotification({
        show: true,
        type: 'success',
        title: 'Acción completada',
        message: 'El estado del seguimiento se actualizó correctamente.',
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      setNotification({
        show: true,
        type: 'warning',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Ocurrió un error al actualizar.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStateColor = (state: string) => {
    if (!state || state === '') return 'bg-orange-300 text-white';
    if (state === 'Concertación') return 'bg-purple-500 text-white';
    if (state === 'Visita parcial') return 'bg-orange-600 text-white';
    if (state === 'Visita final') return 'bg-yellow-500 text-white';
    return 'bg-gray-400 text-white';
  };

  const getStateLabel = (state: string) => {
    if (!state || state === '') return 'Asignado';
    return state;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <LoadingOverlay isOpen={submitting} message="Actualizando estado..." zIndex={1000} />
        
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-40"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Modal */}
        <div
          className="bg-white rounded-[10px] shadow-lg max-w-2xl w-full mx-4 p-6 relative flex flex-col gap-6 z-10"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#22c55e" className="bi bi-pencil-square" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
              <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
            </svg>
            <div>
              <div className="text-black text-2xl font-extrabold font-['Roboto'] leading-loose text-left">
                Actualizar estado del proceso
              </div>
              <div className="text-black text-base font-normal font-['Roboto'] leading-loose">
                Actualiza el estado del seguimiento
              </div>
            </div>
          </div>

          {/* Botón de historial */}
          <button
            className="absolute top-6 right-6 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-[10px] text-sm font-semibold text-gray-700"
            onClick={() => setShowHistory(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
            </svg>
            Historial 1
          </button>

          {/* Apprentice card */}
          <div className="border rounded-lg p-5 flex flex-col gap-2 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-200/90 rounded-full w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#22c55e" className="bi bi-mortarboard" viewBox="0 0 16 16">
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-black text-2xl font-semibold font-['Roboto'] leading-loose truncate">
                  {apprenticeData.name}
                </div>
                <div className="text-neutral-500 text-base font-normal font-['Roboto'] leading-loose text-left">
                  Información del aprendiz
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
                <span className="text-neutral-500">Identificación:</span>
                <span className="text-black font-medium truncate">{apprenticeData.number_identification}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                </svg>
                <span className="text-neutral-500">Tipo:</span>
                <span className="text-black font-medium truncate">{apprenticeData.tipo_identificacion || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
                </svg>
                <span className="text-neutral-500">Ficha:</span>
                <span className="text-black font-medium truncate">{apprenticeData.file_number || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4" />
                <span className="text-neutral-500">Fecha de solicitud:</span>
                <span className="text-black font-medium truncate">{apprenticeData.request_date || 'N/A'}</span>
              </div>
              
            </div>
            <hr className="my-2 border-t border-gray-200" />
            <div className="text-stone-500 text-base font-medium font-['Roboto'] leading-loose mt-1">
              Programa: <span className="text-neutral-500 font-normal truncate">{apprenticeData.program || 'N/A'}</span>
            </div>
          </div>

          {/* Current state */}
          <div className="flex flex-col gap-2">
            <div className="text-black text-lg font-semibold">Estado actual:</div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full ${getStateColor(currentState)} font-medium flex items-center gap-2`}>
                <FileText className="w-4 h-4" />
                {getStateLabel(currentState)}
              </div>
            </div>
          </div>

          {/* State selector */}
          <div className="flex flex-col gap-2">
            <label className="text-black font-semibold">Seleccionar un nuevo estado</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-base"
            >
              <option value="">Selecciona el nuevo estado</option>
              <option value="Concertación" disabled={nextState !== 'Concertación'}>
                Concertación{nextState !== 'Concertación' ? ' (No disponible)' : ''}
              </option>
              <option value="Visita parcial" disabled={nextState !== 'Visita parcial'}>
                Visita parcial{nextState !== 'Visita parcial' ? ' (No disponible)' : ''}
              </option>
              <option value="Visita final" disabled={nextState !== 'Visita final'}>
                Visita final{nextState !== 'Visita final' ? ' (No disponible)' : ''}
              </option>
            </select>
            {selectedState && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha recomendada: <span className="font-semibold">{getRecommendedDate(selectedState) || 'No disponible'}</span>
              </div>
            )}
          </div>

          {/* Observations */}
          <div className="flex flex-col gap-2">
            <label className="text-black font-semibold">Comentario*</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value.slice(0, MAX_OBSERVATIONS_LENGTH))}
              placeholder="Agrega un comentario sobre el cambio de estado opcional..."
              rows={4}
              className="w-full border rounded-lg p-3 text-sm"
            />
            <div className="text-sm text-right">
              <span className={observations.length >= MAX_OBSERVATIONS_LENGTH ? 'text-red-600' : 'text-neutral-500'}>
                {observations.length}/{MAX_OBSERVATIONS_LENGTH}
              </span>
            </div>
          </div>

          {/* PDF upload SOLO cuando se pasa de Visita parcial a Visita final */}
          {currentState === 'Visita parcial' && selectedState === 'Visita final' && (
            <div className="flex flex-col gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label className="text-black font-semibold">Archivos adjuntos*</label>
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        setNotification({
                          show: true,
                          type: 'warning',
                          title: 'Archivo muy grande',
                          message: 'El archivo no debe superar 5MB.',
                        });
                        return;
                      }
                      setPdfFile(file);
                    }
                  }}
                  className="text-sm"
                />
              </div>
              {pdfFile && (
                <div className="text-sm text-green-600 mt-2">
                  Archivo seleccionado: {pdfFile.name}
                </div>
              )}
              <div className="text-xs text-gray-500 text-center">
                Puedes adjuntar documentos, imágenes o archivos PDF (máx. 5MB por archivo)
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-4">
            <button
              className="px-6 py-2 rounded-[10px] border border-gray-400 text-gray-700 font-bold hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="px-6 py-2 rounded-[10px] bg-green-500 text-white font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!selectedState || !observations.trim() || submitting}
            >
              Cambiar estado
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="¿Confirmar cambio de estado?"
        message={`Se actualizará el estado a "${selectedState}". Esta acción no se puede deshacer.`}
        confirmText="Sí, cambiar estado"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        zIndex={100}
      />

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowHistory(false)} />
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 relative z-[91]">
            <h3 className="text-xl font-bold mb-4">Historial de visitas</h3>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {visits.filter((v) => v.observations).length === 0 ? (
                <p className="text-gray-500 text-center">No hay visitas registradas aún.</p>
              ) : (
                visits
                  .filter((v) => v.observations)
                  .map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Instructor - Fecha de registro: {visit.date_visit_made || 'N/A'}</div>
                          <div className="text-xs text-gray-600">{visit.name_visit} - Fecha recomendada: {visit.scheduled_date}</div>
                          <div className="mt-2 text-sm text-gray-800">{visit.observations}</div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <button
              className="mt-4 w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold"
              onClick={() => setShowHistory(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Notification modal */}
      <NotificationModal
        isOpen={notification.show}
        onClose={() => {
          const wasSuccess = notification.type === 'success';
          setNotification({ ...notification, show: false });
          if (wasSuccess) {
            // Primero cerrar el modal
            onClose();
            // Esperar un poco más para asegurar que el backend termine
            setTimeout(() => {
              onSuccess();
            }, 300);
          }
        }}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
};

export default UpdateStateModal;

