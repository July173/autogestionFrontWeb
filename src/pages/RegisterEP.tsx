import React, { useState, useEffect } from 'react';
import OperatorRegisterTable from '@/components/OperadorEP/OperatorRegisterTable';
import FilterBar from '@/components/FilterBar';
import ReloadButton from '@/components/ReloadButton';
import { filterRequest, getAllRequests } from '@/Api/Services/RequestAssignaton';
import { getPrograms } from '@/Api/Services/Program';
import { getModalityProductiveStages } from '@/Api/Services/ModalityProductiveStage';
import { AssignTableRow } from '@/Api/types/Modules/assign.types';

export const RegisterEP = () => {
  const [rows, setRows] = useState<AssignTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalityOptions, setModalityOptions] = useState<{ value: string; label: string }[]>([]);

  // Load programs, modalities and initial filtered rows
  useEffect(() => {
    // Load programs dynamically
    getPrograms().then((programs: { id: number; nombre: string }[]) => {
      setProgramOptions([
        { value: 'TODOS', label: 'Todos los programas' },
        ...programs.map((p) => ({ value: String(p.id), label: p.nombre })),
      ]);
    });

    // Load modalities for filter
    getModalityProductiveStages().then((mods: { id: number; name_modality: string }[]) => {
      setModalityOptions([
        { value: 'TODOS', label: 'Todas las Modalidades' },
        ...mods.map((m) => ({ value: String(m.id), label: m.name_modality })),
      ]);
    });

    // Load initial data
    loadFilteredData();
  }, []);

  /**
   * Filtra las solicitudes para mostrar solo:
   * - Estado ASIGNADO
   * - Modalidad diferente a "Contrato de Aprendizaje"
   */
  const filterRowsForOperator = (data: AssignTableRow[]): AssignTableRow[] => {
    return data.filter((row) => {
      // Solo estado ASIGNADO
      const state = String(row.request_state || '').toUpperCase();
      if (state !== 'ASIGNADO') return false;

      // Excluir "Contrato de Aprendizaje"
      const modalidad = String(row.nombre_modalidad || '').toLowerCase();
      if (
        modalidad.includes('contrato') &&
        (modalidad.includes('aprendizaje') || modalidad.includes('aprendiz'))
      ) {
        return false;
      }

      return true;
    });
  };

  const loadFilteredData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allData = await getAllRequests();
      const filtered = filterRowsForOperator(allData);
      setRows(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const reloadRows = async () => {
    await loadFilteredData();
  };

  const handleFilter = async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      // Build payload for backend filter
      const payload: Record<string, string> = {};

      if (params.search && params.search.trim() !== '') payload.search = params.search;
      if (params.programa && params.programa !== 'TODOS') payload.program_id = params.programa;
      if (params.modalidad && params.modalidad !== 'TODOS') payload.modality_id = params.modalidad;
      
      // Always filter by ASIGNADO state
      payload.request_state = 'ASIGNADO';

      let result: AssignTableRow[];

      if (Object.keys(payload).length === 1 && payload.request_state) {
        // Only state filter, use getAllRequests
        const allData = await getAllRequests();
        result = allData;
      } else {
        // Apply filters
        result = await filterRequest(payload);
      }

      // Apply local filtering for operator (exclude contrato de aprendizaje)
      const filtered = filterRowsForOperator(result);
      setRows(filtered);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error al filtrar');
      } else {
        setError('Error al filtrar');
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white relative rounded-[10px] size-full p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Registro Etapa Productiva</h2>
          <p className="text-sm text-gray-600 mt-1">
            Registra la carga exitosa de aprendices en SOFÍA Plus (excluye Contrato de Aprendizaje)
          </p>
        </div>
        <div>
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
            minWidth: '320px',
            maxWidth: '420px',
          },
          {
            name: 'programa',
            value: '',
            options: programOptions,
            placeholder: 'Programa',
          },
        ]}
        inputWidth="calc(100% - 420px)"
        searchPlaceholder="Buscar por nombre, documento..."
      />

      <OperatorRegisterTable rows={rows} loading={loading} error={error} onRefresh={reloadRows} />
    </div>
  );
};

export default RegisterEP;
