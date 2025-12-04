import React, { useEffect, useState } from 'react';
import useInstructorAssignments from '@/hook/useInstructorAssignments';
import { getFormRequestById } from '@/Api/Services/RequestAssignaton';
import Paginator from '@/components/Paginator';
import PdfView from '@/components/assing/PdfView';
import AssignReviewModal from './AssignReviewModal';
import { InstructorAssignment } from '@/Api/types/Modules/assign.types';

type AssignmentRow = InstructorAssignment & {
  messages?: any[];
  raw?: any;
  ficha?: string;
  modalidad?: string;
};

interface InstructorAssignmentFilters {
  apprentice_name?: string;
  apprentice_id_number?: string;
  modality_name?: string;
  program_name?: string;
  request_state?: string;
}

interface Props {
  instructorId: number;
  /**
   * Filter to apply on request_state/estado_solicitud. Use 'ALL' to disable filtering.
   */
  filterState?: 'VERIFICANDO' | 'ASIGNADO' | 'ALL';
  /**
   * Optional renderer to show acti
   * on buttons for each row.
   */
  renderAction?: (row: AssignmentRow) => React.ReactNode;
  /**
   * Optional callback invoked with the refresh function when component mounts.
   * Allows parent component to trigger a table refresh.
   */
  onRefreshReady?: (refreshFn: () => void) => void;
  /**
   * Optional filters to apply to the instructor assignments endpoint.
   */
  filters?: InstructorAssignmentFilters;
}

