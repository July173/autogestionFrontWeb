import React, { useEffect, useState } from "react";
import ModalOtroInstructor from "./ModalOtherInstructor";
import ModalReject from "./ModalReject";
import LoadingOverlay from "../LoadingOverlay";
import { getDocumentTypesWithEmpty } from "@/Api/Services/TypeDocument";
import { getInstructoresCustomList } from "@/Api/Services/Instructor";
import { assignInstructorToRequest, getRequestAsignationById, rejectRequest } from "@/Api/Services/RequestAssignaton";
import { getModalityProductiveStages, ModalityProductiveStage } from '@/Api/Services/ModalityProductiveStage';
import { InstructorCustomList } from "@/Api/types/entities/instructor.types";
import useNotification from "@/hook/useNotification";
import NotificationModal from "@/components/NotificationModal";


/**
 * Represents a document type for identification.
 * @typedef {Object} DocumentType
 * @property {number} id - Document type ID
 * @property {string} name - Document type name
 */
type DocumentType = { id: number; name: string };


/**
 * Represents the data of an apprentice.
 * @typedef {Object} ApprenticeData
 * @property {string} name - Apprentice's name
 * @property {number} identification_type - Type of identification
 * @property {string} identification_number - Identification number
 * @property {string} file_number - File number
 * @property {string} date_start_production_stage - Start date of practical stage
 * @property {string} program - Program name
 * @property {string} request_date - Request date
 * @property {number} [request_id] - Optional request ID
 */
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


/**
 * Props for ModalAsignar component.
 * @typedef {Object} ModalAsignarProps
 * @property {ApprenticeData} apprentice - Apprentice data
 * @property {function} onClose - Function to close the modal
 * @property {function} onReject - Function to handle rejection
 * @property {function} [onAssignmentComplete] - Optional callback when assignment is complete
 */
interface ModalAsignarProps {
    apprentice: ApprenticeData;
    onClose: () => void;
    onReject: () => void;
    onAssignmentComplete?: () => void;
}

/**
 * Modal for assigning a follow-up instructor to an apprentice.
 * Handles instructor selection, assignment, and rejection workflows.
 * @param {ModalAsignarProps} props
 */
