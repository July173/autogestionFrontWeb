import React, { useEffect, useState } from 'react';
import InstructorAssignmentsTable from '@/components/ApplicationEvaluation/InstructorAssignmentsTable';
import { getUserById } from '@/Api/Services/User';
import FilterBar from '@/components/FilterBar';
import ReloadButton from '@/components/ReloadButton';
import { getPrograms } from '@/Api/Services/Program';
import { getModalityProductiveStages } from '@/Api/Services/ModalityProductiveStage';
import UpdateStateModal from '@/components/Following/UpdateStateModal';

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

export const Following = () => {
  const [instructorId, setInstructorId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalityOptions, setModalityOptions] = useState<{ value: string; label: string }[]>([]);
  const [tableRefresh, setTableRefresh] = useState<(() => void) | null>(null);
  const [filters, setFilters] = useState<InstructorAssignmentFilters>({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

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

  // Load programs, modalities
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

  const actionRenderer = (row: any) => {
    const stateAsignation = row.state_asignation || '';
    
    // DEBUG: Ver el valor exacto
    console.log('=== RENDERIZANDO BOTÓN ===');
    console.log('state_asignation RAW:', row.state_asignation);
    console.log('state_asignation procesado:', stateAsignation);
    console.log('Tipo:', typeof stateAsignation);
    console.log('Largo:', stateAsignation.length);
    console.log('Comparación con "Concertación":', stateAsignation === 'Concertación');
    
    const getButtonConfig = () => {
      if (!stateAsignation || stateAsignation === '') {
        console.log('→ Botón: ASIGNADO (vacío)');
        return { label: 'Asignado', color: 'bg-orange-300 hover:bg-orange-400 text-white font-medium', disabled: false };
      }
      if (stateAsignation === 'Concertación') {
        console.log('→ Botón: CONCERTACIÓN');
        return { label: 'Concertación', color: 'bg-purple-500 hover:bg-purple-600 text-white font-medium', disabled: false };
      }
      if (stateAsignation === 'Visita parcial') {
        console.log('→ Botón: VISITA PARCIAL');
        return { label: 'Visita Parcial', color: 'bg-orange-600 hover:bg-orange-700 text-white font-bold', disabled: false };
      }
      if (stateAsignation === 'Visita final') {
        console.log('→ Botón: VISITA FINAL');
        return { label: 'Visita Final', color: 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold', disabled: true };
      }
      console.log('→ Botón: DESCONOCIDO');
      return { label: 'Desconocido', color: 'bg-gray-400 text-white font-medium', disabled: true };
    };

    const buttonConfig = getButtonConfig();

    const handleClick = () => {
      if (!buttonConfig.disabled) {
        // Debug: ver qué datos tiene row
        console.log('=== ROW DATA ===');
        console.log('numero_ficha:', row.numero_ficha);
        console.log('programa:', row.programa);
        console.log('date_start_production_stage:', row.date_start_production_stage);
        console.log('state_asignation:', row.state_asignation);
        console.log('Full row:', row);
        setSelectedRow(row);
        setShowUpdateModal(true);
      }
    };

    return (
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 ${buttonConfig.color} rounded text-sm transition-colors ${buttonConfig.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleClick}
          disabled={buttonConfig.disabled}
        >
          {buttonConfig.label}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white relative rounded-[10px] w-full p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Seguimientos</h1>
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

      {loading ? (
        <div className="text-gray-600">Cargando datos del usuario...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : instructorId ? (
        <>
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
            instructorId={instructorId}
            filterState="ASIGNADO"
            filters={filters}
            renderAction={actionRenderer}
            onRefreshReady={(refreshFn) => setTableRefresh(() => refreshFn)}
          />
        </>
      ) : (
        <div className="text-gray-600">No se encontró instructor asociado al usuario.</div>
      )}

      {/* Update State Modal */}
      {showUpdateModal && selectedRow && (
        <UpdateStateModal
          apprenticeData={{
            name: selectedRow.nombre || selectedRow.name || 'Sin nombre',
            number_identification: selectedRow.numero_identificacion || selectedRow.number_identificacion || 'N/A',
            tipo_identificacion: selectedRow.tipo_identificacion || 'N/A',
            file_number: selectedRow.numero_ficha || 'N/A',
            request_date: selectedRow.fecha_solicitud || 'N/A',
            date_start_production_stage: selectedRow.date_start_production_stage || 'N/A',
            program: selectedRow.programa || 'N/A',
            modalidad: selectedRow.modalidad || 'N/A',
          }}
          asignationInstructorId={selectedRow.asignation_instructor_id || selectedRow.id}
          currentState={selectedRow.state_asignation || ''}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedRow(null);
          }}
          onSuccess={() => {
            console.log('=== MODAL CERRADO, RECARGANDO TABLA ===');
            // Refresh table to update button state
            if (tableRefresh) {
              console.log('Ejecutando tableRefresh...');
              tableRefresh();
            } else {
              console.warn('tableRefresh NO está disponible');
            }
            setShowUpdateModal(false);
            setSelectedRow(null);
          }}
        />
      )}
    </div>
  );
};

export default Following;