const InstructorAssignmentsTable: React.FC<Props> = ({ instructorId, filterState = 'ALL', renderAction, onRefreshReady, filters }) => {
  const { data, loading, error, refresh } = useInstructorAssignments(instructorId, filterState, filters);
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalApprentice, setModalApprentice] = useState<any | null>(null);
  const [modalInitialDetail, setModalInitialDetail] = useState<any | null>(null);
  const [modalInitialMessages, setModalInitialMessages] = useState<any[]>([]);

  const rowsPerPage = 10;

  // Expose refresh function to parent component
  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(refresh);
    }
  }, [onRefreshReady, refresh]);

  useEffect(() => {
    // Map hook data to table rows
    const mapped = (data || []).map((it: any) => {
      const messages = Array.isArray(it.messages) ? it.messages : [];
      return {
        id: it.id,
        instructor: it.instructor,
        request_asignation: it.request_asignation,
        content: it.content,
        type_message: it.type_message,
        aprendiz_id: it.aprendiz_id,
        name: it.nombre || it.name || it.nombre_aprendiz || '',
        tipo_identificacion: it.tipo_identificacion ?? it.type_identification ?? '',
        numero_identificacion: it.numero_identificacion != null ? String(it.numero_identificacion) : (it.number_identificacion ? String(it.number_identificacion) : ''),
        fecha_solicitud: it.fecha_solicitud || it.request_date || '',
        estado_solicitud: it.estado_solicitud || it.request_state || '',
        modalidad: it.modalidad || it.modality || '',
        ficha: it.ficha || it.file_number || '',
        // messages array returned by the instructor assignments endpoint
        messages: messages,
        raw: it,
      };
    });

    // Apply filtering rules requested:
    // - Always hide requests with state `SIN_ASIGNAR`.
    // - For states `ASIGNADO`, `RECHAZADO`, `PRE-APROBADO` show them only if
    //   there is a message whose `whose_message` equals `INSTRUCTOR`.
    // - Then apply the optional `filterState` prop (if provided and not 'ALL').
    const filtered = mapped.filter((r: any) => {
      const s = (r.estado_solicitud || '').toString().toUpperCase();

      // Hide explicitly unassigned
      if (s === 'SIN_ASIGNAR') return false;

      // If the state is one of these, require an instructor message to show
      if (['ASIGNADO', 'RECHAZADO', 'PRE-APROBADO'].includes(s)) {
        const messages = r.messages || [];
        const hasInstructorMsg = messages.some((m: any) => {
          const whoseMsg = String(m.whose_message || '').toUpperCase();
          return whoseMsg === 'INSTRUCTOR';
        });
        
        if (!hasInstructorMsg) return false;
      }

      // Apply optional explicit filterState (keeps existing behavior)
      if (!filterState || filterState === 'ALL') return true;
      return s === filterState.toString().toUpperCase();
    });

    setRows(filtered);
  }, [data, filterState]);

  useEffect(() => {
    setExpandedIdx(null);
  }, [page]);

  const fetchDetail = async (row: AssignmentRow) => {
    const requestId = row.request_asignation || row.id;
    if (!requestId) return null;
    setLoadingDetail(true);
    try {
      const d = await getFormRequestById(Number(requestId));
      return d.data || null;
    } catch {
      return null;
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-[10px] border border-stone-300/70 bg-white overflow-x-auto">
      <div className="min-w-full">
        <div className="bg-gray-100 flex items-center h-12 border-b border-gray-200">
          <div className="flex-1 px-2 text-center text-stone-500 text-sm max-w-[40px]">#</div>
          <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Nombre</div>
          <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Tipo de identificación</div>
          <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Número</div>
          <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Fecha Solicitud</div>
          <div className="flex-1 px-2 text-center text-stone-500 text-sm">Estado</div>
          <div className="flex-1 px-2 text-center text-stone-500 text-sm">Acción</div>
        </div>

        {loading ? (
          <div className="w-full text-center py-4 text-gray-600">Cargando...</div>
        ) : error ? (
          <div className="w-full text-center py-4 text-red-500">{error}</div>
        ) : rows.length === 0 ? (
          <div className="w-full text-center py-4 text-gray-600">No hay asignaciones para este instructor</div>
        ) : (
          (() => {
            const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
            const start = (page - 1) * rowsPerPage;
            const paginatedRows = rows.slice(start, start + rowsPerPage);

            return (
              <>
                {paginatedRows.map((row, idx) => (
                  <React.Fragment key={row.id ?? start + idx}>
                    <div
                      className={`flex items-center border-b border-gray-200 h-12 hover:bg-gray-50 cursor-pointer transition-all ${expandedIdx === idx ? 'bg-gray-50' : ''}`}
                      onClick={async () => {
                        if (expandedIdx === idx) {
                          setExpandedIdx(null);
                        } else {
                          setExpandedIdx(idx);
                          setDetail(null);
                          const d = await fetchDetail(row);
                          setDetail(d);
                        }
                      }}
                    >
                      <div className="flex-1 px-2 text-center text-sm text-black max-w-[40px]">{start + idx + 1}</div>
                      <div className="flex-[2] px-2 text-center text-sm text-black">{row.name}</div>
                      <div className="flex-[2] px-2 text-center text-sm text-black">{row.tipo_identificacion}</div>
                      <div className="flex-[2] px-2 text-center text-sm text-black">{row.numero_identificacion}</div>
                      <div className="flex-[2] px-2 text-center text-sm text-black">{row.fecha_solicitud}</div>
                      <div className="flex-1 px-2 text-center text-sm text-black">{row.estado_solicitud === 'ASIGNADO' ? 'Asignado' : (row.estado_solicitud === 'VERIFICANDO' ? 'Verificando' : row.estado_solicitud)}</div>
                      <div className="flex-1 px-2 text-center flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
                        {renderAction ? renderAction(row) : (() => {
                          // Buscar el mensaje del instructor
                          const messages = row.messages || [];
                          const instrMsg = messages.find((m: any) => {
                            const whoseMsg = String(m.whose_message || '').toUpperCase();
                            return whoseMsg === 'INSTRUCTOR';
                          });
                          
                          // Si NO hay mensaje del instructor, mostrar botón "Sin Valorar" que abre el modal
                          if (!instrMsg) {
                            return (
                              <button
                                className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-full font-medium hover:bg-yellow-200 hover:shadow-md transition-colors whitespace-nowrap text-xs sm:text-sm inline-flex items-center justify-center"
                                onClick={() => {
                                  // prepare apprentice payload for modal
                                  const apprentice = {
                                    name: row.name || '',
                                    type_identification: row.tipo_identificacion || '',
                                    number_identification: row.numero_identificacion || '',
                                    file_number: row.ficha || '',
                                    date_start_production_stage: row.raw?.date_start_production_stage || null,
                                    program: row.raw?.program || null,
                                    request_date: row.fecha_solicitud || null,
                                    request_id: row.request_asignation || row.id,
                                    modality_productive_stage: row.modalidad || '',
                                  };
                                  setModalApprentice(apprentice);
                                  // pass any already-fetched detail/messages to the modal hook to avoid duplicate calls
                                  setModalInitialDetail(detail ?? null);
                                  setModalInitialMessages(row.messages || []);
                                  setIsModalOpen(true);
                                }}
                              >
                                 Sin Valorar
                              </button>
                            );
                          }
                          
                          // Si HAY mensaje del instructor, mostrar el estado como badge (no clickeable)
                          const typeMsg = String(instrMsg.type_message || '').toUpperCase();
                          let colorClass = 'bg-gray-100 border border-gray-200 text-gray-800';
                          let displayText = instrMsg.type_message || typeMsg;
                          
                          // Determinar color según el tipo de mensaje
                          if (typeMsg.includes('APROBAD')) {
                            colorClass = 'bg-green-100 border border-green-300 text-green-800';
                            displayText = 'APROBADO';
                          } else if (typeMsg.includes('RECHAZAD')) {
                            colorClass = 'bg-red-100 border border-red-300 text-red-800';
                            displayText = 'RECHAZADO';
                          }
                          
                          // Retornar badge no clickeable (span en lugar de button)
                          return (
                            <span className={`${colorClass} px-3 py-1 rounded-full font-medium whitespace-nowrap text-xs sm:text-sm inline-flex items-center justify-center`}>
                              {displayText}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {expandedIdx === idx && (
                      <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 animate-fade-in">
                        {loadingDetail ? (
                          <div className="text-center text-gray-600">Cargando información...</div>
                        ) : detail ? (
                          <>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                              <div>
                                <div className="font-semibold">Aprendiz</div>
                                <div>{detail.name_apprentice || detail.nombre_aprendiz || detail.nombre || detail.raw?.nombre_aprendiz || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Tipo identificación</div>
                                <div>{detail.type_identification || detail.tipo_identificacion || detail.raw?.tipo_identificacion || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Número identificación</div>
                                <div>{detail.number_identification ?? detail.numero_identificacion ?? detail.raw?.numero_identificacion ?? ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Teléfono aprendiz</div>
                                <div>{detail.phone_apprentice || detail.telefono_aprendiz || detail.raw?.telefono_aprendiz || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Correo aprendiz</div>
                                <div>{detail.email_apprentice || detail.correo_aprendiz || detail.raw?.correo_aprendiz || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Ficha</div>
                                <div>{detail.numero_ficha ?? detail.ficha ?? detail.raw?.numero_ficha ?? detail.raw?.ficha ?? ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Programa</div>
                                <div>{detail.program || detail.programa || detail.raw?.programa || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Modalidad</div>
                                <div>{detail.modality_productive_stage || detail.raw?.modality_productive_stage || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Empresa</div>
                                <div>{detail.enterprise_name || detail.empresa_nombre || detail.raw?.empresa_nombre || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">NIT empresa</div>
                                <div>{detail.enterprise_nit ?? detail.empresa_nit ?? detail.raw?.empresa_nit ?? ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Ubicación empresa</div>
                                <div>{detail.enterprise_location || detail.empresa_ubicacion || detail.raw?.empresa_ubicacion || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Correo empresa</div>
                                <div>{detail.enterprise_email || detail.empresa_correo || detail.raw?.empresa_correo || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Jefe</div>
                                <div>{detail.boss_name || detail.jefe_nombre || detail.raw?.jefe_nombre || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Teléfono jefe</div>
                                <div>{detail.boss_phone ?? detail.jefe_telefono ?? detail.raw?.jefe_telefono ?? ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Correo jefe</div>
                                <div>{detail.boss_email || detail.jefe_correo || detail.raw?.jefe_correo || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Cargo jefe</div>
                                <div>{detail.boss_position || detail.jefe_cargo || detail.raw?.jefe_cargo || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Regional</div>
                                <div>{detail.regional || detail.raw?.regional || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Centro</div>
                                <div>{detail.center || detail.raw?.center || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Sede</div>
                                <div>{detail.sede || detail.raw?.sede || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Fecha solicitud</div>
                                <div>{detail.request_date || detail.fecha_solicitud || detail.raw?.fecha_solicitud || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Inicio etapa práctica</div>
                                <div>{detail.date_start_production_stage || detail.fecha_inicio_etapa_practica || detail.raw?.fecha_inicio_etapa_practica || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Fin etapa práctica</div>
                                <div>{detail.date_end_production_stage || detail.fecha_fin_etapa_practica || detail.raw?.fecha_fin_etapa_practica || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Estado solicitud</div>
                                <div>{detail.request_state || detail.estado_solicitud || detail.raw?.request_state || detail.raw?.estado_solicitud || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Mensaje (content)</div>
                                <div>{row.content || detail.content || detail.raw?.content || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Tipo mensaje</div>
                                <div>{row.type_message || detail.type_message || detail.raw?.type_message || ''}</div>
                              </div>

                              <div>
                                <div className="font-semibold">Talento humano</div>
                                <div>
                                  {detail.human_talent?.name || detail.talento_humano?.nombre || detail.raw?.talento_humano?.nombre || ''}
                                  {detail.human_talent?.email || detail.talento_humano?.correo || detail.raw?.talento_humano?.correo ? (
                                    <div className="text-xs text-gray-600">{detail.human_talent?.email || detail.talento_humano?.correo || detail.raw?.talento_humano?.correo}</div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {detail.pdf_url && (
                              <div className="mt-6">
                                <PdfView
                                  uri={detail.pdf_url.startsWith('/') ? 'http://127.0.0.1:8000' + detail.pdf_url : detail.pdf_url}
                                  initialFullscreen={false}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-gray-600">No hay información disponible</div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div className="w-full flex items-center justify-between mt-4 p-4">
                  <div className="text-sm text-stone-600">{`Mostrando ${start + 1}-${Math.min(start + paginatedRows.length, rows.length)} de ${rows.length}`}</div>
                  <Paginator page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
                </div>
              </>
            );
          })()
        )}
      </div>
      </div>
      {/* Modal for valuation */}
      <AssignReviewModal
        apprentice={modalApprentice || { name: '', type_identification: 0, number_identification: '', file_number: '' }}
        initialDetail={modalInitialDetail ?? undefined}
        initialMessages={modalInitialMessages.length ? modalInitialMessages : undefined}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalApprentice(null); setModalInitialDetail(null); setModalInitialMessages([]); }}
        onApprove={() => {
          setIsModalOpen(false);
          setModalApprentice(null);
          setModalInitialDetail(null);
          setModalInitialMessages([]);
          refresh();
        }}
        onReject={() => {
          setIsModalOpen(false);
          setModalApprentice(null);
          setModalInitialDetail(null);
          setModalInitialMessages([]);
          refresh();
        }}
      />
    </>
  );
};

export default InstructorAssignmentsTable;
