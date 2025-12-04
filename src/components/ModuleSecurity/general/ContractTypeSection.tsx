import React, { useState, useEffect } from "react";
import type { TypeContract } from '../../../Api/types/Modules/general.types';
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import CancelModal from "../../DescriptionModal";
import { getContractTypes, createContractType, updateContractType, deactivateContractType, filterContractTypes } from "../../../Api/Services/TypeContract";
import FilterBar from "../../FilterBar";
import { max } from "date-fns";
import LoadingOverlay from '../../LoadingOverlay';

const cardsPerPage = 9;

/**
 * Props for ContractTypeSection component
 */
interface ContractTypeSectionProps {
  /** Whether the section is expanded */
  open: boolean;
  /** Callback to toggle section visibility */
  onToggle: () => void;
}

/**
 * ContractTypeSection component for managing contract types
 * Displays a collapsible section with contract types in a paginated grid
 * Supports CRUD operations: create, read, update, deactivate
 */
const ContractTypeSection = ({ open, onToggle }: ContractTypeSectionProps) => {
  // State for contract types data and loading
  const [contractTypes, setContractTypes] = useState<TypeContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractTypesPage, setContractTypesPage] = useState(1);

  // Modal states for adding contract types
  const [showModal, setShowModal] = useState(false);
  const [pendingData, setPendingData] = useState<TypeContract | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Modal states for editing contract types
  const [editData, setEditData] = useState<TypeContract | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<TypeContract | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editConfirmError, setEditConfirmError] = useState<string | null>(null);

  // Modal states for disabling contract types
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<TypeContract | null>(null);

  // Filter UI state
  const [displayedContractTypes, setDisplayedContractTypes] = useState<TypeContract[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states for description display
  const [showDescModal, setShowDescModal] = useState(false);
  const [descModalText, setDescModalText] = useState("");

  // Notification modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success'|'info'|'warning'|'password-changed'|'email-sent'|'pending'|'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  /**
   * Fetch contract types from server
   */
  const refreshContractTypes = async () => {
    setLoading(true);
    try {
      const data = await getContractTypes();
      setContractTypes(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar tipos de contrato");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    refreshContractTypes();
  }, []);

  useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedContractTypes(contractTypes || []);
    }
  }, [contractTypes, filtering]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedContractTypes(contractTypes || []);
        return;
      }
      const data = await filterContractTypes({ search: s, active: a });
      setDisplayedContractTypes(data || []);
      setContractTypesPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component for displaying individual contract type information
   * Shows contract type name, description with truncation and expand option, and action buttons
   */
  const InfoCard = ({ name, description, isActive, onEdit, onToggle }: { name: string; description: string; isActive: boolean; onEdit: () => void; onToggle: () => void }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {description && (
            <div className="relative">
              <p
                className="text-sm text-gray-600 mt-1 max-h-16 overflow-hidden text-ellipsis whitespace-pre-line break-words"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word"
                }}
              >
                {description}
              </p>
              {/* Show expand button if description is long */}
              {description.length > 120 && (
                <button
                  className="absolute bottom-0 left-60 bg-white px-2 py-0.5 rounded-full shadow text-gray-500 text-lg hover:bg-gray-100"
                  style={{ zIndex: 2 }}
                  onClick={() => {
                    setDescModalText(description);
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
        {/* Status indicator showing active/inactive state */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{isActive ? "Activo" : "Inactivo"}</div>
      </div>
      <div className="flex gap-2">
        {/* Edit button to modify contract type details */}
        <button onClick={onEdit} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        {/* Toggle button to enable/disable contract type */}
        <button onClick={onToggle} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${isActive ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{isActive ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  // Handler functions for add operations
  const handleAdd = () => setShowModal(true);
  const handleSubmit = (values: TypeContract) => {
    setPendingData(values);
    setShowConfirm(true);
  };
  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await createContractType(pendingData);
      setShowModal(false);
      setShowConfirm(false);
      setPendingData(null);
      await refreshContractTypes();

      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Tipo de contrato creado correctamente.');
      setNotifOpen(true);
      setConfirmError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al crear tipo de contrato';
      // show the backend message inside the confirmation modal
      setConfirmError(message);
      // keep the modal open so the user sees the message
      setShowConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for edit operations
  const handleEdit = (type: TypeContract) => {
    setEditData(type);
    setShowEditModal(true);
  };
  const handleSubmitEdit = (values: TypeContract) => {
    setPendingEditData(values);
    setShowEditConfirm(true);
  };
  const handleConfirmEdit = async () => {
    setActionLoading(true);
    try {
      await updateContractType(editData.id, pendingEditData);
      setShowEditModal(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditData(null);
      await refreshContractTypes();

      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Tipo de contrato actualizado correctamente.');
      setNotifOpen(true);
      setEditConfirmError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar tipo de contrato';
      setEditConfirmError(message);
      setShowEditConfirm(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for toggle operations
  const handleToggle = (type: TypeContract) => {
    setPendingDisable(type);
    setShowDisableConfirm(true);
  };
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      await deactivateContractType(pendingDisable.id);
      setShowDisableConfirm(false);
      setPendingDisable(null);
      await refreshContractTypes();

      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Acción realizada correctamente.');
      setNotifOpen(true);
    } catch (e) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage(e instanceof Error ? e.message : 'Error al deshabilitar tipo de contrato');
      setNotifOpen(true);
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
          <h3 className="text-lg font-semibold text-gray-900">Tipos de Contrato</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {displayedContractTypes.length} registros
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
          {/* Filter bar and Add contract type button */}
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
                <Plus className="w-4 h-4" /> Agregar Tipo de Contrato
              </button>
            </div>
          </div>
          {/* Contract types grid with pagination */}
          <div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedContractTypes.length === 0 ? (
              <div className="col-span-3 text-center text-gray-600 py-8">{(search || activeFilter) ? 'No se encontraron tipos de contrato con esta búsqueda' : 'No hay tipos de contrato disponibles'}</div>
            ) : (
              displayedContractTypes.slice((contractTypesPage - 1) * cardsPerPage, contractTypesPage * cardsPerPage).map((type) => (
                <InfoCard
                  key={type.id}
                  name={type.name}
                  description={type.description}
                  isActive={type.active}
                  onEdit={() => handleEdit(type)}
                  onToggle={() => handleToggle(type)}
                />
              ))
            )}
            {/* Edit modal */}
            <ModalFormGeneric
              isOpen={showEditModal}
              title="Editar Tipo de Contrato"
              fields={[
                { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
                { label: "Descripción", name: "description", type: "text", placeholder: "Ingrese la descripción", required: true , maxLength: 175 },
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
              message="¿Estás seguro de que deseas actualizar este tipo de contrato?"
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
              message="¿Estás seguro de que deseas deshabilitar este tipo de contrato?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }}
            />
          </div>
          {/* Pagination component */}
          {Math.ceil(contractTypes.length / cardsPerPage) > 1 && (
            <Paginator
              page={contractTypesPage}
              totalPages={Math.ceil(contractTypes.length / cardsPerPage)}
              onPageChange={setContractTypesPage}
              className="mt-4 px-6"
            />
          )}

          {/* Add modal */}
          <ModalFormGeneric
            isOpen={showModal}
            title="Agregar Tipo de Contrato"
            fields={[
              { label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
              { label: "Descripción", name: "description", type: "text", placeholder: "Ingrese la descripción", required: true, maxLength: 175 },
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
            message="¿Estás seguro de que deseas registrar este tipo de contrato?"
            confirmText="Sí, registrar"
            cancelText="Cancelar"
            onConfirm={handleConfirm}
            onCancel={() => {
              setShowConfirm(false);
              setPendingData(null);
              setConfirmError(null);
            }}
            errorMessage={confirmError}
          />
          {/* Description modal for long descriptions */}
          <CancelModal
            isOpen={showDescModal}
            title="Descripción completa"
            message={descModalText}
            buttonText="Cerrar"
            onClose={() => setShowDescModal(false)}
          />
          {/* Notification modal */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default ContractTypeSection;