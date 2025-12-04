import React, { useState, useEffect } from "react";
import { InstructorCustomList } from "@/Api/types/entities/instructor.types";
import { patchInstructorLimit } from "@/Api/Services/Instructor";
import { getKnowledgeAreas } from "@/Api/Services/KnowledgeArea";
import { KnowledgeArea } from "@/Api/types/Modules/general.types";
import FilterBar from "@/components/FilterBar";
import useInstructorsQuery from '@/hook/useInstructorsQuery';
import { ENDPOINTS } from "@/Api/config/ConfigApi";
import EditLimitModal from "./EditLimitModal";
import useNotification from "@/hook/useNotification";
import NotificationModal from "@/components/NotificationModal";
import useAssignmentColor from '@/hook/useAssignmentColor';


/**
 * Props for ModalOtroInstructor component.
 * @typedef {Object} ModalOtroInstructorProps
 * @property {function} onClose - Function to close the modal
 * @property {function} onAssign - Function to assign the selected instructor
 */
interface ModalOtroInstructorProps {
    onClose: () => void;
    onAssign: (instructor: InstructorCustomList) => void;
}

/**
 * Modal for selecting and assigning a follow-up instructor.
 * Allows filtering, viewing, and editing instructor assignment limits.
 * @param {ModalOtroInstructorProps} props
 */
