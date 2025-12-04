import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import { useGeneralData } from "../../../hook/useGeneralData";
import type { KnowledgeArea } from "../../../Api/types/Modules/general.types";
import FilterBar from "../../FilterBar";
import { filterKnowledgeAreas } from "../../../Api/Services/KnowledgeArea";
import LoadingOverlay from '../../LoadingOverlay';

const cardsPerPage = 9;

/**
 * Props for KnowledgeAreaSection component
 */
interface KnowledgeAreaSectionProps {
  /** Whether the section is expanded */
  open: boolean;
  /** Callback to toggle section visibility */
  onToggle: () => void;
}

/**
 * KnowledgeAreaSection component for managing knowledge areas (áreas de conocimiento)
 * Displays a collapsible section with knowledge areas in a paginated grid
 * Supports CRUD operations: create, read, update, delete knowledge areas
 * Knowledge areas represent different fields of study or expertise domains
 */
const KnowledgeAreaSection = ({ open, onToggle }: KnowledgeAreaSectionProps) => {
  // Custom hook for general data management (knowledge areas)
  const {
    knowledgeAreas,
    loading,
    error,
    createKnowledgeArea,
    updateKnowledgeArea,
    deleteKnowledgeArea,
    refreshAreas,
  } = useGeneralData();

  // Pagination state for knowledge areas grid
  const [areasPage, setAreasPage] = useState(1);
  const [displayedAreas, setDisplayedAreas] = useState<KnowledgeArea[]>(knowledgeAreas || []);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // sync displayedAreas when underlying data changes only when not filtering
    // and there are no active filter inputs — avoid overwriting server-filtered results
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedAreas(knowledgeAreas || []);
    }
  }, [knowledgeAreas, filtering]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedAreas(knowledgeAreas || []);
        return;
      }
      const data = await filterKnowledgeAreas({ search: s, active: a });
      setDisplayedAreas(data || []);
      setAreasPage(1);
    } catch (e) {
      // console.error(e);
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  // Modal states for adding knowledge areas
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [pendingAreaData, setPendingAreaData] = useState<Omit<KnowledgeArea, "id" | "active"> | null>(null);
  const [showAreaConfirm, setShowAreaConfirm] = useState(false);

  // Modal states for editing knowledge areas
  const [editArea, setEditArea] = useState<KnowledgeArea | null>(null);
  const [showEditArea, setShowEditArea] = useState(false);
  const [pendingEditArea, setPendingEditArea] = useState<Partial<KnowledgeArea> | null>(null);
  const [showEditAreaConfirm, setShowEditAreaConfirm] = useState(false);

  // Modal states for disabling knowledge areas
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<KnowledgeArea | null>(null);

  // Removed internal open state

  /**
   * InfoCard component for displaying individual knowledge area information
   * Shows area name, description, and action buttons for edit/toggle operations
   */
  const InfoCard = ({ title, subtitle, isActive, onEdit, onToggle }: {
    title: string;
    subtitle?: string;
    isActive: boolean;
    onEdit: () => void;
    onToggle: () => void;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {/* Status indicator showing active/inactive state */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{isActive ? "Activo" : "Inactivo"}</div>
      </div>
      <div className="flex gap-2">
        {/* Edit button to modify knowledge area details */}
        <button onClick={onEdit} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        {/* Toggle button to enable/disable knowledge area */}
        <button onClick={onToggle} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${isActive ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{isActive ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  // Handler functions for add operations
  const handleAddArea = () => setShowAreaModal(true);
  const handleSubmitArea = (values: Omit<KnowledgeArea, "id" | "active">) => {
    setPendingAreaData(values);
    setShowAreaConfirm(true);
  };
  const handleConfirmArea = async () => {
    setActionLoading(true);
    try {
      await createKnowledgeArea(pendingAreaData);
      setShowAreaModal(false);
      setShowAreaConfirm(false);
      setPendingAreaData(null);
      await refreshAreas();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Área creada correctamente.');
      setNotifOpen(true);
    } catch (e) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage(e instanceof Error ? e.message : 'Error al crear área');
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for edit operations
  const handleEdit = (area: KnowledgeArea) => {
    setEditArea(area);
    setShowEditArea(true);
  };
  const handleSubmitEditArea = (values: Partial<KnowledgeArea>) => {
    setPendingEditArea(values);
    setShowEditAreaConfirm(true);
  };
  const handleConfirmEditArea = async () => {
    setActionLoading(true);
    try {
      await updateKnowledgeArea(editArea.id, pendingEditArea);
      setShowEditArea(false);
      setShowEditAreaConfirm(false);
      setPendingEditArea(null);
      setEditArea(null);
      await refreshAreas();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Área actualizada correctamente.');
      setNotifOpen(true);
    } catch (e) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage(e instanceof Error ? e.message : 'Error al actualizar área');
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for toggle operations
  const handleToggle = (area: KnowledgeArea) => {
    setPendingDisable(area);
    setShowDisableConfirm(true);
  };
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      await deleteKnowledgeArea(pendingDisable.id);
      setShowDisableConfirm(false);
      setPendingDisable(null);
      await refreshAreas();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Área deshabilitada correctamente.');
      setNotifOpen(true);
    } catch (e) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage(e instanceof Error ? e.message : 'Error al deshabilitar área');
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Notification modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success'|'info'|'warning'|'password-changed'|'email-sent'|'pending'|'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Loading and error states
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;


  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || filtering || actionLoading)} message={actionLoading ? 'Procesando...' : (filtering ? 'Filtrando...' : (loading ? 'Cargando...' : 'Cargando...'))} />
      {/* Section header with toggle button and record count */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Áreas de Conocimiento</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {knowledgeAreas.length} registros
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {open && (
        <>
              {/* Filter bar and Add knowledge area button */}
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
                  <button onClick={handleAddArea} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg">
                    <Plus className="w-4 h-4" /> Agregar Área
                  </button>
                </div>
              </div>
          {/* Knowledge areas grid with pagination */}
          <div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {(displayedAreas.slice((areasPage - 1) * cardsPerPage, areasPage * cardsPerPage)).map((area) => (
              <div key={area.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{area.name}</h3>
                    {area.description && <p className="text-sm text-gray-600 mt-1">Descripción: {area.description}</p>}
                  </div>
                  {/* Status indicator showing active/inactive state */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${area.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{area.active ? "Activo" : "Inactivo"}</div>
                </div>
                <div className="flex gap-2">
                  {/* Edit button to modify knowledge area details */}
                  <button onClick={() => handleEdit(area)} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
                  {/* Toggle button to enable/disable knowledge area */}
                  <button onClick={() => handleToggle(area)} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${area.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{area.active ? "Deshabilitar" : "Habilitar"}</button>
                </div>
              </div>
            ))}
            {/* Edit modal */}
            <ModalFormGeneric
              isOpen={showEditArea}
              title="Editar Área"
              fields={[
                { label: "Nombre del Área", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
                { label: "Descripción", name: "description", type: "text", placeholder: "Ingrese la descripción", required: true, maxLength: 100 },
              ]}
              onClose={() => { setShowEditArea(false); setEditArea(null); setPendingEditArea(null); }}
              onSubmit={handleSubmitEditArea}
              submitText="Actualizar Área"
              cancelText="Cancelar"
              initialValues={editArea || {}}
              customRender={undefined}
              onProgramChange={undefined}
            />
            <ConfirmModal
              isOpen={showEditAreaConfirm}
              title="¿Confirmar actualización de área?"
              message="¿Estás seguro de que deseas actualizar esta área?"
              confirmText="Sí, actualizar área"
              cancelText="Cancelar"
              onConfirm={handleConfirmEditArea}
              onCancel={() => { setShowEditAreaConfirm(false); setPendingEditArea(null); }}
            />
            <ConfirmModal
              isOpen={showDisableConfirm}
              title="¿Confirmar acción?"
              message="¿Estás seguro de que deseas deshabilitar esta área?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }}
            />
          </div>
          {/* Pagination component - only shown if there are multiple pages */}
          {Math.ceil(displayedAreas.length / cardsPerPage) > 1 && (
            <Paginator
              page={areasPage}
              totalPages={Math.ceil(displayedAreas.length / cardsPerPage)}
              onPageChange={setAreasPage}
              className="mt-4 px-6"
            />
          )}

          {/* Add knowledge area modal */}
          <ModalFormGeneric
            isOpen={showAreaModal}
            title="Agregar Área"
            fields={[
              { label: "Nombre del Área", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
              { label: "Descripción", name: "description", type: "text", placeholder: "Ingrese la descripción", required: true , maxLength: 100 },
            ]}
            onClose={() => setShowAreaModal(false)}
            onSubmit={handleSubmitArea}
            submitText="Registrar Área"
            cancelText="Cancelar"
            customRender={undefined}
            onProgramChange={undefined}
          />
          {/* Add confirmation modal */}
          <ConfirmModal
            isOpen={showAreaConfirm}
            title="¿Confirmar registro de área?"
            message="¿Estás seguro de que deseas crear esta área?"
            confirmText="Sí, crear área"
            cancelText="Cancelar"
            onConfirm={handleConfirmArea}
            onCancel={() => {
              setShowAreaConfirm(false);
              setPendingAreaData(null);
            }}
          />
          {/* Notification modal for success/error messages */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default KnowledgeAreaSection;
