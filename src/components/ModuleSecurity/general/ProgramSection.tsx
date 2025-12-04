import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import { useGeneralData } from "../../../hook/useGeneralData";
import FilterBar from "../../FilterBar";
import LoadingOverlay from '../../LoadingOverlay';
import { filterPrograms } from "../../../Api/Services/Program";
import type { Program } from "../../../Api/types/Modules/general.types";

const cardsPerPage = 9;

interface ProgramSectionProps {
  open: boolean;
  onToggle: () => void;
}

/**
 * ProgramSection component for managing training programs.
 * Provides collapsible section with CRUD operations for programs including
 * creation, editing, enable/disable functionality, and pagination.
 * Uses generic modal forms and confirmation dialogs for all operations.
 */
const ProgramSection = ({ open, onToggle }: ProgramSectionProps) => {
  // Custom hook providing program data and CRUD operations
  const {
    programs,
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
    refreshPrograms,
  } = useGeneralData();

  // Pagination state for programs grid display
  const [programsPage, setProgramsPage] = useState(1);
  // Filter UI state
  const [displayedPrograms, setDisplayedPrograms] = useState<Program[]>(programs || []);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // Modal visibility states for program creation
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [pendingProgramData, setPendingProgramData] = useState<Partial<Program> | null>(null);
  const [showProgramConfirm, setShowProgramConfirm] = useState(false);
  // Modal visibility states for program editing
  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const [showEditProgram, setShowEditProgram] = useState(false);
  const [pendingEditProgram, setPendingEditProgram] = useState<Partial<Program> | null>(null);
  const [showEditProgramConfirm, setShowEditProgramConfirm] = useState(false);
  // Modal visibility states for disable/enable confirmation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<Program | null>(null);

  // Global notification modal states
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success'|'info'|'warning'|'password-changed'|'email-sent'|'pending'|'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Helper to safely extract error message without using `any`
  const extractErrorMessage = (err: unknown, fallback = ''): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    return String(err ?? fallback);
  };

  useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedPrograms(programs || []);
    }
  }, [programs, filtering, search, activeFilter]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedPrograms(programs || []);
        setProgramsPage(1);
        return;
      }
      const data = await filterPrograms({ search: s, active: a });
      setDisplayedPrograms(data || []);
      setProgramsPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * Opens the create program modal
   */
  const handleAddProgram = () => setShowProgramModal(true);

  /**
   * Prepares program data and shows confirmation modal for creation
   * @param values - Form field values from create modal
   */
  const handleSubmitProgram = (values: Partial<Program>) => {
    setPendingProgramData(values);
    setShowProgramConfirm(true);
  };

  /**
   * Confirms and executes program creation via API
   */
  const handleConfirmProgram = async () => {
    setActionLoading(true);
    try {
      if (!pendingProgramData) throw new Error('No hay datos de programa');
      await createProgram(pendingProgramData as Partial<Program>);
      setShowProgramModal(false);
      setShowProgramConfirm(false);
      setPendingProgramData(null);
      await refreshPrograms();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Programa creado correctamente.');
      setNotifOpen(true);
    } catch (err) {
  setNotifType('warning');
  setNotifTitle('Error');
  setNotifMessage(extractErrorMessage(err, 'Error al crear programa'));
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Prepares program data for editing and opens edit modal
   * @param program - Program object to edit
   */
  const handleEdit = (program: Program) => {
    setEditProgram(program);
    setShowEditProgram(true);
  };

  /**
   * Prepares edited program data and shows confirmation modal
   * @param values - Form field values from edit modal
   */
  const handleSubmitEditProgram = (values: Partial<Program>) => {
    setPendingEditProgram(values);
    setShowEditProgramConfirm(true);
  };

  /**
   * Confirms and executes program update via API
   */
  const handleConfirmEditProgram = async () => {
    setActionLoading(true);
    try {
      if (!editProgram) throw new Error('No se seleccionó el programa');
      await updateProgram(editProgram.id, pendingEditProgram as Partial<Program>);
      setShowEditProgram(false);
      setShowEditProgramConfirm(false);
      setPendingEditProgram(null);
      setEditProgram(null);
      await refreshPrograms();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Programa actualizado correctamente.');
      setNotifOpen(true);
    } catch (err) {
  setNotifType('warning');
  setNotifTitle('Error');
  setNotifMessage(extractErrorMessage(err, 'Error al actualizar programa'));
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Prepares program data for disable/enable and shows confirmation modal
   * @param program - Program object to toggle active status
   */
  const handleToggle = (program: Program) => {
    setPendingDisable(program);
    setShowDisableConfirm(true);
  };

  /**
   * Confirms and executes program disable/enable toggle via API
   */
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      if (!pendingDisable) throw new Error('No se seleccionó el programa');
      await deleteProgram(pendingDisable.id);
      setShowDisableConfirm(false);
      setPendingDisable(null);
      await refreshPrograms();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Programa deshabilitado correctamente.');
      setNotifOpen(true);
    } catch (err) {
  setNotifType('warning');
  setNotifTitle('Error');
  setNotifMessage(extractErrorMessage(err, 'Error al deshabilitar programa'));
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading and error states
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    // Main container with collapsible section styling
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || filtering || actionLoading)} message={actionLoading ? 'Procesando...' : (filtering ? 'Filtrando...' : 'Cargando...')} />
      {/* Collapsible header button with title and record count */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Programas</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {displayedPrograms.length} registros
          </span>
        </div>
        {/* Chevron icon indicating open/closed state */}
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {/* Expandable content section */}
      {open && (
        <>
          {/* Filter + Action bar with add program button */}
          <div className="flex flex-col gap-4 mb-6 px-6 pt-6">
            <div>
              <FilterBar
                onFilter={(params) => { setSearch(params.search ?? ''); setActiveFilter(params.active ?? ''); handleFilter(params); }}
                inputWidth="520px"
                searchPlaceholder="Buscar por nombre"
                selects={[{
                  name: 'active',
                  value: activeFilter,
                  options: [
                    { value: 'true', label: 'Activos' },
                    { value: 'false', label: 'Inactivos' }
                  ],
                  placeholder: 'Todos',
                }]}
              />
            </div>
            <div className="flex items-center gap-4 justify-between">
              <button onClick={handleAddProgram} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg">
                <Plus className="w-4 h-4" /> Agregar Programa
              </button>
            </div>
          </div>
          {/* Programs grid with responsive layout */}
          <div className={`p-6 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedPrograms.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No se encontraron programas con esta búsqueda' : 'No hay programas disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Map through paginated programs to create program cards */}
                {displayedPrograms.slice((programsPage - 1) * cardsPerPage, programsPage * cardsPerPage).map((program: Program) => (
                  // Individual program card
                  <div key={program.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                    {/* Program header with name/description and status badge */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{program.name || `Programa ${program.code_program}`}</h3>
                        {program.description && <p className="text-sm text-gray-600 mt-1">{program.description}</p>}
                      </div>
                      {/* Active/inactive status indicator */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${program.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{program.active ? "Activo" : "Inactivo"}</div>
                    </div>
                    {/* Action buttons for edit and toggle active status */}
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(program)} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
                      <button onClick={() => handleToggle(program)} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${program.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{program.active ? "Deshabilitar" : "Habilitar"}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Edit program modal with form fields */}
            <ModalFormGeneric
              isOpen={showEditProgram}
              title="Editar Programa"
              fields={[
                { label: "Nombre del Programa", name: "name", type: "text", placeholder: "Ingrese el nombre del programa", required: true },
                { label: "Código del Programa", name: "code_program", type: "text", placeholder: "Ingrese el código del programa", required: true },
                { label: "Descripción", name: "description", type: "text", placeholder: "Ingrese una descripción", required: true, maxLength: 100 },
              ]}
              onClose={() => { setShowEditProgram(false); setEditProgram(null); setPendingEditProgram(null); }}
              onSubmit={handleSubmitEditProgram}
              submitText="Actualizar Programa"
              cancelText="Cancelar"
              initialValues={editProgram || {}}
              customRender={undefined}
              onProgramChange={undefined}
            />
            {/* Confirmation modal for program edit */}
            <ConfirmModal
              isOpen={showEditProgramConfirm}
              title="¿Confirmar actualización de programa?"
              message="¿Estás seguro de que deseas actualizar este programa?"
              confirmText="Sí, actualizar programa"
              cancelText="Cancelar"
              onConfirm={handleConfirmEditProgram}
              onCancel={() => { setShowEditProgramConfirm(false); setPendingEditProgram(null); }}
            />
            {/* Confirmation modal for disable/enable toggle */}
            <ConfirmModal
              isOpen={showDisableConfirm}
              title="¿Confirmar acción?"
              message="¿Estás seguro de que deseas deshabilitar este programa?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }}
            />
          </div>
          {/* Pagination component when multiple pages exist */}
          {Math.ceil(displayedPrograms.length / cardsPerPage) > 1 && (
            <Paginator
              page={programsPage}
              totalPages={Math.ceil(displayedPrograms.length / cardsPerPage)}
              onPageChange={setProgramsPage}
              className="mt-4 px-6"
            />
          )}

          {/* Create program modal with form fields */}
          <ModalFormGeneric
            isOpen={showProgramModal}
            title="Agregar Programa"
            fields={[
              { label: "Nombre del Programa", name: "name", type: "text", placeholder: "Ingrese el nombre del programa", required: true },
              { label: "Código del Programa", name: "code_program", type: "text", placeholder: "Ingrese el código del programa", required: true },
              { label: "Descripción", name: "description", type: "text", placeholder: "Ingrese una descripción", required: true, maxLength: 100 },
            ]}
            onClose={() => setShowProgramModal(false)}
            onSubmit={handleSubmitProgram}
            submitText="Registrar Programa"
            cancelText="Cancelar"
            customRender={undefined}
            onProgramChange={undefined}
          />
          {/* Confirmation modal for program creation */}
          <ConfirmModal
            isOpen={showProgramConfirm}
            title="¿Confirmar registro de programa?"
            message="¿Estás seguro de que deseas crear este programa?"
            confirmText="Sí, crear programa"
            cancelText="Cancelar"
            onConfirm={handleConfirmProgram}
            onCancel={() => {
              setShowProgramConfirm(false);
              setPendingProgramData(null);
            }}
          />
          {/* Global notification modal for success/error messages */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
}

export default ProgramSection;