export default function ModalAsignar({ apprentice, onClose, onReject, onAssignmentComplete }: ModalAsignarProps) {
    const { notification, showNotification, hideNotification } = useNotification();
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [docTypeName, setDocTypeName] = useState<string>("");
    const [showOtherInstructorModal, setShowOtherInstructorModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<InstructorCustomList | null>(null);
    const [instructores, setInstructores] = useState<InstructorCustomList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [assigning, setAssigning] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [requestAsignationId, setRequestAsignationId] = useState<number | null>(null);
    const [message, setMessage] = useState<string>("");
    const [messageError, setMessageError] = useState<string>("");
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    // notification type used by NotificationModal: we'll use 'success' or 'warning'
    const [resultType, setResultType] = useState<'success' | 'warning'>('success');
    const MAX_MESSAGE_LENGTH = 500;
    const [modalityStage, setModalityStage] = useState<string | null>(null);
    const [modalities, setModalities] = useState<ModalityProductiveStage[]>([]);
    const [currentRequestState, setCurrentRequestState] = useState<string | null>(null);

    // assign-only modal: no external assignedInstructor/initialMessages



    /**
     * Confirms the assignment of the selected instructor to the apprentice's request.
     * Shows notification and closes modal on success.
     */
    const handleConfirmAssignment = async () => {
        if (!selectedInstructor || !requestAsignationId) {
            // Only show visual error, no alert
            return;
        }
        if (!message || !message.trim()) {
            setMessageError('El mensaje es obligatorio');
            return;
        }
        setAssigning(true);
        setShowConfirmModal(false);
            try {
            // Decide type_message and request_state based on current request state (prefer),
            // otherwise fallback to modality-based rule.
            const modality = (modalityStage || apprentice.modality_productive_stage || '').trim();
            let type_message = 'VERIFICACION';
            let request_state_val = 'VERIFICANDO';

            const st = currentRequestState ? String(currentRequestState).toUpperCase() : null;
            if (st === 'ASIGNADO') {
                type_message = 'ASIGNADO';
                request_state_val = 'ASIGNADO';
            } else if (st === 'VERIFICANDO' || st === 'VERIFICACION' || st === 'EN_REVISION' || st === 'PRE-APROBADO' || st === 'PRE_APROBADO') {
                type_message = 'VERIFICACION';
                request_state_val = 'VERIFICANDO';
            } else {
                // fallback to modality-based rule
                if (modality === 'Contrato de aprendizaje') {
                    type_message = 'ASIGNADO';
                    request_state_val = 'ASIGNADO';
                }
            }

            // Call assign service and capture response (if any)
            let resp;
            // assign flow: always call assignInstructorToRequest
            resp = await assignInstructorToRequest(selectedInstructor.id, requestAsignationId, {
                content: message,
                type_message,
                request_state: request_state_val,
                whose_message: 'COORDINADOR'
            });

            // Default success message
            let msg = 'Se ha llevado a cabo con éxito tu solicitud.';
            let t: 'success' | 'warning' = 'success';

            // Try to extract server-provided message when available (safely narrow unknown)
            try {
                let rawData: unknown = null;
                if (resp) {
                    const maybe = (resp as { data?: unknown }).data;
                    rawData = maybe ?? resp;
                }
                if (rawData && typeof rawData === 'object') {
                    const d = rawData as Record<string, unknown>;
                    const statusVal = typeof d.status === 'string' ? d.status.toLowerCase() : undefined;
                    if (statusVal === 'error') {
                        t = 'warning';
                        if (typeof d.detail === 'string') msg = d.detail;
                        else if (typeof d.message === 'string') msg = d.message;
                    } else if (typeof d.detail === 'string') {
                        msg = d.detail;
                    }
                }
            } catch (e) {
                // ignore parsing errors
            }

            setResultType(t);
            setResultMessage(msg);
            setShowResultModal(true);
        } catch (error) {
            console.error('Error al asignar instructor:', error);
            // Parse axios/server error to extract a useful message for the user
            let msg = 'Ocurrió un error al asignar el instructor.';
            try {
                const errObj: unknown = error;
                if (errObj && typeof errObj === 'object') {
                    const eObj = errObj as Record<string, unknown>;
                    const respObj = eObj.response as Record<string, unknown> | undefined;
                    if (respObj && respObj.data) {
                        const d = respObj.data;
                        if (typeof d === 'string') msg = d;
                        else if (d && typeof d === 'object') {
                            const dd = d as Record<string, unknown>;
                            if (typeof dd.detail === 'string') msg = dd.detail;
                            else if (typeof dd.message === 'string') msg = dd.message;
                            else msg = JSON.stringify(dd);
                        }
                    } else if (typeof eObj.message === 'string') {
                        msg = eObj.message;
                    }
                }
            } catch (e) {
                // fallback to generic
            }

            setResultType('warning');
            setResultMessage(msg);
            setShowResultModal(true);
        } finally {
            setAssigning(false);
        }
    };


    /**
     * Opens the confirmation modal for instructor assignment.
     */
    const handleAssignInstructor = () => {
        if (!selectedInstructor || !requestAsignationId) {
            // Only show visual error, no alert
            return;
        }
        // Validate message is present before opening confirmation
        if (!message || !message.trim()) {
            setMessageError('El mensaje es obligatorio');
            return;
        }
        setMessageError('');
        setShowConfirmModal(true);
    };


    /**
     * Opens the rejection modal for the assignment request.
     */
    const handleReject = () => {
        setShowRejectModal(true);
    };


    /**
     * Confirms the rejection of the assignment request.
     * Shows notification and closes modal on success.
     * @param {string} rejectionMessage - Reason for rejection
     */
    const handleConfirmReject = async (rejectionMessage: string) => {
        if (!requestAsignationId) {
            // Only show visual error, no alert
            return;
        }
        try {
            await rejectRequest(requestAsignationId, rejectionMessage);
            // Show success notification and close
            showNotification('success', 'Acción completada', 'Se ha llevado a cabo con éxito tu solicitud.');
            setShowRejectModal(false);
            onAssignmentComplete?.(); // Notify to refresh table
            onClose();
        } catch (error) {
            console.error('Error al rechazar la solicitud:', error);
            // Solo mostrar error visual, no alert
        }
    };

    useEffect(() => {
        // Load document types
        getDocumentTypesWithEmpty().then((types) => {
            const validTypes: DocumentType[] = types
                .filter(t => typeof t.id === "number")
                .map(t => ({
                    id: t.id as number,
                    name: t.name
                }));
            setDocumentTypes(validTypes);
            const found = validTypes.find(t => t.id === apprentice.type_identification);
            setDocTypeName(found ? found.name : "");
        });

        // Load instructors
        setLoading(true);
        setError("");
        getInstructoresCustomList()
            .then(data => {
                // Validate that data is an array and filter invalid elements
                if (Array.isArray(data)) {
                    const validInstructores = data.filter(inst =>
                        inst && typeof inst === 'object' && inst.id && inst.name
                    );
                    setInstructores(validInstructores);
                } else {
                    setInstructores([]);
                    setError("Formato de datos incorrecto");
                }
            })
            .catch(error => {
                console.error("Error al cargar instructores:", error);
                setError("Error al cargar instructores");
                setInstructores([]);
            })
            .finally(() => {
                setLoading(false);
            });

        // Load modalities and the request_asignation; then map modality id -> name
        const loadData = async () => {
            try {
                const mods = await getModalityProductiveStages();
                // The service may return an object or array directly
                let modsArr: ModalityProductiveStage[] = [];
                if (Array.isArray(mods)) {
                    modsArr = mods as ModalityProductiveStage[];
                } else if (mods && typeof mods === 'object') {
                    const mObj = mods as Record<string, unknown>;
                    if (Array.isArray(mObj.data)) {
                        modsArr = mObj.data as ModalityProductiveStage[];
                    }
                }
                setModalities(modsArr);

                if (apprentice.request_id) {
                    const resp = await getRequestAsignationById(apprentice.request_id);
                    const payload = (resp && (resp.data || resp)) || {};
                    const id = payload.id ?? payload.request_asignation ?? payload.request_asignation_id ?? null;
                    if (id) setRequestAsignationId(id);

                    // Guardar el estado actual de la solicitud si viene desde el backend
                    const rawState = payload.request_state ?? payload.state ?? null;
                    if (rawState) setCurrentRequestState(String(rawState));

                    const rawModality = payload.modality_productive_stage ?? payload.modality ?? null;
                    if (rawModality != null) {
                        // If backend returns an id (number or numeric string), map to name
                        const rawId = typeof rawModality === 'number' ? rawModality : (typeof rawModality === 'string' && /^[0-9]+$/.test(rawModality) ? Number(rawModality) : null);
                        if (rawId != null) {
                            const found = modsArr.find(m => Number(m.id) === rawId);
                            if (found) {
                                // prefer known property name_modality
                                setModalityStage(found.name_modality ?? String(found.id));
                            } else {
                                // fallback to raw numeric string
                                setModalityStage(String(rawModality));
                            }
                        } else {
                            // rawModality is already a name string
                            setModalityStage(String(rawModality));
                        }
                    }
                }
            } catch (err) {
                console.error('Error al cargar modalidades o solicitud:', err);
            }
        };

        loadData();
    }, [apprentice.type_identification, apprentice.request_id]);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <LoadingOverlay isOpen={assigning} message={assigning ? 'Asignando...' : undefined} zIndex={1000} />
                {/* Dark overlay: captures clicks and stops propagation so they don't reach the table */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-40"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                        // Prevent click from reaching underlying elements
                        e.stopPropagation();
                    }}
                />
                {/* Main modal */}
                <div
                    className="bg-white rounded-[10px] shadow-lg max-w-2xl w-full mx-4 p-6 relative flex flex-col gap-6 z-10"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="assign-dialog-title"
                    style={{ pointerEvents: 'auto', maxHeight: '90vh', overflowY: 'auto' }}
                    onClick={(e) => e.stopPropagation()} // prevent bubbling from inside modal
                >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#22c55e" className="bi bi-person-fill-check" viewBox="0 0 16 16">
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                            <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4" />
                        </svg>
                        <div>
                            <div id="assign-dialog-title" className="text-black text-2xl font-extrabold font-['Roboto'] leading-loose text-left">Asignar Instructor de seguimiento</div>
                            <div className="text-black text-base font-normal font-['Roboto'] leading-loose">Selecciona un instructor para realizar el seguimiento del aprendiz</div>
                        </div>
                    </div>
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
                                <div className="text-black text-2xl font-semibold font-['Roboto'] leading-loose truncate">{apprentice.name}</div>
                                <div className="text-neutral-500 text-base font-normal font-['Roboto'] leading-loose text-left">Información del aprendiz</div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 gap-y-2 text-sm w-full">
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                    </svg>
                                    <span className="text-neutral-500">Identificación:</span>
                                    <span className="text-black font-medium truncate">{apprentice.number_identification}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                                        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                                    </svg>
                                    <span className="text-neutral-500">Tipo:</span>
                                    <span className="text-black font-medium truncate">{docTypeName}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mortarboard" viewBox="0 0 16 16">
                                        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                                        <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
                                    </svg>
                                    <span className="text-neutral-500">Ficha:</span>
                                    <span className="text-black font-medium truncate">{apprentice.file_number}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar4" viewBox="0 0 16 16">
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                                    </svg>
                                    <span className="text-neutral-500">Fecha de solicitud:</span>
                                    <span className="text-black font-medium truncate">{apprentice.request_date}</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2 min-w-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar4" viewBox="0 0 16 16">
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                                    </svg>
                                    <span className="text-neutral-500">Fecha inicio etapa práctica:</span>
                                    <span className="text-black font-medium truncate">{apprentice.date_start_production_stage}</span>
                                </div>
                            </div>
                        </div>
                        <hr className="my-2 border-t border-gray-200" />
                        <div className="text-stone-500 text-base font-medium font-['Roboto'] leading-loose mt-1">
                            Programa: <span className="text-neutral-500 font-normal truncate">{apprentice.program}</span>
                        </div>
                        <div className="text-stone-500 text-base font-medium font-['Roboto'] leading-loose mt-1">
                            Modalidad etapa práctica: <span className="text-neutral-500 font-normal truncate">{modalityStage || apprentice.modality_productive_stage || 'No especificada'}</span>
                        </div>
                    </div>
                    {/* Instructor selector */}
                    <div>
                        <div className="text-black text-2xl font-medium font-['Roboto'] mb-2 text-left">Seleccionar Instructor</div>
                        {loading ? (
                            <div className="text-center py-4">Cargando instructores...</div>
                        ) : error ? (
                            <div className="text-center py-4 text-red-500">{error}</div>
                        ) : selectedInstructor ? (
                            // If already assigned, show name with option to change
                            <div className="flex items-center gap-4">
                                <div className="flex-1 border rounded-lg px-4 py-2 text-base font-normal font-['Roboto'] bg-gray-50">
                                    {selectedInstructor.name}
                                </div>
                                <button
                                    className="border border-gray-400 text-gray-600 px-6 py-2 rounded-[10px] font-bold hover:bg-gray-200"
                                    onClick={() => setShowOtherInstructorModal(true)}
                                >
                                    Cambiar instructor
                                </button>
                            </div>
                        ) : (
                            // If NOT assigned, show only assign button
                            <button
                                className="w-full border border-gray-400 text-black px-6 py-3 rounded-[10px] font-bold text-lg "
                                onClick={() => setShowOtherInstructorModal(true)}
                            >
                                Asignar Instructor
                            </button>
                        )}
                    </div>
                    {/* Message input for content to send to backend */}
                    <div className="mt-4 flex flex-col items-start">
                        <label className="text-black font-medium font-['Roboto'] mb-2 w-full text-left">Mensaje*</label>
                        <textarea
                            value={message}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v.length > MAX_MESSAGE_LENGTH) {
                                    setMessage(v.slice(0, MAX_MESSAGE_LENGTH));
                                    setMessageError(`Máximo ${MAX_MESSAGE_LENGTH} caracteres`);
                                } else {
                                    setMessage(v);
                                    // clear length error but keep other errors handled elsewhere
                                    if (messageError && messageError.startsWith('Máximo')) {
                                        setMessageError('');
                                    }
                                }
                            }}
                            placeholder="Escribe un mensaje "
                            rows={3}
                            className="w-full mt-2 border rounded-lg p-3 text-sm font-['Roboto']"
                        />
                        <div className="w-full flex justify-between items-center">
                            <div />
                            <div className="text-sm mt-2">
                                <span className={message.length >= MAX_MESSAGE_LENGTH ? 'text-red-600' : 'text-neutral-500'}>{message.length}/{MAX_MESSAGE_LENGTH}</span>
                            </div>
                        </div>
                        {messageError && (
                            <div className="text-sm text-red-600 mt-2">{messageError}</div>
                        )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between mt-4">
                        <button
                            className="bg-[#fb8383] border border-[#773939] text-[#ffffff] font-bold px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-[#fbbcbc]"
                            onClick={handleReject}
                            type="button"
                            aria-label="Rechazar solicitud"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffff" className="bi bi-x-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                            Rechazar solicitud
                        </button>
                        <div className="flex-1" />
                        <button className="w-full sm:w-auto bg-white border border-[#a39f9f] text-black font-bold px-6 py-2 rounded-[10px] flex items-center gap-2 hover:bg-gray-100" onClick={onClose} type="button" aria-label="Cancelar">
                            Cancelar
                        </button>
                        <button
                            className="bg-[#7bcc7f] border border-[#c0fbcd] text-[#ffffff] font-bold px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-[#a6e6ad] disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleAssignInstructor}
                            disabled={!selectedInstructor || assigning || !message || !message.trim()}
                            type="button"
                            aria-label="Asignar Instructor"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" className="bi bi-check-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                            </svg>
                            {assigning ? 'Asignando...' : 'Asignar Instructor'}
                        </button>
                    </div>
                </div>
            </div>
            {/* Modal for 'Other instructor' */}
            {showOtherInstructorModal && (
                <ModalOtroInstructor
                    onClose={() => {
                        setShowOtherInstructorModal(false);
                    }}
                    onAssign={instructor => {
                        const nameFallback = instructor.name ||
                            `${instructor.first_name || ''} ${instructor.second_name || ''} ${instructor.first_last_name || ''} ${instructor.second_last_name || ''}`.replace(/ +/g, ' ').trim() ||
                            'Sin nombre';
                        setSelectedInstructor({ ...instructor, name: nameFallback });
                        setShowOtherInstructorModal(false);
                    }}
                />
            )}

            {/* Confirmation modal */}
            {showConfirmModal && selectedInstructor && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowConfirmModal(false)} />
                    <div className="bg-white rounded-[10px] shadow-lg max-w-md w-full mx-4 p-6 relative z-[81]">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-black mb-2">¿Confirmar asignación?</h3>
                                <p className="text-gray-700">
                                    Se asignará el instructor <span className="font-bold">{selectedInstructor.name}</span> para el seguimiento de <span className="font-bold">{apprentice.name}</span>.
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-sm text-gray-700 font-medium">Mensaje a enviar:</label>
                            <div className="mt-2 p-3 border rounded bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap max-h-40 overflow-auto">
                                {message && message.trim() ? message : <em className="text-neutral-500">(Sin mensaje)</em>}
                            </div>
                            {messageError && (
                                <div className="text-sm text-red-600 mt-2">{messageError}</div>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                className="px-6 py-2 rounded-[10px] border border-gray-400 text-gray-700 font-bold hover:bg-gray-100"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-6 py-2 rounded-[10px] bg-green-500 text-white font-bold hover:bg-green-600 flex items-center gap-2"
                                onClick={handleConfirmAssignment}
                                disabled={assigning || !message || !message.trim() || message.length > MAX_MESSAGE_LENGTH}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {assigning ? 'Confirmando...' : 'Confirmar asignación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection modal */}
            {showRejectModal && requestAsignationId && (
                <ModalReject
                    apprenticeName={apprentice.name}
                    requestId={requestAsignationId}
                    onClose={() => setShowRejectModal(false)}
                    onConfirm={handleConfirmReject}
                />
            )}

            
            {/* Result modal after assignment (success or error): when accepted, close modals and refresh parent */}
            {showResultModal && (
                <NotificationModal
                    isOpen={showResultModal}
                    onClose={() => {
                        setShowResultModal(false);
                        // Notify parent to refresh table and then close this modal
                        onAssignmentComplete?.();
                        onClose();
                    }}
                    type={resultType}
                    title={resultType === 'success' ? 'Acción completada' : 'Error'}
                    message={resultMessage}
                />
            )}
            {/* Global notification */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </>
    );
}
