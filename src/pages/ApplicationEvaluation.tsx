import React, { useEffect, useState } from 'react';
import InstructorAssignmentsTable from '@/components/ApplicationEvaluation/InstructorAssignmentsTable';
import { getUserById } from '@/Api/Services/User';
import FilterBar from '@/components/FilterBar';
import ReloadButton from '@/components/ReloadButton';
import { getPrograms } from '@/Api/Services/Program';
import { getModalityProductiveStages } from '@/Api/Services/ModalityProductiveStage';

const estadoOptions = [
  { value: 'ASIGNADO', label: 'Asignado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'SIN_ASIGNAR', label: 'Sin asignar' },
  { value: 'VERIFICANDO', label: 'Verificando' },
  { value: 'PRE-APROBADO', label: 'Pre-aprobado' },
];

interface InstructorAssignmentFilters {
  apprentice_name?: string;
  apprentice_id_number?: string;
  modality_name?: string;
  program_name?: string;
  request_state?: string;
}

export const ApplicationEvaluation = () => {
  const [instructorId, setInstructorId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalityOptions, setModalityOptions] = useState<{ value: string; label: string }[]>([]);
  const [tableRefresh, setTableRefresh] = useState<(() => void) | null>(null);
  const [filters, setFilters] = useState<InstructorAssignmentFilters>({});

  useEffect(() => {
    const loadInstructorFromStorage = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = localStorage.getItem('user_dashboard');
        if (!raw) {
          setError('No hay información de usuario en localStorage (user_dashboard)');
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(raw);
        const userId = parsed?.id;
        if (!userId) {
          setError('ID de usuario no encontrado en localStorage');
          setLoading(false);
          return;
        }

        const user = await getUserById(userId);
        // El endpoint devuelve user.instructor con la estructura mostrada por el backend
        const instructor = user?.instructor;
        if (instructor && instructor.id) {
          setInstructorId(Number(instructor.id));
        } else {
          setError('El usuario no tiene un instructor asociado');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Error al obtener datos de usuario');
      } finally {
        setLoading(false);
      }
    };

    loadInstructorFromStorage();
  }, []);

  // Load programs, modalities and initial rows (similar to Assign page)
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const programs = await getPrograms();
        setProgramOptions([
          { value: 'TODOS', label: 'Todos los programas' },
          ...programs.map((p: { id: number; nombre: string }) => ({ value: String(p.id), label: p.nombre }))
        ]);
      } catch (err) {
        // ignore
      }

      try {
        const mods = await getModalityProductiveStages();
        setModalityOptions([
          { value: 'TODOS', label: 'Todas las Modalidades' },
          ...(Array.isArray(mods) ? mods.map((m: { id: number; name_modality: string }) => ({ value: String(m.id), label: m.name_modality })) : [])
        ]);
      } catch (err) {
        // ignore
      }
    };

    loadAssets();
  }, []);

  // Handle filter changes
  const handleFilter = (params: Record<string, string>) => {
    const newFilters: InstructorAssignmentFilters = {};
    
    // Search by name or document number
    if (params.search && params.search.trim() !== '') {
      const searchValue = params.search.trim();
      // Detect if the search is a number (document ID) or text (name)
      // If it's all digits, treat it as ID number; otherwise as name
      if (/^\d+$/.test(searchValue)) {
        newFilters.apprentice_id_number = searchValue;
      } else {
        newFilters.apprentice_name = searchValue;
      }
    }
    
    // Program filter - use programa_label directly from FilterBar (ProgramAutocomplete's label)
    if (params.programa && params.programa !== 'TODOS') {
      // Use the label sent directly from FilterBar
      if (params.programa_label && params.programa_label !== 'Todos los programas') {
        newFilters.program_name = params.programa_label;
      }
    }
    
    // Modality filter
    if (params.modalidad && params.modalidad !== 'TODOS') {
      // Find modality name from options
      const modalityOption = modalityOptions.find(m => m.value === params.modalidad);
      if (modalityOption && modalityOption.label) {
        newFilters.modality_name = modalityOption.label;
      }
    }
    
    // State filter
    if (params.estado && params.estado !== 'TODOS') {
      newFilters.request_state = params.estado;
    }
    
    setFilters(newFilters);
  };

  return (
    <div className="bg-white relative rounded-[10px] w-full p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Asignaciones para valoración previa</h1>
        <div>
          <ReloadButton
            onClick={() => {
              if (tableRefresh) {
                tableRefresh();
              }
            }}
            title="Recargar"
          />
        </div>
      </div>

      <FilterBar
        onFilter={handleFilter}
        selects={[
          {
            name: 'estado',
            value: '',
            options: estadoOptions,
            placeholder: 'Todos los Estados',
          },
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

      <InstructorAssignmentsTable
        instructorId={instructorId ?? 0}
        filterState="ALL"
        filters={filters}
        onRefreshReady={(refreshFn) => setTableRefresh(() => refreshFn)}
      />
    </div>
  );
};

export default ApplicationEvaluation;

