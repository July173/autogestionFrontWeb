import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import FilterBar from "../../FilterBar";
import { getAllSupportContacts, createSupportContact, updateSupportContact, softDeleteSupportContact, filterSupportContacts } from "../../../Api/Services/SupportContact";
import parseErrorMessage from '../../../utils/parseError';
import { SupportContact } from "../../../Api/types/entities/support.types";

const cardsPerPage = 9;

/**
 * Props interface for SupportContactSection component
 * @interface SupportContactSectionProps
 */
interface SupportContactSectionProps {
  open: boolean;
  onToggle: () => void;
}

/**
 * SupportContactSection component for managing support contact information.
 * Provides comprehensive CRUD operations for support contacts including creation,
 * editing, enable/disable functionality, and contact information display.
 * Features collapsible section, pagination, confirmation modals, and notifications.
 *
 * @param {SupportContactSectionProps} props - Component props
 * @param {boolean} props.open - Whether the section is expanded
 * @param {() => void} props.onToggle - Function to toggle section visibility
 * @returns {JSX.Element} Rendered component
 */
const SupportContactSection = ({ open, onToggle }: SupportContactSectionProps) => {
  // Main data states for contacts list
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modal states for adding new contact
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingData, setPendingData] = useState<SupportContact | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [addConfirmError, setAddConfirmError] = useState<string | null>(null);

  // Modal states for editing existing contact
  const [editData, setEditData] = useState<SupportContact | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<SupportContact | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editConfirmError, setEditConfirmError] = useState<string | null>(null);

  // Modal states for disable/enable confirmation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<SupportContact | null>(null);
  const [disableConfirmError, setDisableConfirmError] = useState<string | null>(null);

  // Notification modal states
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  /**
   * Refresh support contacts list from server
   */
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAllSupportContacts();
      setContacts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar contactos");
    }
    setLoading(false);
  };

  // Filter UI state (server-side)
  const [displayedContacts, setDisplayedContacts] = useState<SupportContact[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);

  React.useEffect(() => {
    // Initial data loading: fetch all support contacts
    (async () => {
      await refresh();
    })();
  }, []);

  React.useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedContacts(contacts || []);
    }
  }, [contacts, filtering, search, activeFilter]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedContacts(contacts || []);
        setPage(1);
        return;
      }
      const data = await filterSupportContacts({ search: s, active: a });
      setDisplayedContacts(data || []);
      setPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component for displaying individual support contact information
   * Shows contact type, label, value, extra info, and active status with action buttons
   * @param {Object} props - Component props
   * @param {any} props.contact - Contact object with id, type, label, value, extra_info, active status
   * @returns {JSX.Element} Rendered card component
   */
  const InfoCard = ({ contact }: { contact: SupportContact }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {/* Contact label/type display with fallback */}
          <h3 className="font-semibold text-gray-900">{contact.label || contact.type || `Contacto ${contact.id}`}</h3>
          {/* Primary contact value (email, phone, etc.) */}
          <p className="text-sm text-gray-600 mt-1">{contact.value}</p>
          {/* Optional extra information */}
          {contact.extra_info && <p className="text-xs text-gray-500 mt-1">{contact.extra_info}</p>}
        </div>
        {/* Active/inactive status badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${contact.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {contact.active ? "Activo" : "Inactivo"}
        </div>
      </div>
      {/* Action buttons: Edit and Enable/Disable */}
      <div className="flex gap-2">
        <button onClick={() => { setEditData(contact); setShowEditModal(true); }} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        <button onClick={() => { setPendingDisable(contact); setShowDisableConfirm(true); }} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${contact.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{contact.active ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  /**
   * Opens the add contact modal
   */
  const handleAdd = () => setShowAddModal(true);

  /**
   * Handles form submission for adding new contact - stores data for confirmation
   * @param {any} values - Form values from the modal
   */
  const handleSubmitAdd = (values: SupportContact) => { setPendingData(values); setShowAddConfirm(true); };

  /**
   * Confirms and executes the contact creation
   * Calls API to create new support contact, then refreshes data and shows notification
   */
  const handleConfirmAdd = async () => {
    try {
      await createSupportContact(pendingData);
      // Close modals and reset state
      setShowAddModal(false);
      setShowAddConfirm(false);
      setPendingData(null);
      setAddConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Contacto creado correctamente.'); setNotifOpen(true);
    } catch (e: unknown) {
      const msg = parseErrorMessage(e);
      // Keep the confirm modal open and show the backend message inside it
      setAddConfirmError(msg || 'Error al crear contacto');
      setShowAddConfirm(true);
    }
  };

  /**
   * Handles form submission for editing contact - stores data for confirmation
   * @param {any} values - Form values from the edit modal
   */
  const handleSubmitEdit = (values: SupportContact) => { setPendingEditData(values); setShowEditConfirm(true); };

  /**
   * Confirms and executes the contact update
   * Calls API to update existing support contact, then refreshes data and shows notification
   */
  const handleConfirmEdit = async () => {
    try {
      await updateSupportContact(editData.id, pendingEditData);
      // Close modals and reset state
      setShowEditModal(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditData(null);
      setEditConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Contacto actualizado correctamente.'); setNotifOpen(true);
    } catch (e: unknown) {
      const msg = parseErrorMessage(e);
      setEditConfirmError(msg || 'Error al actualizar contacto');
      setShowEditConfirm(true);
    }
  };

  /**
   * Confirms and executes the contact disable/enable action (soft delete)
   * Calls soft delete API which toggles active status, then refreshes data
   */
  const handleConfirmDisable = async () => {
    try {
      await softDeleteSupportContact(pendingDisable.id);
      // Close modal and reset state
      setShowDisableConfirm(false);
      setPendingDisable(null);
      setDisableConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Acción realizada correctamente.'); setNotifOpen(true);
    } catch (e: unknown) {
      const msg = parseErrorMessage(e);
      setDisableConfirmError(msg || 'Error al deshabilitar contacto');
      setShowDisableConfirm(true);
    }
  };

  // Loading and error states
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    // Main container with collapsible section styling
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      {/* Section header with toggle button and record count */}
      <button onClick={onToggle} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Contactos de Soporte</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{displayedContacts.length} registros</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {/* Expandable content section */}
      {open && (
        <>
          {/* Filter + Add contact button section */}
          <div className="flex flex-col gap-4 mb-6 px-6 pt-6">
            <div>
              <FilterBar
                onFilter={(params) => { setSearch(params.search ?? ''); setActiveFilter(params.active ?? ''); handleFilter(params); }}
                inputWidth="520px"
                searchPlaceholder="Buscar por información extra"
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
              <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"><Plus className="w-4 h-4" /> Agregar Contacto</button>
            </div>
          </div>

          {/* Contacts grid display with pagination */}
          <div className={`p-6 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedContacts.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No se encontraron contactos con esta búsqueda' : 'No hay contactos disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Render paginated contacts as InfoCard components */}
                {displayedContacts.slice((page - 1) * cardsPerPage, page * cardsPerPage).map((c) => (
                  <InfoCard key={c.id} contact={c} />
                ))}
              </div>
            )}

            {/* Edit contact modal */}
            <ModalFormGeneric isOpen={showEditModal} title="Editar Contacto" fields={[
              { label: "Tipo", name: "type", type: "text", placeholder: "Tipo (ej: Correo, Teléfono)", required: true },
              { label: "Etiqueta", name: "label", type: "text", placeholder: "Etiqueta visible", required: true },
              { label: "Valor", name: "value", type: "text", placeholder: "correo@dominio.com o número", required: true },
              { label: "Info adicional", name: "extra_info", type: "text", placeholder: "Información extra", required: true },
            ]} onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }} onSubmit={handleSubmitEdit} submitText="Actualizar" cancelText="Cancelar" initialValues={editData || {}} customRender={undefined} onProgramChange={undefined} />

            {/* Edit confirmation modal */}
            <ConfirmModal
              isOpen={showEditConfirm}
              title="¿Confirmar actualización?"
              message="¿Estás seguro de que deseas actualizar este contacto?"
              confirmText="Sí, actualizar"
              cancelText="Cancelar"
              onConfirm={handleConfirmEdit}
              onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); setEditConfirmError(null); }}
              errorMessage={editConfirmError}
            />

            {/* Disable/enable confirmation modal */}
            <ConfirmModal
              isOpen={showDisableConfirm}
              title="¿Confirmar acción?"
              message="¿Estás seguro de que deseas deshabilitar este contacto?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); setDisableConfirmError(null); }}
              errorMessage={disableConfirmError}
            />
          </div>

          {/* Pagination component - only show if multiple pages needed */}
          {Math.ceil(displayedContacts.length / cardsPerPage) > 1 && (
            <Paginator page={page} totalPages={Math.ceil(displayedContacts.length / cardsPerPage)} onPageChange={setPage} className="mt-4 px-6" />
          )}

          {/* Add new contact modal */}
          <ModalFormGeneric isOpen={showAddModal} title="Agregar Contacto" fields={[
            { label: "Tipo", name: "type", type: "text", placeholder: "Tipo (ej: Correo, Teléfono)", required: true },
            { label: "Etiqueta", name: "label", type: "text", placeholder: "Etiqueta visible", required: true },
            { label: "Valor", name: "value", type: "text", placeholder: "correo@dominio.com o número", required: true },
            { label: "Info adicional", name: "extra_info", type: "text", placeholder: "Información extra", required: true },
          ]} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} submitText="Registrar" cancelText="Cancelar" customRender={undefined} onProgramChange={undefined} />

            {/* Add confirmation modal */}
            <ConfirmModal
              isOpen={showAddConfirm}
              title="¿Confirmar registro?"
              message="¿Estás seguro de que deseas registrar este contacto?"
              confirmText="Sí, registrar"
              cancelText="Cancelar"
              onConfirm={handleConfirmAdd}
              onCancel={() => { setShowAddConfirm(false); setPendingData(null); setAddConfirmError(null); }}
              errorMessage={addConfirmError}
            />

          {/* Global notification modal for success/error messages */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default SupportContactSection;
