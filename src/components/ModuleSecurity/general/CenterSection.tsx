import React, { useState } from "react";
import type { Center } from '../../../Api/types/Modules/general.types';
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from "../ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import { getCenters, createCenter, updateCenter, softDeleteCenter, filterCenters } from "../../../Api/Services/Center";
import FilterBar from "../../FilterBar";
import { getRegionales } from "../../../Api/Services/Regional";
import parseErrorMessage from '../../../utils/parseError';
import LoadingOverlay from '../../LoadingOverlay';

const cardsPerPage = 9;

/**
 * Props for CenterSection component
 */
interface CenterSectionProps {
  /** Whether the section is expanded */
  open: boolean;
  /** Callback to toggle section visibility */
  onToggle: () => void;
}

/**
 * CenterSection component for managing training centers
 * Displays a collapsible section with centers in a paginated grid
 * Supports CRUD operations: create, read, update, soft delete
 */
const CenterSection = ({ open, onToggle }: CenterSectionProps) => {
  // State for centers data and loading
  const [centers, setCenters] = useState<Center[]>([]);
  const [displayedCenters, setDisplayedCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);

  // Modal states for adding centers
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingData, setPendingData] = useState<Center | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [addConfirmError, setAddConfirmError] = useState<string | null>(null);

  // Modal states for editing centers
  const [editData, setEditData] = useState<Center | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Center | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editConfirmError, setEditConfirmError] = useState<string | null>(null);

  // Modal states for disabling centers
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<Center | null>(null);
  const [disableConfirmError, setDisableConfirmError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Notification modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Regional options for select dropdown
  const [regionals, setRegionals] = useState<{ value: string; label: string }[]>([]);

  /**
   * Refresh centers list from server
   */
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getCenters();
      setCenters(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar centros");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    refresh();
    // Load regional options for dropdown
    (async () => {
      try {
        const data = await getRegionales();
  const opts = Array.isArray(data) ? data.map((r: { id: number; name?: string }) => ({ value: String(r.id), label: r.name || `Regional ${r.id}` })) : [];
        setRegionals(opts);
      } catch (e) {
        setRegionals([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedCenters(centers || []);
    }
  }, [centers, filtering, search, activeFilter]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedCenters(centers || []);
        return;
      }
      const data = await filterCenters({ search: s, active: a });
      setDisplayedCenters(data || []);
      setPage(1);
    } catch (e) {
      // silent fail, keep previous displayed
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component for displaying individual center information
   * Shows center details with edit and toggle buttons
   */
  const InfoCard = ({ center }: { center: Center }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{center.name || `Centro ${center.id}`}</h3>
          {center.address && <p className="text-sm text-gray-600 mt-1">{center.address}</p>}
        </div>
        {/* Status indicator showing active/inactive state */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${center.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {center.active ? "Activo" : "Inactivo"}
        </div>
      </div>
      <div className="flex gap-2">
        {/* Edit button to modify center details */}
        <button onClick={() => { setEditData(center); setShowEditModal(true); }} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        {/* Toggle button to enable/disable center */}
        <button onClick={() => { setPendingDisable(center); setShowDisableConfirm(true); }} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${center.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{center.active ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  // Handler functions for add operations
  const handleAdd = () => setShowAddModal(true);
  const handleSubmitAdd = (values: Center) => { setPendingData(values); setShowAddConfirm(true); };
  const handleConfirmAdd = async () => {
    setActionLoading(true);
    try {
      // Normalize payload keys to backend expectations: 'code_center' instead of 'codeCenter'
      const pd = pendingData as unknown as Record<string, unknown>;
      const payload = {
        name: pendingData?.name,
        code_center: pd['codeCenter'] !== undefined && pd['codeCenter'] !== null ? String(pd['codeCenter']) : (pd['codeCenter'] as string | undefined),
        address: pendingData?.address,
        regional: pendingData?.regional ? Number(pendingData.regional) : pendingData?.regional,
      };
  // createCenter expects a loose object; cast to unknown then to the expected param type to avoid 'any'
      await createCenter(payload as unknown as Record<string, unknown>);
      setShowAddModal(false);
      setShowAddConfirm(false);
      setPendingData(null);
      setAddConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Centro creado correctamente.'); setNotifOpen(true);
    } catch (e) {
      const msg = parseErrorMessage(e) || 'Error al crear centro';
      setAddConfirmError(msg);
      setShowAddConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for edit operations
  const handleSubmitEdit = (values: Center) => { setPendingEditData(values); setShowEditConfirm(true); };
  const handleConfirmEdit = async () => {
    setActionLoading(true);
    try {
      // Normalize edit payload keys to backend expectations
      const ped = pendingEditData as unknown as Record<string, unknown>;
      const ed = editData as unknown as Record<string, unknown>;
      const payload = {
        name: pendingEditData?.name ?? editData?.name,
        code_center: ped['codeCenter'] !== undefined && ped['codeCenter'] !== null ? String(ped['codeCenter']) : (ped['codeCenter'] as string | undefined) ?? (ed['codeCenter'] as string | undefined),
        address: pendingEditData?.address ?? editData?.address,
        regional: pendingEditData?.regional ? Number(pendingEditData.regional) : pendingEditData?.regional ?? editData?.regional,
      };
      await updateCenter(editData.id, payload as unknown as Record<string, unknown>);
      setShowEditModal(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditData(null);
      setEditConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Centro actualizado correctamente.'); setNotifOpen(true);
    } catch (e) {
      const msg = parseErrorMessage(e) || 'Error al actualizar centro';
      setEditConfirmError(msg);
      setShowEditConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler function for disable operations
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      await softDeleteCenter(pendingDisable.id);
      setShowDisableConfirm(false);
      setPendingDisable(null);
      setDisableConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Acción realizada correctamente.'); setNotifOpen(true);
    } catch (e) {
      const msg = parseErrorMessage(e) || 'Error al deshabilitar centro';
      setDisableConfirmError(msg);
      setShowDisableConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading and error states
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || filtering || actionLoading)} message={actionLoading ? 'Procesando...' : (filtering ? 'Filtrando...' : (loading ? 'Cargando...' : 'Cargando...'))} />
      {/* Section header with toggle button and record count */}
      <button onClick={onToggle} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Centros</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{centers.length} registros</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {open && (
        <>
          {/* Filter + Add center button */}
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
              <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"><Plus className="w-4 h-4" /> Agregar Centro</button>
            </div>
          </div>

          {/* Centers grid with pagination */}
          <div className={`p-6 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedCenters.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No se encontraron centros con esta búsqueda' : 'No hay centros disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedCenters.slice((page - 1) * cardsPerPage, page * cardsPerPage).map((center) => (
                  <InfoCard key={center.id} center={center} />
                ))}
              </div>
            )}

            {/* Edit modal */}
            {/* Prepare initial values for edit modal mapping backend keys to form field names */}
            {(() => {
              const editInitialValues = editData ? {
                ...editData,
                // backend returns code_center, form expects codeCenter
                // avoid 'any' by using a safe record cast
                codeCenter: (editData as unknown as Record<string, unknown>)['code_center'] ?? (editData as unknown as Record<string, unknown>)['codeCenter'],
                // regional select expects a string value
                regional: editData?.regional !== undefined && editData?.regional !== null ? String(editData.regional) : editData?.regional,
              } : {} as Center;

              return (
                <ModalFormGeneric
              isOpen={showEditModal}
              title="Editar Centro"
              fields={[
                { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
                { label: "Código", name: "codeCenter", type: "number", placeholder: "Código del centro", required: true },
                { label: "Dirección", name: "address", type: "text", placeholder: "Ingrese la dirección", required: true },
                { label: "Regional", name: "regional", type: "select", customSelect: true, options: regionals, placeholder: "Seleccione la regional", required: true },
              ]}
              onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }}
              onSubmit={handleSubmitEdit}
              submitText="Actualizar"
              cancelText="Cancelar"
              initialValues={editInitialValues || {}}
              customRender={undefined}
              onProgramChange={undefined}
                />
              );
            })()}

            {/* Edit confirmation modal */}
            <ConfirmModal
              isOpen={showEditConfirm}
              title="¿Confirmar actualización?"
              message="¿Estás seguro de que deseas actualizar este centro?"
              confirmText="Sí, actualizar"
              cancelText="Cancelar"
              onConfirm={handleConfirmEdit}
              onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); setEditConfirmError(null); }}
              errorMessage={editConfirmError}
            />

            {/* Disable confirmation modal */}
            <ConfirmModal
              isOpen={showDisableConfirm}
              title="¿Confirmar acción?"
              message="¿Estás seguro de que deseas deshabilitar este centro?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); setDisableConfirmError(null); }}
              errorMessage={disableConfirmError}
            />
          </div>

          {/* Pagination component */}
          {Math.ceil(displayedCenters.length / cardsPerPage) > 1 && (
            <Paginator page={page} totalPages={Math.ceil(displayedCenters.length / cardsPerPage)} onPageChange={setPage} className="mt-4 px-6" />
          )}

          {/* Add modal */}
          <ModalFormGeneric isOpen={showAddModal} title="Agregar Centro" fields={[
            { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
            { label: "Código", name: "codeCenter", type: "number", placeholder: "Código del centro", required: true },
            { label: "Dirección", name: "address", type: "text", placeholder: "Ingrese la dirección", required: true },
            { label: "Regional", name: "regional", type: "select", customSelect: true, options: regionals, placeholder: "Seleccione la regional", required: true },
          ]} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} submitText="Registrar" cancelText="Cancelar" customRender={undefined} onProgramChange={undefined} />

          {/* Add confirmation modal */}
          <ConfirmModal
            isOpen={showAddConfirm}
            title="¿Confirmar registro?"
            message="¿Estás seguro de que deseas registrar este centro?"
            confirmText="Sí, registrar"
            cancelText="Cancelar"
            onConfirm={handleConfirmAdd}
            onCancel={() => { setShowAddConfirm(false); setPendingData(null); setAddConfirmError(null); }}
            errorMessage={addConfirmError}
          />

          {/* Notification modal */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default CenterSection;
