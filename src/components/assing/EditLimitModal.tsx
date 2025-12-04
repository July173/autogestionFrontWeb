import React, { useState } from "react";
import { InstructorCustomList } from "@/Api/types/entities/instructor.types";
import useAssignmentColor from '@/hook/useAssignmentColor';

interface EditLimitModalProps {
    instructor: InstructorCustomList;
    onClose: () => void;
    onSave: (newLimit: number) => Promise<void>;
}

export default function EditLimitModal({ instructor, onClose, onSave }: EditLimitModalProps) {
    const [newLimit, setNewLimit] = useState( instructor.max_assigned_learners || 80);
    const minLimit = ( instructor.assigned_learners || 0) + 10;
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getNombreCompleto = () => {
        if (instructor.first_name || instructor.second_name || instructor.first_last_name || instructor.second_last_name) {
            return `${instructor.first_name || ""} ${instructor.second_name || ""} ${instructor.first_last_name || ""} ${instructor.second_last_name || ""}`.replace(/ +/g, " ").trim();
        }
        return instructor.name || "Sin nombre";
    };

    const getAssignmentColor = useAssignmentColor();
    const assigned = instructor.assigned_learners || 0;
    const colors = getAssignmentColor(assigned, newLimit);

    const handleSave = async () => {
        if (newLimit < minLimit) {
            setError(`El límite mínimo es ${minLimit} (asignados + 10 de margen)`);
            return;
        }
        
        setError(null);
        setLoading(true);
        
        try {
            await onSave(newLimit);
            onClose();
        } catch (err) {
            let errorMessage = 'Error al actualizar el límite';
            
            if (err instanceof Error && err.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
            <div className="bg-white rounded-[16px] shadow-lg max-w-md w-full mx-4 p-7 relative z-10 border border-green-300">
                <div className="flex items-center gap-3 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#22c55e" className="bi bi-person-fill-check" viewBox="0 0 16 16">
                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                        <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4" />
                    </svg>
                    <h2 className="text-2xl font-bold text-green-700">Ajustar límite de aprendices</h2>
                </div>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <p className="font-semibold text-lg mb-2 text-green-900">{getNombreCompleto()}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm items-center">
                        <div>
                            <p className="text-gray-600">Asignados actualmente:</p>
                            <div className="mt-1">
                                <div className={`inline-flex items-center gap-3`}> 
                                    <div className={`w-36 h-8 ${colors.bg} rounded-[20px] flex items-center justify-center`}> 
                                        <div className={`${colors.text} text-base font-bold`}>{assigned}/{newLimit} Asignados</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600">Límite actual:</p>
                            <p className="font-bold text-xl">
                                { instructor.max_assigned_learners || 80}
                            </p>
                        </div>
                    </div>
                </div>
                <label className="block text-sm font-semibold mb-2 text-green-700">Nuevo límite</label>
                <input
                    type="number"
                    min={minLimit}
                    max={200}
                    value={newLimit}
                    onChange={e => setNewLimit(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg text-lg font-bold text-center focus:outline-green-400"
                    disabled={loading}
                />
                <input
                    type="range"
                    min={minLimit}
                    max={200}
                    value={newLimit}
                    onChange={e => setNewLimit(Number(e.target.value))}
                    className="w-full mt-2 accent-green-500"
                    disabled={loading}
                />
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-3 mt-4 rounded text-red-800">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                <div className="flex gap-3 justify-end mt-8">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2 border rounded-lg hover:bg-gray-100 font-semibold"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center gap-2"
                        disabled={!!error || loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
