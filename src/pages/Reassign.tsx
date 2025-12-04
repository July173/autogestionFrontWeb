import React, { useEffect, useState } from "react";
import AssignTableView from "../components/assing/AssignTableView";
import FilterBar from "../components/FilterBar";
import ReloadButton from "../components/ReloadButton";
import { filterRequest } from "@/Api/Services/RequestAssignaton";
import { getPrograms } from "@/Api/Services/Program";
import { getModalityProductiveStages } from '@/Api/Services/ModalityProductiveStage';
import { AssignTableRow } from '@/Api/types/Modules/assign.types';
import ModalReasignarInstructor from '@/components/Reassign/ModalReasignarInstructor';
import { reassignInstructor } from '@/Api/Services/AssignationInstructor';

const Reassign: React.FC = () => {
  const [rows, setRows] = useState<AssignTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalityOptions, setModalityOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedRow, setSelectedRow] = useState<AssignTableRow | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);

  useEffect(() => {
    // Load programs and modalities
    getPrograms().then((programs: { id: number; nombre: string }[]) => {
      setProgramOptions([
        { value: 'TODOS', label: 'Todos los programas' },
        ...programs.map(p => ({ value: String(p.id), label: p.nombre }))
      ]);
    }).catch(() => {});

    getModalityProductiveStages().then((mods: { id: number; name_modality: string }[]) => {
      setModalityOptions([
        { value: 'TODOS', label: 'Todas las Modalidades' },
        ...mods.map(m => ({ value: String(m.id), label: m.name_modality }))
      ]);
    }).catch(() => {});

    // Load initial rows filtered by ASIGNADO
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await filterRequest({ request_state: 'ASIGNADO' });
        const mapped = (result || []).map((r: any) => ({
          ...r,
          nombre_modalidad: (r.nombre_modalidad && modalityOptions.find(m => String(m.value) === String(r.nombre_modalidad))?.label) || r.nombre_modalidad
        }));
        setRows(mapped as AssignTableRow[]);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Error al cargar reasignaciones');
      } finally {
        setLoading(false);
      }
    };

    // load after initial render; modalityOptions may still be empty but mapping will update on reload
    loadInitial();
  }, []);

  const reloadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await filterRequest({ request_state: 'ASIGNADO' });
      const mapped = (result || []).map((r: any) => ({
        ...r,
        nombre_modalidad: (r.nombre_modalidad && modalityOptions.find(m => String(m.value) === String(r.nombre_modalidad))?.label) || r.nombre_modalidad
      }));
      setRows(mapped as AssignTableRow[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Error al recargar reasignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, string> = { request_state: 'ASIGNADO' };
      if (params.search && params.search.trim() !== '') payload.search = params.search;
      if (params.programa && params.programa !== 'TODOS') payload.program_id = params.programa;
      if (params.modalidad && params.modalidad !== 'TODOS') payload.modality_id = params.modalidad;
      if (params.estado && params.estado !== 'TODOS') payload.request_state = params.estado; // allow override but default is ASIGNADO

      const result = await filterRequest(payload);
      const mapped = (result || []).map((r: any) => ({
        ...r,
        nombre_modalidad: (r.nombre_modalidad && modalityOptions.find(m => String(m.value) === String(r.nombre_modalidad))?.label) || r.nombre_modalidad
      }));
      setRows(mapped as AssignTableRow[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Error al filtrar reasignaciones');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white relative rounded-[10px] w-full p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-semibold">Reasignar seguimiento</h2>
        <div className="flex items-center gap-2">
          <ReloadButton onClick={reloadRows} title="Recargar" />
        </div>
      </div>

      <FilterBar
        onFilter={handleFilter}
        selects={[
          {
            name: 'modalidad',
            value: '',
            options: modalityOptions,
            placeholder: 'Modalidad',
            minWidth: '220px',
            maxWidth: '420px'
          },
          { name: 'programa', value: '', options: programOptions, placeholder: 'Programa' }
        ]}
        inputWidth="100%"
        searchPlaceholder="Buscar por nombre, documento..."
      />

      <AssignTableView
        rows={rows}
        loading={loading}
        error={error}
        onAction={(row) => {
          setSelectedRow(row);
          setShowReassignModal(true);
        }}
        onRefresh={reloadRows}
        actionLabel="Reasignar"
        showReassignForAssigned={true}
      />

      {showReassignModal && selectedRow && (
        <ModalReasignarInstructor
          onCancel={() => setShowReassignModal(false)}
          requestRow={selectedRow}
          onReassign={async (payload) => {
            // call service and refresh table on success
            try {
              await reassignInstructor(payload);
              setShowReassignModal(false);
              setSelectedRow(null);
              // refresh rows
              reloadRows();
            } catch (err) {
              // bubble up or ignore - modal shows errors
              console.error('Error reassigning instructor', err);
            }
          }}
        />
      )}
    </div>
  );
};

export default Reassign;
