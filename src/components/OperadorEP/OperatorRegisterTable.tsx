import React, { useState, useEffect } from 'react';
import { AssignTableRow, DetailData } from '@/Api/types/Modules/assign.types';
import { getFormRequestById } from '@/Api/Services/RequestAssignaton';
import { getDocumentTypesWithEmpty } from '@/Api/Services/TypeDocument';
import Paginator from '@/components/Paginator';
import PdfView from '../assing/PdfView';
import ModalOperatorRegister from './ModalOperatorRegister';
import LoadingOverlay from '@/components/LoadingOverlay';
import NotificationModal from '@/components/NotificationModal';
import useOperatorRegister from '@/hook/useOperatorRegister';

type DocumentType = { id: number; name: string };

interface OperatorRegisterTableProps {
  rows: AssignTableRow[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

const OperatorRegisterTable: React.FC<OperatorRegisterTableProps> = ({
  rows,
  loading,
  error,
  onRefresh,
}) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [registrationStatus, setRegistrationStatus] = useState<Record<number, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState<Set<number>>(new Set());
  
  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AssignTableRow | null>(null);
  
  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'warning'>('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const { loading: operatorLoading, checkOperatorRegistration, registerOperatorMessage } = useOperatorRegister();

  const rowsPerPage = 10;

  // Load document types
  useEffect(() => {
    getDocumentTypesWithEmpty().then((types) => {
      setDocumentTypes(
        types
          .filter((t) => typeof t.id === 'number')
          .map((t) => ({
            id: Number(t.id),
            name: t.name,
          }))
      );
    });
  }, []);

  // Check registration status for all visible rows
  useEffect(() => {
    const checkAllStatuses = async () => {
      const statusMap: Record<number, boolean> = {};
      const loadingSet = new Set<number>();

      for (const row of rows) {
        if (row.id) {
          loadingSet.add(row.id);
          setLoadingStatus(new Set(loadingSet));
          
          const isRegistered = await checkOperatorRegistration(row.id);
          statusMap[row.id] = isRegistered;
          
          loadingSet.delete(row.id);
          setLoadingStatus(new Set(loadingSet));
        }
      }

      setRegistrationStatus(statusMap);
    };

    if (rows.length > 0) {
      checkAllStatuses();
    }
  }, [rows, checkOperatorRegistration]);

  const fetchDetail = async (rowId: number) => {
    setLoadingDetail(true);
    try {
      const response = await getFormRequestById(rowId);
      setDetail(response.data);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRegisterClick = (row: AssignTableRow) => {
    setSelectedRow(row);
    setShowRegisterModal(true);
  };

  const handleConfirmRegister = async (message: string) => {
    if (!selectedRow?.id) return;

    console.log('[OperatorRegisterTable] Registrando mensaje para solicitud:', selectedRow.id);
    const result = await registerOperatorMessage(selectedRow.id, message);
    console.log('[OperatorRegisterTable] Resultado del registro:', result);

    setShowRegisterModal(false);

    if (result.success) {
      setNotificationType('success');
      setNotificationTitle('Registro Exitoso');
      setNotificationMessage(result.message || 'El registro se completó correctamente');
      
      // Update status locally
      setRegistrationStatus(prev => ({
        ...prev,
        [selectedRow.id!]: true
      }));
      
      console.log('[OperatorRegisterTable] Estado actualizado localmente, verificando...');
      // Verificar inmediatamente después de registrar
      setTimeout(async () => {
        const isNowRegistered = await checkOperatorRegistration(selectedRow.id!);
        console.log('[OperatorRegisterTable] Verificación post-registro:', isNowRegistered);
        if (isNowRegistered) {
          setRegistrationStatus(prev => ({
            ...prev,
            [selectedRow.id!]: true
          }));
        }
      }, 500);
    } else {
      setNotificationType('warning');
      setNotificationTitle('Error al Registrar');
      setNotificationMessage(result.error || 'Ocurrió un error al registrar');
    }

    setShowNotification(true);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    if (notificationType === 'success' && onRefresh) {
      onRefresh();
    }
  };

  const getDocTypeName = (typeId: number) => {
    const found = documentTypes.find((t) => t.id === typeId);
    return found ? found.name : String(typeId);
  };

  if (loading) {
    return (
      <div className="w-full text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        <p className="mt-2 text-gray-600">Cargando solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-600">
        No hay solicitudes asignadas para registrar
      </div>
    );
  }

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIdx = (page - 1) * rowsPerPage;
  const paginatedRows = rows.slice(startIdx, startIdx + rowsPerPage);

  return (
    <>
      <LoadingOverlay isOpen={operatorLoading} message="Procesando registro..." />
      
      <div className="w-full rounded-[10px] border border-stone-300/70 bg-white overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="bg-gray-100 flex items-center h-12 border-b border-gray-200">
            <div className="flex-1 px-2 text-center text-stone-500 text-sm max-w-[40px]">#</div>
            <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Nombre</div>
            <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Tipo de identificación</div>
            <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Número</div>
            <div className="flex-[2] px-2 text-center text-stone-500 text-sm">Fecha Solicitud</div>
            <div className="flex-1 px-2 text-center text-stone-500 text-sm">Estado</div>
            <div className="flex-1 px-2 text-center text-stone-500 text-sm">Acción</div>
          </div>

          {/* Rows */}
          {paginatedRows.map((row, idx) => {
            const globalIdx = startIdx + idx;
            const isExpanded = expandedIdx === idx;
            const isRegistered = registrationStatus[row.id!] || false;
            const isCheckingStatus = loadingStatus.has(row.id!);

            return (
              <React.Fragment key={row.id ?? globalIdx}>
                <div
                  className={`flex items-center border-b border-gray-200 h-12 hover:bg-gray-50 cursor-pointer transition-all ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={async () => {
                    if (isExpanded) {
                      setExpandedIdx(null);
                    } else {
                      setExpandedIdx(idx);
                      setDetail(null);
                      if (row.id) {
                        await fetchDetail(row.id);
                      }
                    }
                  }}
                >
                  <div className="flex-1 px-2 text-center text-sm text-black max-w-[40px]">
                    {globalIdx + 1}
                  </div>
                  <div className="flex-[2] px-2 text-center text-sm text-black">{row.name}</div>
                  <div className="flex-[2] px-2 text-center text-sm text-black">
                    {getDocTypeName(row.type_identification)}
                  </div>
                  <div className="flex-[2] px-2 text-center text-sm text-black">
                    {row.number_identificacion}
                  </div>
                  <div className="flex-[2] px-2 text-center text-sm text-black">
                    {row.request_date}
                  </div>
                  <div className="flex-1 px-2 text-center text-sm text-black">
                    {row.request_state || 'ASIGNADO'}
                  </div>
                  <div
                    className="flex-1 px-2 text-center flex justify-center items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isCheckingStatus ? (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
                    ) : isRegistered ? (
                      <span className="bg-green-100 border border-green-300 text-green-800 px-3 py-1 rounded-full font-medium text-xs">
                        Registrado
                      </span>
                    ) : (
                      <button
                        className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-full font-medium hover:bg-yellow-200 transition-colors text-xs"
                        onClick={() => handleRegisterClick(row)}
                      >
                        Sin Registrar
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                    {loadingDetail ? (
                      <div className="text-center text-gray-600">Cargando información...</div>
                    ) : detail ? (
                      <>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                          <div>
                            <div className="font-semibold">Aprendiz</div>
                            <div>{detail.name_apprentice || row.name}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Tipo identificación</div>
                            <div>{getDocTypeName(row.type_identification)}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Número identificación</div>
                            <div>{detail.number_identification ?? row.number_identificacion}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Teléfono</div>
                            <div>{detail.phone_apprentice || '-'}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Correo</div>
                            <div>{detail.email_apprentice || '-'}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Programa</div>
                            <div>{detail.program || '-'}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Modalidad</div>
                            <div>{detail.modality_productive_stage || row.nombre_modalidad || '-'}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Empresa</div>
                            <div>{detail.enterprise_name || '-'}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Jefe</div>
                            <div>{detail.boss_name || '-'}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Estado</div>
                            <div>{detail.request_state || row.request_state}</div>
                          </div>
                        </div>

                        {detail.pdf_url && (
                          <div className="mt-6">
                            <PdfView
                              uri={
                                detail.pdf_url.startsWith('/')
                                  ? 'http://127.0.0.1:8000' + detail.pdf_url
                                  : detail.pdf_url
                              }
                              initialFullscreen={false}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-600">
                        No hay información disponible
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex items-center justify-between mt-4 p-4">
            <div className="text-sm text-stone-600">
              Mostrando {startIdx + 1}-{Math.min(startIdx + paginatedRows.length, rows.length)} de{' '}
              {rows.length}
            </div>
            <Paginator page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegisterModal && selectedRow && (
        <ModalOperatorRegister
          apprenticeName={selectedRow.name}
          requestId={selectedRow.id!}
          onClose={() => {
            setShowRegisterModal(false);
            setSelectedRow(null);
          }}
          onConfirm={handleConfirmRegister}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotification}
        onClose={handleNotificationClose}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
      />
    </>
  );
};

export default OperatorRegisterTable;

