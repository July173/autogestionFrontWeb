import React, { useState, useEffect } from "react";
import AssignTableView from "../components/assing/AssignTableView";
import FilterBar from "../components/FilterBar";
import ReloadButton from "../components/ReloadButton";
import { filterRequest } from "@/Api/Services/RequestAssignaton";
import { getPrograms } from "@/Api/Services/Program";
import { getModalityProductiveStages } from '@/Api/Services/ModalityProductiveStage';
import { AssignTableRow } from "@/Api/types/Modules/assign.types";

const estadoOptions = [
  { value: "ASIGNADO", label: "Asignado" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "SIN_ASIGNAR", label: "Sin asignar" },
  { value: "VERIFICANDO", label: "Verificando" },
  { value: "PRE-APROBADO", label: "Pre-aprobado" },

];


const Assign: React.FC = () => {
  const [rows, setRows] = useState<AssignTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalityOptions, setModalityOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Load programs dynamically
    getPrograms().then((programs: { id: number; nombre: string }[]) => {
      setProgramOptions([
        { value: "TODOS", label: "Todos los programas" },
        ...programs.map((p) => ({ value: String(p.id), label: p.nombre })),
      ]);
    });
    // Load modalities for filter
    getModalityProductiveStages().then((mods: { id: number; name_modality: string }[]) => {
      setModalityOptions([
        { value: 'TODOS', label: 'Todas las Modalidades' },
        ...mods.map(m => ({ value: String(m.id), label: m.name_modality }))
      ]);
    });
    // Load requests on startup
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const { getAllRequests } = await import("@/Api/Services/RequestAssignaton");
        const result = await getAllRequests();
        setRows(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Error al cargar solicitudes");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  // Exposed reload function to refresh the table after actions like reject/assign
  const reloadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const { getAllRequests } = await import("@/Api/Services/RequestAssignaton");
      const result = await getAllRequests();
      const mapped = result.map(r => ({
        ...r,
        nombre_modalidad: (r.nombre_modalidad && modalityOptions.find(m => String(m.value) === String(r.nombre_modalidad))?.label) || r.nombre_modalidad
      }));
      setRows(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al recargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      // Map filter names to backend
      const payload: Record<string, string> = {};
  if (params.search && params.search.trim() !== "") payload.search = params.search;
  if (params.programa && params.programa !== "TODOS") payload.program_id = params.programa;
  if (params.modalidad && params.modalidad !== "TODOS") payload.modality_id = params.modalidad;
  if (params.estado && params.estado !== "TODOS") payload.request_state = params.estado;
      // If no filters, load all requests
      if (Object.keys(payload).length === 0) {
        const { getAllRequests } = await import("@/Api/Services/RequestAssignaton");
        const result = await getAllRequests();
        setRows(result);
      } else {
        const result = await filterRequest(payload);
        const mapped = result.map(r => ({
          ...r,
          nombre_modalidad: (r.nombre_modalidad && modalityOptions.find(m => String(m.value) === String(r.nombre_modalidad))?.label) || r.nombre_modalidad
        }));
        setRows(mapped);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error al filtrar");
      } else {
        setError("Error al filtrar");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white relative rounded-[10px] w-full p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-semibold">Asignar seguimiento</h2>
        <div className="flex items-center gap-2">
          <ReloadButton onClick={reloadRows} title="Recargar" />
        </div>
      </div>
      <FilterBar
        onFilter={handleFilter}
        selects={[
          {
            name: "estado",
            value: "",
            options: estadoOptions,
            placeholder: "Todos los Estados",
            minWidth: '180px',
          },
           {
            name: 'modalidad',
            value: '',
            options: modalityOptions,
            placeholder: 'Modalidad',
            minWidth: '220px',
            maxWidth: '420px'
          },
           {
            name: "programa",
            value: "",
            options: programOptions,
            placeholder: "Programa",
            minWidth: '180px',
          }
        ]}
        inputWidth="100%"
        searchPlaceholder="Buscar por nombre, documento..."
      />
      <AssignTableView
        rows={rows}
        loading={loading}
        error={error}
        onAction={() => {}}
        onRefresh={reloadRows}
        actionLabel="Asignar"
      />
    </div>
  );
};

export default Assign;
