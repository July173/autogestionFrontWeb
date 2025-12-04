import React, { useState, useEffect } from 'react';
import type { LegalSection } from '../../../Api/types/entities/legalDocument.types';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Paginator from '../../Paginator';
import ModalFormGeneric from '../ModalFormGeneric';
import ParentSectionAutocomplete, { ParentSectionOption } from '../ParentSectionAutocomplete';
import ConfirmModal from '../../ConfirmModal';
import NotificationModal from '../../NotificationModal';
import { getAllLegalSections, createLegalSection, updateLegalSection, softDeleteLegalSection, filterLegalSections } from '../../../Api/Services/LegalSection';
import FilterBar from '../../FilterBar';
import LoadingOverlay from '../../LoadingOverlay';
import { getAllLegalDocuments } from '../../../Api/Services/LegalDocument';

const cardsPerPage = 3;

interface Props { open: boolean; onToggle: () => void }

const LegalSectionSection = ({ open, onToggle }: Props) => {
  // Modal and selection state declarations
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddDocumentId, setSelectedAddDocumentId] = useState<number | null>(null);
  const [selectedEditDocumentId, setSelectedEditDocumentId] = useState<number | null>(null);
  const [pendingData, setPendingData] = useState<Partial<LegalSection>>({ parent: null });
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [editData, setEditData] = useState<LegalSection | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Partial<LegalSection> | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<LegalSection | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [displayedSections, setDisplayedSections] = useState<LegalSection[]>([]);
  const [documents, setDocuments] = useState<{ value: number; label: string }[]>([]);
  const [parentSections, setParentSections] = useState<{ value: number | null; label: string; document_id?: number }[]>([]);
  const [parentAutocompleteOptions, setParentAutocompleteOptions] = useState<ParentSectionOption[]>([]);
  const [selectedParentOption, setSelectedParentOption] = useState<ParentSectionOption | null>(null);
  const [autoOrder, setAutoOrder] = useState<number>(1);
  const [autoCode, setAutoCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ...existing code...
  // Confirm add handler for ConfirmModal
  const handleConfirmAdd = async () => {
    if (!pendingData) return;
    setActionLoading(true);
    try {
  // Forzar parent_id a null si no hay selección
  // Normalize payload keys to what the backend expects: 'document' and 'parent'
  const pending = pendingData as Record<string, unknown>;
  const documentValue = (pending['document_id'] ?? pending['document'] ?? selectedAddDocumentId) as number | string | null | undefined;
  const parentValue = (pending['parent_id'] ?? pending['parent'] ?? (selectedParentOption ? selectedParentOption.value : null)) as number | string | null | undefined;
  const dataToSend: Partial<LegalSection> & { document: number | null; parent: number | null } = {
    // copy the important fields explicitly to avoid sending legacy keys like document_id
    title: pendingData.title,
    content: pendingData.content,
    order: typeof pendingData.order !== 'undefined' ? pendingData.order : autoOrder,
    code: pendingData.code,
    document: documentValue !== undefined && documentValue !== null ? Number(documentValue) : null,
    parent: parentValue !== undefined && parentValue !== null ? Number(parentValue) : null,
  };
  await createLegalSection(dataToSend);
      setShowAddConfirm(false);
      setPendingData(null);
      setShowAddModal(false);
      await refresh();
      setNotifType('success');
      setNotifTitle('Éxito');
      setNotifMessage('Sección registrada correctamente.');
      setNotifOpen(true);
    } catch (e) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage(e.message || 'Error al registrar sección');
      setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Sincroniza el documento seleccionado al abrir el modal de agregar
  React.useEffect(() => {
    if (showAddModal) {
      setSelectedAddDocumentId(null);
    }
  }, [showAddModal]);

  // Reset parentId when document changes in add modal
  React.useEffect(() => {
    if (showAddModal) {
      // Optionally reset parentId in pendingData if needed
  setPendingData((prev) => prev ? { ...prev, parent_id: null } : prev);
    }
  }, [selectedAddDocumentId, showAddModal]);

  // Sincroniza el documento seleccionado al abrir el modal de editar
  React.useEffect(() => {
    if (showEditModal && editData?.document) {
      setSelectedEditDocumentId(editData.document);
    }
  }, [showEditModal, editData]);
  // ...existing code...

  const refresh = async () => {
    setLoading(true);
    try {
      const [sectionsData, docsData] = await Promise.all([
        getAllLegalSections(),
        getAllLegalDocuments()
      ]);
      setSections(sectionsData);
  setDocuments(Array.isArray(docsData) ? docsData.map((d: { id: number; title: string }) => ({ value: d.id, label: d.title })) : []);
      setParentSections([
        { value: null, label: 'Sin padre' },
        ...sectionsData.map((s: LegalSection) => ({ value: s.id, label: s.title, document_id: s.document }))
      ]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar secciones legales');
    }
    setLoading(false);
  };

  React.useEffect(() => { refresh(); }, []);

  useEffect(() => { if (!displayedSections.length) setDisplayedSections(sections || []); }, [sections]);

  // Filter state and handler
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedSections(sections || []);
        return;
      }
      const data = await filterLegalSections({ search: s, active: a });
      setDisplayedSections(data || []);
      setPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  // Actualiza las opciones del autocomplete de padres cada vez que cambia el documento seleccionado
  React.useEffect(() => {
  const filtered = parentSections.filter(s => s.value === null || (selectedAddDocumentId !== null && s.document_id === selectedAddDocumentId));
    setParentAutocompleteOptions(filtered.map(s => {
      let code = '---';
      if (s.value !== null) {
  const sec = sections.find(sec => sec.id === s.value);
  code = sec?.code || s.label || '';
      }
      return {
        value: s.value,
        code,
        title: s.label,
        label: `${code} ${s.label}`
      };
    }));
  }, [selectedAddDocumentId, parentSections, sections]);

  // Calcula automáticamente el siguiente order y code al cambiar documento o padre
  React.useEffect(() => {
    const parentId = selectedParentOption?.value ?? null;
    let nextOrder = 1;
    let nextCode = '';
    if (!selectedAddDocumentId) {
      setAutoOrder(1);
      setAutoCode('');
      return;
    }
    if (!parentId) {
      // Sin padre: buscar el último código raíz para este documento
  const rootSections = sections.filter(s => s.document === selectedAddDocumentId && !s.parent);
      // Los códigos raíz son tipo "1", "2", "3"...
  const rootCodes = rootSections.map(s => s.code).filter(Boolean);
      const lastNum = rootCodes.length > 0 ? Math.max(...rootCodes.map(c => parseInt(c.split('.')[0], 10)).filter(n => !isNaN(n))) : 0;
  nextOrder = rootSections.length + 1;
  nextCode = String(lastNum + 1);
    } else {
      // Con padre: buscar hijos de ese padre
  const parentSection = sections.find(s => s.id === parentId);
  const childSections = sections.filter(s => s.parent === parentId && s.document === selectedAddDocumentId);
      // Los códigos hijos son tipo "1.1", "1.2", "1.1.1"...
  const childCodes = childSections.map(s => s.code).filter(Boolean);
  const baseCode = parentSection?.code || '';
      // Buscar el último número hijo
      let lastNum = 0;
      if (childCodes.length > 0) {
        lastNum = Math.max(...childCodes.map(c => {
          const parts = c.split('.');
          return parseInt(parts[parts.length - 1], 10);
        }).filter(n => !isNaN(n)));
      }
      nextOrder = childSections.length + 1;
      nextCode = baseCode ? `${baseCode}.${lastNum + 1}` : String(lastNum + 1);
    }
    setAutoOrder(nextOrder);
    setAutoCode(nextCode);
  }, [selectedAddDocumentId, selectedParentOption, sections, documents]);

  // Filtra parentId options según documentId seleccionado
  function getFilteredParentSections(documentId: number | null) {
  // DEBUG: Log filtering process
  const filtered = parentSections.filter(s => s.value === null || (documentId !== null && s.document_id === documentId));
  return filtered;
  }

  const InfoCard = ({ section }: { section: LegalSection }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{section.title || `Sección ${section.id}`}</h3>
          <p className="text-sm text-gray-600 mt-1">Código: {section.code} • Orden: {section.order}</p>
          <p className="text-sm text-gray-600 mt-1">Documento: {(() => {
            const doc = documents.find(d => d.value === section.document);
            return doc ? doc.label : section.document;
          })()}</p>
          <p className="text-sm text-gray-700 mt-2">{section.content}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${section.active ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>{section.active ? 'Activo' : 'Inactivo'}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setEditData(section); setShowEditModal(true); }} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        <button onClick={() => { setPendingDisable(section); setShowDisableConfirm(true); }} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${section.active ? 'bg-red-100 text-red-900 border-red-700 hover:bg-red-200' : 'bg-green-100 text-green-900 border-green-700 hover:bg-green-200'}`}>{section.active ? 'Deshabilitar' : 'Habilitar'}</button>
      </div>
    </div>
  );

  const handleAdd = () => setShowAddModal(true);
  const handleSubmitAdd = (values: Partial<LegalSection>) => {
    // Asegurar que los campos informativos se incluyan
    const data = {
      ...values,
      order: typeof values.order !== 'undefined' ? values.order : autoOrder,
      code: typeof values.code !== 'undefined' ? values.code : autoCode
    };
    // Forzar parent_id a null si es undefined o no seleccionado
    if (data.parent === undefined || data.parent === null) {
      data.parent = null;
    }
    // Validación de order y code
    if (!data.order) {
      setNotifType('warning');
      setNotifTitle('Error');
      setNotifMessage('El campo "Orden" es obligatorio y debe ser un número.');
      setNotifOpen(true);
      return;
    }
    setPendingData(data);
    setShowAddConfirm(true);
  };
  
  // Prepare edit submission: set pending edit data and show confirmation
  const handleSubmitEdit = (values: Partial<LegalSection>) => {
    const data = {
      ...values,
      order: typeof values.order !== 'undefined' ? values.order : autoOrder,
      code: typeof values.code !== 'undefined' ? values.code : autoCode,
    } as Partial<LegalSection>;
    if (data.parent === undefined || data.parent === null) data.parent = null;
    setPendingEditData(data);
    setShowEditConfirm(true);
  };
  const handleConfirmEdit = async () => {
    setActionLoading(true);
    try {
      if (!editData) throw new Error('No hay sección para editar');
      const pending = (pendingEditData || {}) as Record<string, unknown>;
      const documentValue = (pending['document_id'] ?? pending['document'] ?? selectedEditDocumentId) as number | string | null | undefined;
      const parentValue = (pending['parent_id'] ?? pending['parent'] ?? (selectedParentOption ? selectedParentOption.value : null)) as number | string | null | undefined;
      const dataToSend: Partial<LegalSection> & { document?: number | null; parent?: number | null } = {
        title: pendingEditData?.title ?? editData.title,
        content: pendingEditData?.content ?? editData.content,
        order: typeof pendingEditData?.order !== 'undefined' ? pendingEditData.order : editData.order,
        code: pendingEditData?.code ?? editData.code,
        document: documentValue !== undefined && documentValue !== null ? Number(documentValue) : editData.document ?? null,
        parent: parentValue !== undefined && parentValue !== null ? Number(parentValue) : (editData.parent ?? null),
      };
      await updateLegalSection(editData.id, dataToSend);
      setShowEditModal(false); setShowEditConfirm(false); setPendingEditData(null); setEditData(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Sección actualizada correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al actualizar sección'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDisable = async () => {
    setActionLoading(true);
    try {
      if (!pendingDisable) throw new Error('No hay sección seleccionada');
      if (pendingDisable.active) {
        await softDeleteLegalSection(pendingDisable.id);
      } else {
        const payload = { ...(pendingDisable || {}), active: true };
        await softDeleteLegalSection(pendingDisable.id);
      }
      setShowDisableConfirm(false); setPendingDisable(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Acción realizada correctamente.'); setNotifOpen(true);
    } catch (e) {
      setNotifType('warning'); setNotifTitle('Error'); setNotifMessage(e instanceof Error ? e.message : 'Error al deshabilitar sección'); setNotifOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || filtering || actionLoading)} message={actionLoading ? 'Procesando...' : (filtering ? 'Filtrando...' : 'Cargando...')} />
      <button onClick={onToggle} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Secciones Legales</h3>
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{displayedSections.length} registros</span>
            </div>
            {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
      {open && (
        <>
          {/* Filter bar and Add section button */}
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
              <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"><Plus className="w-4 h-4" /> Agregar Sección</button>
            </div>
          </div>

          <div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedSections.length === 0 ? (
              <div className="col-span-3 text-center text-gray-600 py-8">{(search || activeFilter) ? 'No se encontraron secciones con esta búsqueda' : 'No hay secciones disponibles'}</div>
            ) : (
              displayedSections.slice((page - 1) * cardsPerPage, page * cardsPerPage).map((s) => <InfoCard key={s.id} section={s} />)
            )}

            <ModalFormGeneric
              isOpen={showEditModal}
              title="Editar Sección"
              fields={[
                {
                  label: 'Documento',
                  name: 'document_id',
                  type: 'info',
                  value: (() => {
                    const doc = documents.find(d => d.value === editData?.document);
                    return doc ? doc.label : editData?.document;
                  })(),
                  required: false,
                  disabled: true
                },
                ...(editData?.parent ? [{
                  label: 'Sección padre',
                  name: 'parent_id',
                  type: 'info',
                  value: (() => {
                    const parent = parentSections.find(p => p.value === editData.parent);
                    return parent ? parent.label : editData.parent;
                  })(),
                  required: false,
                  disabled: true
                }] : []),
                { label: 'Orden', name: 'order', type: 'info', value: editData?.order ?? '', required: false, disabled: true },
                { label: 'Código', name: 'code', type: 'info', value: editData?.code ?? '', required: false, disabled: true },
                { label: 'Título', name: 'title', type: 'text', placeholder: 'Título', required: true },
                { label: 'Contenido', name: 'content', type: 'text', placeholder: 'Contenido', required: true, maxLength: 100 },
              ]}
              onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); setSelectedEditDocumentId(null); }}
              onSubmit={handleSubmitEdit}
              submitText="Actualizar"
              cancelText="Cancelar"
              initialValues={editData || {}}
              customRender={undefined}
              onProgramChange={undefined}
            />

            <ConfirmModal isOpen={showEditConfirm} title="¿Confirmar actualización?" message="¿Estás seguro de que deseas actualizar esta sección?" confirmText="Sí, actualizar" cancelText="Cancelar" onConfirm={handleConfirmEdit} onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); }} />

            <ConfirmModal isOpen={showDisableConfirm} title="¿Confirmar acción?" message="¿Estás seguro de que deseas deshabilitar esta sección?" confirmText="Sí, continuar" cancelText="Cancelar" onConfirm={handleConfirmDisable} onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }} />
          </div>

          {Math.ceil(displayedSections.length / cardsPerPage) > 1 && <Paginator page={page} totalPages={Math.ceil(displayedSections.length / cardsPerPage)} onPageChange={setPage} className="mt-4 px-6" />}

            <ModalFormGeneric
              isOpen={showAddModal}
              title="Agregar Sección"
              fields={[
                {
                  label: 'Documento',
                  name: 'document_id',
                  type: 'select',
                  customSelect: true,
                  options: documents,
                  placeholder: 'Seleccione documento',
                  required: true
                },
                {
                  label: 'Sección padre',
                  name: 'parent_id',
                  type: 'autocomplete',
                  customRender: ({ value, setValue }) => (
                    <ParentSectionAutocomplete
                      options={parentAutocompleteOptions}
                      value={selectedParentOption}
                      onChange={opt => { setSelectedParentOption(opt); setValue(opt ? opt.value : null); }}
                      placeholder="Buscar sección padre..."
                    />
                  ),
                  required: false
                },
                { label: 'Orden', name: 'order', type: 'info', value: autoOrder, required: false, disabled: true },
                { label: 'Código', name: 'code', type: 'info', value: autoCode, required: false, disabled: true },
                { label: 'Título', name: 'title', type: 'text', placeholder: 'Título', required: true },
                { label: 'Contenido', name: 'content', type: 'text', placeholder: 'Contenido', required: true, maxLength: 100 },
              ]}
              onClose={() => { setShowAddModal(false); setSelectedAddDocumentId(null); setSelectedParentOption(null); setPendingData({ parent: null }); }}
              onSubmit={handleSubmitAdd}
              submitText="Registrar"
              cancelText="Cancelar"
              customRender={({ value, setValue }) => value}
              onProgramChange={(e) => {
                // ModalFormGeneric may simulate the event with name 'documentId' for CustomSelect
                const name = e?.target?.name;
                if (name === 'document_id' || name === 'documentId') {
                  const numValue = typeof e.target.value === 'string' ? Number(e.target.value) : e.target.value;
                  setSelectedAddDocumentId(numValue);
                  setSelectedParentOption(null);
                }
              }}
            />

          <ConfirmModal isOpen={showAddConfirm} title="¿Confirmar registro?" message="¿Estás seguro de que deseas registrar esta sección?" confirmText="Sí, registrar" cancelText="Cancelar" onConfirm={handleConfirmAdd} onCancel={() => { setShowAddConfirm(false); setPendingData(null); }} />

          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default LegalSectionSection;
