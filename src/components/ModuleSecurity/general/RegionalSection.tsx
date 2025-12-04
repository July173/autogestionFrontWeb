import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import DescriptionModal from "../../DescriptionModal";
import FilterBar from "../../FilterBar";
import LoadingOverlay from '../../LoadingOverlay';
import { getRegionales, createRegional, updateRegional, softDeleteRegional, filterRegionals } from "../../../Api/Services/Regional";
import type { Regional } from "../../../Api/types/Modules/general.types";

const cardsPerPage = 9;

interface RegionalSectionProps {
  open: boolean;
  onToggle: () => void;
}

/**
 * RegionalSection component for managing SENA regional offices.
 * Provides collapsible section with CRUD operations for regional entities including
 * creation, editing, enable/disable functionality, pagination, and description expansion.
 * Features responsive grid layout and comprehensive modal-based interactions.
 */
const RegionalSection = ({ open, onToggle }: RegionalSectionProps) => {
  // Regional data and loading states
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Pagination state for regional grid display
  const [page, setPage] = useState(1);

  // Filter UI state (server-side)
  const [displayedRegionals, setDisplayedRegionals] = useState<Regional[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal visibility states for regional creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingData, setPendingData] = useState<Regional | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);

  // Modal visibility states for regional editing
  const [editData, setEditData] = useState<Regional | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Regional | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Modal visibility states for disable/enable confirmation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<Regional | null>(null);

  // Description modal states for long text expansion
  const [showDescModal, setShowDescModal] = useState(false);
  const [descModalText, setDescModalText] = useState("");

  // Global notification modal states
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  /**
   * Refreshes regional data from API and handles loading/error states
   */
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getRegionales();
      setRegionals(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar regionales");
    }
    setLoading(false);
  };

  // Load regional data on component mount
  React.useEffect(() => {
    refresh();
  }, []);

  React.useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedRegionals(regionals || []);
    }
  }, [regionals, filtering, search, activeFilter]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedRegionals(regionals || []);
        setPage(1);
        return;
      }
      const data = await filterRegionals({ search: s, active: a });
      setDisplayedRegionals(data || []);
      setPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component for displaying individual regional information.
   * Features truncated description with expansion modal, status indicator,
   * and action buttons for edit and enable/disable operations.
   * @param regional - Regional object containing all regional data
   */
  const InfoCard = ({ regional }: { regional: Regional }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
      {/* Header section with name and status badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{regional.name || `Regional ${regional.id}`}</h3>
          {/* Description section with truncation and expansion */}
          {regional.description && (
            <div className="relative">
              {/* Truncated description with ellipsis */}
              <p
                className="text-sm text-gray-600 mt-1 max-h-16 overflow-hidden text-ellipsis whitespace-pre-line break-words"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {regional.description}
              </p>
              {/* Expansion button for long descriptions */}
              {regional.description.length > 120 && (
                <button
                  className="absolute bottom-0 left-60 bg-white px-2 py-0.5 rounded-full shadow text-gray-500 text-lg hover:bg-gray-100"
                  style={{ zIndex: 2 }}
                  onClick={() => {
                    setDescModalText(regional.description);
                    setShowDescModal(true);
                  }}
                  title="Ver más"
                >
                  ...
                </button>
              )}
            </div>
          )}
        </div>
        {/* Status badge indicating active/inactive state */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${regional.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {regional.active ? "Activo" : "Inactivo"}
        </div>
      </div>
      {/* Action buttons for edit and toggle operations */}
      <div className="flex gap-2">
        <button onClick={() => { setEditData(regional); setShowEditModal(true); }} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        <button onClick={() => { setPendingDisable(regional); setShowDisableConfirm(true); }} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${regional.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{regional.active ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  /**
   * Opens the create regional modal
   */
  const handleAdd = () => setShowAddModal(true);

  /**
   * Prepares regional data and shows confirmation modal for creation
   * @param values - Form field values from create modal
   */
  const handleSubmitAdd = (values: Regional) => { setPendingData(values); setShowAddConfirm(true); };

  /**
   * Confirms and executes regional creation via API
   */
  const handleConfirmAdd = async () => {
    setActionLoading(true);
    try {
      // Normalize payload to backend expected keys (code_regional)
      const pd = pendingData as unknown as Record<string, unknown>;
      const payload = {
        name: pendingData?.name,
        code_regional: pd['codeRegional'] !== undefined && pd['codeRegional'] !== null ? String(pd['codeRegional']) : (pd['codeRegional'] as string | undefined),
        description: pendingData?.description,
        address: pendingData?.address,
      };
      await createRegional(payload as unknown as Record<string, unknown>);
      setShowAddModal(false);
      setShowAddConfirm(false);
      setPendingData(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Regional creada correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al crear regional'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Prepares edited regional data and shows confirmation modal
   * @param values - Form field values from edit modal
   */
  const handleSubmitEdit = (values: Regional) => { setPendingEditData(values); setShowEditConfirm(true); };

  /**
   * Confirms and executes regional update via API
   */
  const handleConfirmEdit = async () => {
    setActionLoading(true);
    try {
      const ped = pendingEditData as unknown as Record<string, unknown>;
      const ed = editData as unknown as Record<string, unknown>;
      const payload = {
        name: pendingEditData?.name ?? editData?.name,
        code_regional: ped['codeRegional'] !== undefined && ped['codeRegional'] !== null ? String(ped['codeRegional']) : (ped['codeRegional'] as string | undefined) ?? (ed['codeRegional'] as string | undefined) ?? (ed['code_regional'] as string | undefined),
        description: pendingEditData?.description ?? editData?.description,
        address: pendingEditData?.address ?? editData?.address,
      };
      await updateRegional(editData.id, payload as unknown as Record<string, unknown>);
      setShowEditModal(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditData(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Regional actualizada correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al actualizar regional'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Confirms and executes regional disable/enable toggle via API
   */
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      await softDeleteRegional(pendingDisable.id);
      setShowDisableConfirm(false);
      setPendingDisable(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Acción realizada correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al deshabilitar regional'); setNotifOpen(true);
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
      <button onClick={onToggle} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Regionales</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{displayedRegionals.length} registros</span>
        </div>
        {/* Chevron icon indicating open/closed state */}
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {/* Expandable content section */}
      {open && (
        <>
              {/* Filter + add regional button */}
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
                  <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"><Plus className="w-4 h-4" /> Agregar Regional</button>
                </div>
              </div>

          {/* Regional cards grid with responsive layout */}
          <div className={`p-6 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedRegionals.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No se encontraron regionales con esta búsqueda' : 'No hay regionales disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Map through paginated regionals to create InfoCard components */}
                {displayedRegionals.slice((page - 1) * cardsPerPage, page * cardsPerPage).map((regional) => (
                  <InfoCard key={regional.id} regional={regional} />
                ))}
              </div>
            )}

            {/* Modal for editing existing regional */}
            <ModalFormGeneric
              isOpen={showEditModal}
              title="Editar Regional"
              fields={[
                { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
                { label: "Código", name: "codeRegional", type: "number", placeholder: "Código de la regional", required: true },
                { label: "Descripción", name: "description", type: "text", placeholder: "Descripción", required: true },
                { label: "Dirección", name: "address", type: "text", placeholder: "Dirección", required: true },
              ]}
              onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }}
              onSubmit={handleSubmitEdit}
              submitText="Actualizar"
              cancelText="Cancelar"
              initialValues={(() => {
                if (!editData) return {};
                const ed = editData as unknown as Record<string, unknown>;
                return {
                  ...editData,
                  codeRegional: ed['code_regional'] ?? ed['codeRegional'],
                } as Regional;
              })()}
              customRender={undefined}
              onProgramChange={undefined}
            />

            {/* Confirmation modal for regional edit */}
            <ConfirmModal isOpen={showEditConfirm} title="¿Confirmar actualización?" message="¿Estás seguro de que deseas actualizar esta regional?" confirmText="Sí, actualizar" cancelText="Cancelar" onConfirm={handleConfirmEdit} onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); }} />

            {/* Confirmation modal for disable/enable toggle */}
            <ConfirmModal isOpen={showDisableConfirm} title="¿Confirmar acción?" message="¿Estás seguro de que deseas deshabilitar esta regional?" confirmText="Sí, continuar" cancelText="Cancelar" onConfirm={handleConfirmDisable} onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }} />
          </div>

          {/* Pagination component when multiple pages exist */}
          {Math.ceil(displayedRegionals.length / cardsPerPage) > 1 && (
            <Paginator page={page} totalPages={Math.ceil(displayedRegionals.length / cardsPerPage)} onPageChange={setPage} className="mt-4 px-6" />
          )}

          {/* Modal for creating new regional */}
          <ModalFormGeneric isOpen={showAddModal} title="Agregar Regional" fields={[
            { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
            { label: "Código", name: "codeRegional", type: "number", placeholder: "Código de la regional", required: true },
            { label: "Descripción", name: "description", type: "text", placeholder: "Descripción", required: true },
            { label: "Dirección", name: "address", type: "text", placeholder: "Dirección", required: true },
          ]} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} submitText="Registrar" cancelText="Cancelar" customRender={undefined} onProgramChange={undefined} />

          {/* Confirmation modal for regional creation */}
          <ConfirmModal isOpen={showAddConfirm} title="¿Confirmar registro?" message="¿Estás seguro de que deseas registrar esta regional?" confirmText="Sí, registrar" cancelText="Cancelar" onConfirm={handleConfirmAdd} onCancel={() => { setShowAddConfirm(false); setPendingData(null); }} />

          {/* Description expansion modal for long text */}
          <DescriptionModal isOpen={showDescModal} title="Descripción completa" message={descModalText} buttonText="Cerrar" onClose={() => setShowDescModal(false)} />

          {/* Global notification modal for success/error messages */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default RegionalSection;
