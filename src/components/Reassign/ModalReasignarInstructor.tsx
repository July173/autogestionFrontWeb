import React, { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import LoadingOverlay from '@/components/LoadingOverlay';
import useInstructorsQuery from '@/hook/useInstructorsQuery';
import { getAssignationByRequest } from '@/Api/Services/AssignationInstructor';
import { getInstructoresCustomList } from '@/Api/Services/Instructor';
import { getFormRequestById } from '@/Api/Services/RequestAssignaton';
import { getDocumentTypesWithEmpty } from '@/Api/Services/TypeDocument';
import { InstructorCustomList } from '@/Api/types/entities/instructor.types';
import FilterBar from '@/components/FilterBar';
import { AssignTableRow, ReassignInstructorPayload, DetailData } from '@/Api/types/Modules/assign.types';

interface ModalReasignarInstructorProps {
  onCancel?: () => void;
  requestRow?: AssignTableRow | null;
  onReassign?: (resp: ReassignInstructorPayload) => void;
}

const ModalReasignarInstructor: React.FC<ModalReasignarInstructorProps> = ({ onCancel, requestRow, onReassign }) => {
  const [params, setParams] = useState<Record<string, string>>({});
  const { data: instructors = [], isFetching: loading, refetch } = useInstructorsQuery(params);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorCustomList | null>(null);
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentInstructorId, setCurrentInstructorId] = useState<number | null>(null);
  const [currentInstructorName, setCurrentInstructorName] = useState<string | null>(null);
  const [currentAssignationId, setCurrentAssignationId] = useState<number | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [documentTypes, setDocumentTypes] = useState<{ id: number | string | ""; name: string }[]>([]);
  // Query hook auto-fetches; use params state to update filters from FilterBar

  const handleConfirm = async () => {
    if (!selectedInstructor) return setError('Selecciona un instructor');
    setError(null);
    setShowConfirm(false);
    let mounted = true;
    try {
      if (mounted) setSubmitting(true);
      const payload: ReassignInstructorPayload = {
        // use the actual asignation_instructor id (record id), not the request id
        asignation_instructor: currentAssignationId ?? requestRow?.id ?? 0,
        new_instructor_id: Number(selectedInstructor.id),
        message: reason || '',
      };

      // Delegate the actual API call to the parent via onReassign.
      if (onReassign) {
        await onReassign(payload);
      }
      // parent is expected to close/unmount this modal; refetch handled by parent
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : String(err);
      if (mounted) setError(m || 'Error al reasignar');
    } finally {
      if (mounted) setSubmitting(false);
      mounted = false;
    }
  };

  // Load current assignation for the given request and set current instructor id
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!requestRow?.id) return;
      try {
        const assign = await getAssignationByRequest(requestRow.id);
        if (!mounted) return;
        if (assign) {
          if (typeof assign.instructor !== 'undefined') setCurrentInstructorId(Number(assign.instructor));
          if (typeof assign.id !== 'undefined') setCurrentAssignationId(Number(assign.id));
        }
      } catch (err) {
        // ignore — fallback to requestRow?.instructor_name shown in UI
      }
    };
    void load();
    return () => { mounted = false; };
  }, [requestRow?.id]);

  // When we have a currentInstructorId, try to resolve its name.
  useEffect(() => {
    let mounted = true;
    const resolveName = async () => {
      if (currentInstructorId == null) {
        setCurrentInstructorName(null);
        return;
      }

      // First try to find it in the currently loaded instructors (cached by react-query)
      const found = instructors.find(i => Number(i.id) === Number(currentInstructorId));
      if (found) {
        if (mounted) setCurrentInstructorName(found.name || null);
        return;
      }

      // Fallback: fetch the custom instructors list and lookup by id
      try {
        const all = await getInstructoresCustomList();
        if (!mounted) return;
        const f2 = all.find(i => Number(i.id) === Number(currentInstructorId));
        if (f2) setCurrentInstructorName(f2.name || null);
        else setCurrentInstructorName(null);
      } catch (e) {
        if (mounted) setCurrentInstructorName(null);
      }
    };
    void resolveName();
    return () => { mounted = false; };
  }, [currentInstructorId, instructors]);

  // Load full request detail and document types so modal can show ficha, programa and readable doc type
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!requestRow?.id) {
        if (mounted) setDetail(null);
        return;
      }

      try {
        const [docTypes, formRes] = await Promise.all([
          getDocumentTypesWithEmpty().catch(() => [{ id: "", name: "" }]),
          getFormRequestById(requestRow.id).catch(() => ({ data: null }))
        ]);
        if (!mounted) return;
        setDocumentTypes(Array.isArray(docTypes) ? docTypes : []);
        setDetail(formRes?.data ?? null);
      } catch (e) {
        if (mounted) {
          setDocumentTypes([]);
          setDetail(null);
        }
      }
    };
    void load();
    return () => { mounted = false; };
  }, [requestRow?.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reassign-title"
      aria-describedby="reassign-desc"
      className="bg-white overflow-y-auto fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[10px] shadow-lg p-0 w-full max-w-5xl max-h-[90vh] z-50 border border-[#ffa577]"
    >
      <div className="border-b border-dashed border-[#ffa577] px-4 sm:px-8 pt-6 pb-2">
        <h2 id="reassign-title" className="text-2xl font-bold text-black mb-1">Reasignar Instructor de seguimiento</h2>
        <p id="reassign-desc" className="text-base text-gray-600">Selecciona un nuevo instructor para el seguimiento del aprendiz</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 px-4 sm:px-8 pt-6 pb-4">
        <div className="flex flex-col gap-4 w-full sm:w-1/2 min-w-0">
          <div className="border border-dashed border-[#ffa577] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#ffd2a2] rounded-full flex items-center justify-center" />
              Información actual
            </h3>

            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Tipo:</span> <span className="block truncate ml-1">{(() => {
              const id = detail?.type_identification ?? (requestRow as any)?.type_identification;
              const found = documentTypes.find(dt => Number(dt.id) === Number(id));
              return found ? found.name : '';
            })()}</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Aprendiz:</span> <span className="block truncate ml-1">{detail?.name_apprentice ?? requestRow?.name ?? ''}</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Identificación:</span> <span className="block truncate ml-1">{detail?.number_identification ?? requestRow?.number_identificacion ?? ''}</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Ficha:</span> <span className="block truncate ml-1">{detail?.numero_ficha ?? detail?.ficha ?? (requestRow as any)?.ficha ?? (requestRow as any)?.file_number ?? ''}</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Fecha de solicitud:</span> <span className="block truncate ml-1">{detail?.request_date ?? requestRow?.request_date ?? ''}</span></div>
           
            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Instructor actual:</span> <span className="block truncate ml-1">{(() => {
              const found = instructors.find(i => currentInstructorId !== null && Number(i.id) === Number(currentInstructorId));
              if (found) return found.name;
              if (currentInstructorName) return currentInstructorName;
              // Try any available fallback on the request row
              if (typeof (requestRow as any)?.instructor_name === 'string') return (requestRow as any).instructor_name;
              if (typeof (requestRow as any)?.instructor === 'string' || typeof (requestRow as any)?.instructor === 'number') return '';
              return '';
            })()}</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Programa:</span> <span className="block truncate ml-1">{detail?.program ?? (requestRow as any)?.program ?? ''}</span></div>
          </div>

          <div className="border border-dashed border-[#ffa577] rounded-lg p-4">
            <label className="block text-orange-700 font-semibold mb-2">Motivo de Reasignación*</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border border-[#ffa577] p-2 text-sm" rows={4} placeholder="Escribe el motivo de la reasignación..." />
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full sm:w-1/2 min-w-0">
          <div className="border border-dashed border-[#ffa577] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-2">Seleccionar instructor</h3>
            <p className="text-sm text-gray-600 mb-4">Busca y selecciona un instructor disponible para el seguimiento</p>


            <div className="mb-4">
              <FilterBar onFilter={(p) => setParams(p)} inputWidth="100%" searchPlaceholder="Buscar por nombre o número de documento..." />
            </div>

            <div className="flex flex-col gap-3 max-h-[40vh] sm:max-h-[265px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center text-gray-600 py-6">Cargando instructores...</div>
              ) : instructors.length === 0 ? (
                <div className="text-center text-gray-600 py-6">No hay instructores disponibles</div>
              ) : (
                instructors.map((inst) => {
                  const assigned = inst.assigned_learners ?? 0;
                  const capacity = inst.max_assigned_learners ?? 80;
                  const pct = Math.round((Number(assigned) / Number(capacity || 1)) * 100);
                  const isSelected = selectedInstructor && Number(selectedInstructor.id) === Number(inst.id);
                  const isCurrent = currentInstructorId !== null && Number(currentInstructorId) === Number(inst.id);

                  return (
                    <div
                      key={inst.id}
                      className={`rounded-lg border p-3 flex items-center justify-between min-w-0 ${isCurrent ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isSelected ? 'border-[#ffa577] bg-[#fff7ef] shadow-[0_4px_10px_rgba(255,165,100,0.25)]' : 'border-[#e0e0e0] bg-white'}`}
                      onClick={() => { if (!isCurrent) setSelectedInstructor(inst); }}
                      role="button"
                      tabIndex={isCurrent ? -1 : 0}
                      onKeyDown={(e) => { if (!isCurrent && e.key === 'Enter') setSelectedInstructor(inst); }}
                      aria-disabled={isCurrent}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">{inst.name ? inst.name.charAt(0) : 'U'}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black truncate">{inst.name || inst.first_name}</p>
                          
                          <p className="text-sm text-gray-600 truncate">{inst.email || ''}</p>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${pct < 60 ? 'bg-[#7bcc7f] text-[#2a4c36]' : 'bg-[#ffe9a2] text-[#af4209]'}`}>{`${assigned}/${capacity} Asignados`}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 px-4 sm:px-8 pb-6">
        <button
          className="bg-gray-200 text-black px-6 py-2 rounded-lg font-medium border border-[#ababab] w-full sm:w-auto"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="bg-[#ffa577] hover:bg-[#de6b09] text-white px-6 py-2 rounded-lg font-medium border border-[#ffa577] shadow-sm hover:shadow-md transition-colors duration-150 w-full sm:w-auto"
          onClick={() => setShowConfirm(true)}
          type="button"
        >
          Reasignar Instructor
        </button>
      </div>

      {error && <div className="text-sm text-red-600 px-4 sm:px-8 pb-4">{error}</div>}

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirmar reasignación"
        message="¿Estás seguro de reasignar al instructor seleccionado?"
        confirmText="Sí, reasignar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <LoadingOverlay isOpen={submitting} message="Reasignando instructor..." />
    </div>
  );
};

export default ModalReasignarInstructor;