export default function ModalOtroInstructor({ onClose, onAssign }: ModalOtroInstructorProps) {
    // Note: search and area filters are handled by FilterBar -> fetchFilteredInstructors
    const [editLimitInstructor, setEditLimitInstructor] = useState<InstructorCustomList | null>(null);
    const [params, setParams] = useState<Record<string, string>>({});
    const { data: instructores = [], isFetching: loadingInstructors, refetch } = useInstructorsQuery(params);
    const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
    const [loading, setLoading] = useState(false);
    const { notification, showNotification, hideNotification } = useNotification();

    useEffect(() => {
        setLoading(true);
        getKnowledgeAreas()
            .then((areasData) => {
                setKnowledgeAreas(areasData);
            })
            .catch(() => {
                setKnowledgeAreas([]);
            })
            .finally(() => setLoading(false));
    }, []);

    /**
     * Fetches filtered instructors from the API based on search and filters.
     * @param {Record<string, string>} params - Filter parameters
     */
    // useFilteredInstructors hook provides fetchInstructors

    // Hook that returns a function to compute assignment colors dynamically
    const getAssignmentColor = useAssignmentColor();

    /**
     * Utility to get instructor's full name.
     * @param {InstructorCustomList} inst
     * @returns {string}
     */
    const getFullName = (inst: InstructorCustomList) => {
        if (inst.first_name || inst.second_name || inst.first_last_name || inst.second_last_name) {
            return `${inst.first_name || ""} ${inst.second_name || ""} ${inst.first_last_name || ""} ${inst.second_last_name || ""}`.replace(/ +/g, " ").trim();
        }
        return inst.name || "Sin nombre";
    };

    /**
     * Utility to get instructor's knowledge area name.
     * @param {InstructorCustomList} inst
     * @returns {string}
     */
    const getKnowledgeArea = (inst: InstructorCustomList) => {
        const ka = inst.knowledge_area;
        if (!ka) return "Sin especialidad";

        // Try to resolve by id first (handles cases where API returns an id like "1")
        const areaById = knowledgeAreas.find((a) => String(a.id) === String(ka));
        if (areaById) return areaById.name;

        // If no matching id, assume the field already contains the name
        return String(ka);
    };

    // No local filtering, only via API

    /**
     * Handles saving the new assignment limit for an instructor.
     * Shows notification and refreshes instructor list on success.
     * @param {number} newLimit - New assignment limit
     */
    const handleSaveLimit = async (newLimit: number) => {
        if (!editLimitInstructor) return;
        
        try {
            await patchInstructorLimit(editLimitInstructor.id, newLimit);
            
            // Refresh instructors using the query refetch
            await refetch();
            
            // Show success notification
            showNotification(
                'success',
                'Límite actualizado',
                'El límite de aprendices se ha actualizado correctamente.'
            );
        } catch (error: unknown) {
            // Extract error message from API
            let errorMessage = 'Error al actualizar el límite de aprendices';
            
            if (error instanceof Error && error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            // Re-throw error for modal handling
            throw new Error(errorMessage);
        }
    };

    // Query hook auto-fetches based on `params` state; nothing to run on mount.

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div
                className="w-full max-w-[996px] relative bg-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden z-[71] mx-4 sm:mx-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="select-instructor-dialog"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-7 h-7 absolute right-[22px] top-[22px] hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors z-10"
                    aria-label="Cerrar modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000" className="bi bi-x" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                    </svg>
                </button>

                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#22c55e" className="bi bi-person-fill-check w-8 h-8" viewBox="0 0 16 16">
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                            <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4" />
                        </svg>
                        <div>
                            <div id="select-instructor-dialog" className="text-black text-2xl font-extrabold leading-tight">Seleccionar instructor</div>
                            <div className="text-black text-base font-normal">Busca y selecciona un instructor disponible para el seguimiento</div>
                        </div>
                    </div>
                </div>
                

                                {/* Filters with FilterBar */}
                                <div className="p-6">
                                    <FilterBar
                                        onFilter={(p) => setParams(p)}
                                        inputWidth="100%"
                                        searchPlaceholder="Buscar por nombre o número de documento..."
                                        selects={[{
                                            name: 'knowledge_area_id',
                                            value: '',
                                            options: [
                                                { value: '', label: 'Todas las áreas' },
                                                ...knowledgeAreas.map((a: KnowledgeArea) => ({ value: String(a.id), label: a.name }))
                                            ],
                                            placeholder: 'Área de conocimiento'
                                        }]}
                                    />
                                </div>

                {/* Instructor list */}
                <div className="w-full px-4 py-6 max-h-[60vh] sm:max-h-[58vh] overflow-y-auto">
                    {instructores.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No se encontraron instructores
                        </div>
                    ) : (
                        instructores.map(inst => {
                            const assigned =  inst.assigned_learners || 0;
                            const max =  inst.max_assigned_learners || 80;
                            const colors = getAssignmentColor(assigned, max);
                            const nameFull = getFullName(inst);
                            const knowledge_area = getKnowledgeArea(inst);


                            return (
                                <div key={inst.id} className="relative rounded-[10px] border border-neutral-500 flex flex-col sm:flex-row items-center px-4 py-4 gap-4">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-200/90 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#22c55e" className="bi bi-person" viewBox="0 0 16 16">
                                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                                        </svg>
                                    </div>

                                    {/* Instructor information */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-black text-2xl font-semibold font-['Roboto'] leading-loose">
                                            {nameFull || "Sin nombre"}
                                        </div>
                                        {/* Knowledge area */}
                                        <div className="text-green-700 text-base font-semibold font-['Roboto'] leading-loose">
                                            {getKnowledgeArea(inst) || "Sin área de conocimiento"}
                                        </div>
                                        {inst.program && (
                                            <div className="text-neutral-500 text-sm font-normal font-['Roboto'] leading-tight">
                                                📚 {inst.program}
                                            </div>
                                        )}
                                        <div className="text-neutral-500 text-base font-normal font-['Roboto'] leading-loose">
                                            {inst.email || "Sin correo"}
                                        </div>
                                    </div>

                                    {/* Assigned badge */}
                                    <div className={`w-full sm:w-40 h-7 ${colors.bg} rounded-[20px] flex items-center justify-center sm:mr-6`}> 
                                        <div className={`${colors.text} text-base font-normal font-['Roboto']`}>
                                            {assigned}/{max} Asignados
                                        </div>
                                    </div>

                                    {/* Select button */}
                                    <button
                                        className="w-full sm:w-40 h-11 rounded-[10px] border-2 border-stone-300 hover:bg-gray-100"
                                        onClick={() => onAssign(inst)}
                                        type="button"
                                        aria-label={`Seleccionar instructor ${nameFull}`}
                                    >
                                        <div className="text-black text-xl font-medium font-['Roboto']">
                                            Seleccionar
                                        </div>
                                    </button>
                                    {/* Edit limit button */}
                                    <button
                                        className="ml-0 sm:ml-4 mt-2 sm:mt-0 px-3 py-2 rounded bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 font-semibold"
                                        onClick={() => setEditLimitInstructor(inst)}
                                        type="button"
                                        aria-label={`Editar límite de ${nameFull}`}
                                    >
                                        Editar límite
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {/* Modal for editing limit */}
            {editLimitInstructor && (
                <EditLimitModal
                    instructor={editLimitInstructor}
                    onClose={() => setEditLimitInstructor(null)}
                    onSave={handleSaveLimit}
                />
            )}
            
            {/* Notification modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </div>
    );
}
