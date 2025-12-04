import React, { useState } from "react";
import ModalAsignar from "./ModalAssign";
import ModalPreApprove from "./ModalPreApprove";
import { getFormRequestById } from "@/Api/Services/RequestAssignaton";

/**
 * Apprentice data structure for assignment modal.
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
 * Props for the AssignButton component.
 */
interface AssignButtonProps {
  state?: "Asignar" | "Asignado" | "Rechazado" | "Verificando" | "PreAprobado";
  onClick?: () => void;
  requestId?: number;
  onAssignmentComplete?: () => void;
  instructorName?: string;
  instructorId?: number;
}

const AssignButton: React.FC<AssignButtonProps> = ({ state = "Asignar", onClick, requestId, onAssignmentComplete, instructorName, instructorId }) => {
  const [showModal, setShowModal] = useState(false);
  const [apprenticeData, setApprenticeData] = useState<ApprenticeData | null>(null);
  const [loading, setLoading] = useState(false);
  let style = "border-2 border-[#a39f9f] h-8 w-full sm:w-[90px] rounded-[10px] flex items-center justify-center relative cursor-pointer";
  let text = "text-black";
  const bg = "bg-transparent";
  let label: string = state;

  if (state === "Asignado") {
    style = "bg-[#7bcc7f] border border-[#c0fbcd] h-8 w-full sm:w-[90px] rounded-[10px] flex items-center justify-center relative cursor-default";
    text = "text-[#0c672d]";
    label = "Asignado";
  } else if (state === "Rechazado") {
    style = "bg-[#fb8383] border border-[#773939] h-8 w-full sm:w-[90px] rounded-[10px] flex items-center justify-center relative cursor-default";
    text = "text-[#5c1515]";
    label = "Rechazado";
  } else if (state === "Verificando") {
    style = "bg-amber-100 border border-amber-300 h-8 w-full sm:w-[100px] rounded-[10px] flex items-center justify-center relative cursor-default";
    text = "text-amber-800";
    label = "Verificando";
  } else if (state === "PreAprobado") {
    // blue button for PRE-APROBADO
    style = "bg-blue-100 border border-blue-300 h-9 w-full sm:w-[120px] rounded-[10px] flex items-center justify-center relative cursor-pointer hover:bg-blue-200";
    text = "text-blue-800";
    label = "Pre-Aprobado";
  }

  const handleClick = async () => {
    if (!requestId) return;
    // Open assign modal when state is 'Asignar'
    if (state === "Asignar") {
      setLoading(true);
      try {
        const res = await getFormRequestById(requestId);
        const d = res.data;
        setApprenticeData({
          name: d.name_apprentice,
          type_identification: d.type_identification,
          number_identification: d.number_identification,
          // The API maps the file number as 'numero_ficha' (or 'ficha'). Prefer that field.
          file_number: d.numero_ficha ? String(d.numero_ficha) : (d.ficha ? String(d.ficha) : ""),
          date_start_production_stage: d.date_start_production_stage,
          program: d.program,
          request_date: d.request_date,
          request_id: requestId,
          modality_productive_stage: d.modality_productive_stage ?? d.modality ?? undefined,
        });
        setShowModal(true);
      } catch (e) {
        setApprenticeData(null);
      } finally {
        setLoading(false);
      }
      if (onClick) onClick();
      return;
    }

    // Open pre-approval modal when state is 'PreAprobado'
    if (state === "PreAprobado") {
      setLoading(true);
      try {
        // Fetch only the form detail
        const formResp = await getFormRequestById(requestId);
        const d = formResp.data;
        setApprenticeData({
          name: d.name_apprentice,
          type_identification: d.type_identification,
          number_identification: d.number_identification,
          file_number: d.numero_ficha ? String(d.numero_ficha) : (d.ficha ? String(d.ficha) : ""),
          date_start_production_stage: d.date_start_production_stage,
          program: d.program,
          request_date: d.request_date,
          request_id: requestId,
          modality_productive_stage: d.modality_productive_stage ?? d.modality ?? undefined,
        });
        setShowModal(true);
      } catch (e) {
        setApprenticeData(null);
      } finally {
        setLoading(false);
      }
      if (onClick) onClick();
      return;
    }
  };

  // State update simulation (should call the real endpoint)
  const handleReject = async () => {
    // Here you should call the patchDenialRequest endpoint with the id
    // await patchDenialRequest(requestId)
    setShowModal(false);
    // Optional: show notification or refresh data
  };

  return (
    <>
      <button
        className={style}
        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}
        onClick={handleClick}
        // Allow clicks when state is 'Asignar' or 'PreAprobado'. Disable only while loading or when state is a non-interactive final state.
        disabled={loading || state === "Asignado" || state === "Rechazado" || state === "Verificando"}
        data-node-id={state === "Asignar" ? "823:13305" : state === "Asignado" ? "823:13205" : state === "Rechazado" ? "823:13209" : "823:13210"}
      >
        <span className={`text-[14px] leading-[32px] ${text}`}>{loading ? "Cargando..." : label}</span>
      </button>
      {showModal && apprenticeData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.stopPropagation()} // prevent overlay clicks from reaching the table
        >
          <div className="relative">
            {state === 'PreAprobado' ? (
              <ModalPreApprove
                apprentice={apprenticeData}
                onClose={() => setShowModal(false)}
                onAssignmentComplete={onAssignmentComplete}
                assignedInstructor={instructorName ? { name: instructorName, id: instructorId } : null}
              />
            ) : (
              <ModalAsignar
                apprentice={apprenticeData}
                onClose={() => setShowModal(false)}
                onReject={handleReject}
                onAssignmentComplete={onAssignmentComplete}
              />
            )}
            <button
              className="absolute top-2 right-2 bg-gray-200 rounded-full px-3 py-1 text-black text-sm font-bold shadow hover:bg-gray-300"
              onClick={() => setShowModal(false)}
              title="Cerrar"
            >
              X
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignButton;
