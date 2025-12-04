import React, { useState } from "react";
import type { Colors } from '../../../Api/types/Modules/general.types';
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import { getColors, createColor, updateColor, softDeleteColor, filterColors } from "../../../Api/Services/Colors";
import FilterBar from "../../FilterBar";
import LoadingOverlay from '../../LoadingOverlay';

const cardsPerPage = 9;

/**
 * Props for ColorsSection component
 */
interface ColorsSectionProps {
  /** Whether the section is expanded */
  open: boolean;
  /** Callback to toggle section visibility */
  onToggle: () => void;
}

/**
 * ColorsSection component for managing color configurations
 * Displays a collapsible section with colors in a paginated grid
 * Supports CRUD operations: create, read, update, soft delete
 */
const ColorsSection = ({ open, onToggle }: ColorsSectionProps) => {
  // State for colors data and loading
  const [colors, setColors] = useState<Colors[]>([]);
  const [displayedColors, setDisplayedColors] = useState<Colors[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorsPage, setColorsPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);

  // Modal states for adding colors
  const [showModal, setShowModal] = useState(false);
  const [pendingData, setPendingData] = useState<Colors | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [addConfirmError, setAddConfirmError] = useState<string | null>(null);

  // Modal states for editing colors
  const [editData, setEditData] = useState<Colors | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Colors | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editConfirmError, setEditConfirmError] = useState<string | null>(null);

  // Modal states for disabling colors
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<Colors | null>(null);
  const [disableConfirmError, setDisableConfirmError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Notification modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>("success");
  const [notifTitle, setNotifTitle] = useState<string>("");
  const [notifMessage, setNotifMessage] = useState<string>("");

  /**
   * Fetch colors from server
   */
  const refreshColors = async () => {
    setLoading(true);
    try {
      const data = await getColors();
      setColors(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar colores");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    refreshColors();
  }, []);

  React.useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedColors(colors || []);
    }
  }, [colors, filtering, search, activeFilter]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedColors(colors || []);
        return;
      }
      const data = await filterColors({ search: s, active: a });
      setDisplayedColors(data || []);
      setColorsPage(1);
    } catch (e) {
      // silent fail
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component for displaying individual color information
   * Shows color name, hex value with visual preview, and action buttons
   */
  const InfoCard = ({ name, hexagonal_value, isActive, onEdit, onToggle }: { name: string; hexagonal_value: string; isActive: boolean; onEdit: () => void; onToggle: () => void }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {hexagonal_value && (
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              Hex: {hexagonal_value}
              {/* Color preview swatch */}
              <span style={{ background: hexagonal_value, width: 24, height: 24, borderRadius: 6, border: '1px solid #ccc', display: 'inline-block' }} />
            </p>
          )}
        </div>
        {/* Status indicator showing active/inactive state */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{isActive ? "Activo" : "Inactivo"}</div>
      </div>
      <div className="flex gap-2">
        {/* Edit button to modify color details */}
        <button onClick={onEdit} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        {/* Toggle button to enable/disable color */}
        <button onClick={onToggle} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${isActive ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{isActive ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  // Handler functions for add operations
  const handleAdd = () => setShowModal(true);
  const handleSubmit = (values: Colors) => {
    setPendingData(values);
    setShowConfirm(true);
  };
  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await createColor(pendingData);
      setShowModal(false);
      setShowConfirm(false);
      setPendingData(null);
      setAddConfirmError(null);
      await refreshColors();
      setNotifType("success");
      setNotifTitle("Éxito");
      setNotifMessage("Color creado correctamente.");
      setNotifOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear color";
      setAddConfirmError(msg);
      setShowConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for edit operations
  const handleEdit = (color: Colors) => {
    setEditData(color);
    setShowEditModal(true);
  };
  const handleSubmitEdit = (values: Colors) => {
    setPendingEditData(values);
    setShowEditConfirm(true);
  };
  const handleConfirmEdit = async () => {
    setActionLoading(true);
    try {
      await updateColor(editData.id, pendingEditData);
      setShowEditModal(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditData(null);
      setEditConfirmError(null);
      await refreshColors();
      setNotifType("success");
      setNotifTitle("Éxito");
      setNotifMessage("Color actualizado correctamente.");
      setNotifOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar color";
      setEditConfirmError(msg);
      setShowEditConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for toggle operations
  const handleToggle = (color: Colors) => {
    setPendingDisable(color);
    setShowDisableConfirm(true);
  };
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      await softDeleteColor(pendingDisable.id);
      setShowDisableConfirm(false);
      setPendingDisable(null);
      setDisableConfirmError(null);
      await refreshColors();
      setNotifType("success");
      setNotifTitle("Éxito");
      setNotifMessage("Estado del color actualizado correctamente.");
      setNotifOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al deshabilitar color";
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
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Colores</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {colors.length} registros
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
          {/* Filter + Add color button */}
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
              <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg">
                <Plus className="w-4 h-4" /> Agregar Color
              </button>
            </div>
          </div>
          {/* Colors grid with pagination */}
          <div className={`p-6 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedColors.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No se encontraron colores con esta búsqueda' : 'No hay colores disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(displayedColors.slice((colorsPage - 1) * cardsPerPage, colorsPage * cardsPerPage)).map((color) => (
                  <InfoCard
                    key={color.id}
                    name={color.name}
                    hexagonal_value={color.hexagonal_value}
                    isActive={color.active}
                    onEdit={() => handleEdit(color)}
                    onToggle={() => handleToggle(color)}
                  />
                ))}
              </div>
            )}
            {/* Edit modal */}
            <ModalFormGeneric
              isOpen={showEditModal}
              title="Editar Color"
              fields={[
                { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
                { label: "Hexadecimal", name: "hexagonal_value", type: "text", placeholder: "#43A047", required: true },
              ]}
              onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }}
              onSubmit={handleSubmitEdit}
              submitText="Actualizar"
              cancelText="Cancelar"
              initialValues={editData || {}}
              customRender={undefined}
              onProgramChange={undefined}
            />
            {/* Edit confirmation modal */}
            <ConfirmModal
              isOpen={showEditConfirm}
              title="¿Confirmar actualización?"
              message="¿Estás seguro de que deseas actualizar este color?"
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
              message="¿Estás seguro de que deseas deshabilitar este color?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); setDisableConfirmError(null); }}
              errorMessage={disableConfirmError}
            />
          </div>
          {/* Pagination component */}
          {Math.ceil(displayedColors.length / cardsPerPage) > 1 && (
            <Paginator
              page={colorsPage}
              totalPages={Math.ceil(displayedColors.length / cardsPerPage)}
              onPageChange={setColorsPage}
              className="mt-4 px-6"
            />
          )}

          {/* Add modal */}
          <ModalFormGeneric
            isOpen={showModal}
            title="Agregar Color"
            fields={[
              { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
              { label: "Hexadecimal", name: "hexagonal_value", type: "text", placeholder: "#43A047", required: true },
            ]}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            submitText="Registrar"
            cancelText="Cancelar"
            customRender={undefined}
            onProgramChange={undefined}
          />
          {/* Add confirmation modal */}
          <ConfirmModal
            isOpen={showConfirm}
            title="¿Confirmar registro?"
            message="¿Estás seguro de que deseas crear este color?"
            confirmText="Sí, crear"
            cancelText="Cancelar"
            onConfirm={handleConfirm}
            onCancel={() => {
              setShowConfirm(false);
              setPendingData(null);
              setAddConfirmError(null);
            }}
            errorMessage={addConfirmError}
          />
          {/* Notification modal */}
          <NotificationModal
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            type={notifType}
            title={notifTitle}
            message={notifMessage}
          />
        </>
      )}
    </div>
  );
};

export default ColorsSection;