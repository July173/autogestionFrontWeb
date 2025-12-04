import React, { useState, useEffect } from 'react';
import type { LegalDocument } from '../../../Api/types/entities/legalDocument.types';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Paginator from '../../Paginator';
import ModalFormGeneric from '.././ModalFormGeneric';
import ConfirmModal from '../../ConfirmModal';
import NotificationModal from '../../NotificationModal';
import { getAllLegalDocuments, createLegalDocument, updateLegalDocument, softDeleteLegalDocument, filterLegalDocuments } from '../../../Api/Services/LegalDocument';
import FilterBar from '../../FilterBar';
import LoadingOverlay from '../../LoadingOverlay';

const cardsPerPage = 9;

/**
 * Props for LegalDocumentSection component
 */
interface Props {
  /** Whether the section is expanded */
  open: boolean;
  /** Callback to toggle section visibility */
  onToggle: () => void;
}

/**
 * LegalDocumentSection component for managing legal documents
 * Displays a collapsible section with legal documents in a paginated grid
 * Supports CRUD operations: create, read, update, delete legal documents
 * Legal documents include terms of service, privacy policies, etc.
 */
const LegalDocumentSection = ({ open, onToggle }: Props) => {
  // State for legal documents data
  const [docs, setDocs] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modal states for adding legal documents
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingData, setPendingData] = useState<LegalDocument | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);

  // Modal states for editing legal documents
  const [editData, setEditData] = useState<LegalDocument | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<LegalDocument | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Modal states for disabling legal documents
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<LegalDocument | null>(null);

  // Filter UI state
  const [displayedDocs, setDisplayedDocs] = useState<LegalDocument[]>(docs || []);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Notification modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success'|'info'|'warning'|'password-changed'|'email-sent'|'pending'|'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  /**
   * Refresh function to reload legal documents from API
   * Fetches all legal documents and updates local state
   */
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAllLegalDocuments();
      setDocs(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar documentos legales');
    }
    setLoading(false);
  };

  // Load data on component mount
  React.useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedDocs(docs || []);
    }
  }, [docs, filtering]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedDocs(docs || []);
        return;
      }
      const data = await filterLegalDocuments({ search: s, active: a });
      setDisplayedDocs(data || []);
      setPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component for displaying individual legal document information
   * Shows document title, type, effective date, and action buttons
   */
  const InfoCard = ({ doc }: { doc: LegalDocument }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{doc.title || `Documento ${doc.id}`}</h3>
          <p className="text-sm text-gray-600 mt-1">{doc.type} • {doc.effective_date}</p>
        </div>
        {/* Status indicator showing active/inactive state */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${doc.active ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>{doc.active ? 'Activo' : 'Inactivo'}</div>
      </div>
      <div className="flex gap-2">
        {/* Edit button to modify legal document details */}
        <button onClick={() => { setEditData(doc); setShowEditModal(true); }} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        {/* Toggle button to enable/disable legal document */}
        <button onClick={() => { setPendingDisable(doc); setShowDisableConfirm(true); }} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${doc.active ? 'bg-red-100 text-red-900 border-red-700 hover:bg-red-200' : 'bg-green-100 text-green-900 border-green-700 hover:bg-green-200'}`}>{doc.active ? 'Deshabilitar' : 'Habilitar'}</button>
      </div>
    </div>
  );

  // Handler functions for add operations
  const handleAdd = () => setShowAddModal(true);
  const handleSubmitAdd = (values: LegalDocument) => { setPendingData(values); setShowAddConfirm(true); };
  const handleConfirmAdd = async () => {
    setActionLoading(true);
    try {
      await createLegalDocument(pendingData);
      setShowAddModal(false); setShowAddConfirm(false); setPendingData(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Documento creado correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al crear documento'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for edit operations
  const handleSubmitEdit = (values: LegalDocument) => { setPendingEditData(values); setShowEditConfirm(true); };
  const handleConfirmEdit = async () => {
    setActionLoading(true);
    try {
      await updateLegalDocument(editData.id, pendingEditData);
      setShowEditModal(false); setShowEditConfirm(false); setPendingEditData(null); setEditData(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Documento actualizado correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al actualizar documento'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler functions for toggle operations
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      if (!pendingDisable) throw new Error('No hay documento seleccionado');
      if (pendingDisable.active) {
        await softDeleteLegalDocument(pendingDisable.id);
      } else {
        // Reactivate document by updating with active: true
        const payload = { ...(pendingDisable || {}), active: true };
        await softDeleteLegalDocument(pendingDisable.id);
      }
      setShowDisableConfirm(false); setPendingDisable(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Acción realizada correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al deshabilitar documento'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading and error states
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || filtering || actionLoading)} message={actionLoading ? 'Procesando...' : (filtering ? 'Filtrando...' : 'Cargando...')} />
      {/* Section header with toggle button and record count */}
      <button onClick={onToggle} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Documentos Legales</h3>
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{displayedDocs.length} registros</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {open && (
        <>
          {/* Filter bar and Add legal document button */}
          <div className="flex flex-col gap-4 mb-6 px-6 pt-6">
            <div>
              <FilterBar
                onFilter={(params) => { setSearch(params.search ?? ''); setActiveFilter(params.active ?? ''); handleFilter(params); }}
                inputWidth="520px"
                searchPlaceholder="Buscar por título"
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
              <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"><Plus className="w-4 h-4" /> Agregar Documento</button>
            </div>
          </div>

          {/* Legal documents grid with pagination */}
          <div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedDocs.length === 0 ? (
              <div className="col-span-3 text-center text-gray-600 py-8">{(search || activeFilter) ? 'No se encontraron documentos legales con esta búsqueda' : 'No hay documentos legales disponibles'}</div>
            ) : (
              displayedDocs.slice((page - 1) * cardsPerPage, page * cardsPerPage).map((d) => <InfoCard key={d.id} doc={d} />)
            )}

            {/* Edit modal */}
            <ModalFormGeneric isOpen={showEditModal} title="Editar Documento" fields={[
              { label: 'Título', name: 'title', type: 'text', placeholder: 'Título', required: true },
              { label: 'Tipo', name: 'type', type: 'text', placeholder: 'privacy|terms', required: true, disabled: true },
              { label: 'Fecha efectiva', name: 'effective_date', type: 'text', placeholder: 'YYYY-MM-DD', required: true },
            ]} onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }} onSubmit={handleSubmitEdit} submitText="Actualizar" cancelText="Cancelar" initialValues={editData || {}} customRender={undefined} onProgramChange={undefined} />

            {/* Edit confirmation modal */}
            <ConfirmModal isOpen={showEditConfirm} title="¿Confirmar actualización?" message="¿Estás seguro de que deseas actualizar este documento?" confirmText="Sí, actualizar" cancelText="Cancelar" onConfirm={handleConfirmEdit} onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); }} />

            {/* Disable confirmation modal */}
            <ConfirmModal isOpen={showDisableConfirm} title="¿Confirmar acción?" message="¿Estás seguro de que deseas deshabilitar este documento?" confirmText="Sí, continuar" cancelText="Cancelar" onConfirm={handleConfirmDisable} onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }} />
          </div>

          {/* Pagination component - only shown if there are multiple pages */}
          {Math.ceil(displayedDocs.length / cardsPerPage) > 1 && <Paginator page={page} totalPages={Math.ceil(displayedDocs.length / cardsPerPage)} onPageChange={setPage} className="mt-4 px-6" />}

          {/* Add modal */}
          <ModalFormGeneric isOpen={showAddModal} title="Agregar Documento" fields={[
            { label: 'Título', name: 'title', type: 'text', placeholder: 'Título', required: true },
            { label: 'Tipo', name: 'type', type: 'text', placeholder: 'privacy|terms', required: true },
            { label: 'Fecha efectiva', name: 'effective_date', type: 'text', placeholder: 'YYYY-MM-DD', required: true },
          ]} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} submitText="Registrar" cancelText="Cancelar" customRender={undefined} onProgramChange={undefined} />

          {/* Add confirmation modal */}
          <ConfirmModal isOpen={showAddConfirm} title="¿Confirmar registro?" message="¿Estás seguro de que deseas registrar este documento?" confirmText="Sí, registrar" cancelText="Cancelar" onConfirm={handleConfirmAdd} onCancel={() => { setShowAddConfirm(false); setPendingData(null); }} />

          {/* Notification modal for success/error messages */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default LegalDocumentSection;
