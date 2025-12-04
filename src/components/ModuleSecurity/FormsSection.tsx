import React, { useState, useRef, useEffect } from 'react';
import FilterBar from '../FilterBar';
import Paginator from '../Paginator';
import ModalFormGeneric from './ModalFormGeneric';
import ConfirmModal from '../ConfirmModal';
import NotificationModal from '../NotificationModal';
import useForms from '../../hook/useForms';
import parseErrorMessage from '../../utils/parseError';
import { Form as FormType } from '../../Api/types/entities/form.types';
import { putForm } from '../../Api/Services/Form';
import LoadingOverlay from '../LoadingOverlay';

interface FormsSectionProps {
  open: boolean;
  onToggle: () => void;
}

const cardsPerPage = 9;

const FormsSection = ({ open, onToggle }: FormsSectionProps) => {
  const { forms, loading, error, refresh, createForm, applyFilter } = useForms();
  const [page, setPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState<Partial<FormType> | null>(null);
  const [confirmToggleForm, setConfirmToggleForm] = useState<FormType | null>(null);
  const [confirmToggleError, setConfirmToggleError] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(forms.length / cardsPerPage);
  const paginated = forms.slice((page - 1) * cardsPerPage, page * cardsPerPage);

  const formFieldsBase = [
    { name: 'name', label: 'Nombre del Formulario', type: 'text', placeholder: 'Ej : gestion.' },
    { name: 'path', label: 'Direccion del Formulario', type: 'text', placeholder: 'Ej : src/user/form' },
    { name: 'description', label: 'Descripcion', type: 'text', placeholder: 'Describe que hace', maxLength: 200 },
  ];

  // When editing a form we don't want to show the 'active' toggle inside the edit modal
  const formFields = editingForm ? formFieldsBase.filter(f => f.name !== 'active') : formFieldsBase;

  const overlayMessage = actionLoading ? 'Procesando...' : filtering ? 'Filtrando...' : loading ? 'Cargando...' : 'Cargando...';

  const handleCreate = (values: Partial<FormType>) => {
    // values from modal: if editingForm is set then it's an edit
    if (editingForm) {
      // merge and save
      const payload = { ...editingForm, ...values } as FormType;
      (async () => {
        setActionLoading(true);
        try {
          await putForm(payload.id!, payload);
          setNotifType('success');
          setNotifTitle('Formulario actualizado');
          setNotifMessage('El formulario se actualizó correctamente.');
          setNotifOpen(true);
          setEditingForm(null);
          setShowFormModal(false);
          await refresh();
        } catch (e) {
          const msg = parseErrorMessage(e) || 'Error al actualizar formulario';
          setNotifType('warning');
          setNotifTitle('Error al actualizar formulario');
          setNotifMessage(msg);
          setNotifOpen(true);
        } finally {
          setActionLoading(false);
        }
      })();
    } else {
      setEditingForm(null);
      // create flow handled by useForms
      (async () => {
        setActionLoading(true);
        try {
          await createForm(values as Partial<FormType>);
          setNotifType('success');
          setNotifTitle('Formulario creado');
          setNotifMessage('El formulario se creó correctamente.');
          setNotifOpen(true);
          setShowFormModal(false);
          await refresh();
        } catch (e) {
          const msg = parseErrorMessage(e) || 'Error al crear formulario';
          setNotifType('warning');
          setNotifTitle('Error al crear formulario');
          setNotifMessage(msg);
          setNotifOpen(true);
        } finally {
          setActionLoading(false);
        }
      })();
    }
  };

  // debounce timer ref to avoid issuing many requests while inputs change
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (filterTimer.current) {
        clearTimeout(filterTimer.current);
        filterTimer.current = null;
      }
    };
  }, []);

  const handleFilter = (params?: { search?: string; active?: string }) => {
    setPage(1);
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;

    // update local inputs and show smooth filtering state
    setSearch(s ?? '');
    setActiveFilter(a ?? '');

    // clear any pending filter call
    if (filterTimer.current) {
      clearTimeout(filterTimer.current);
      filterTimer.current = null;
    }

    // show filtering state immediately
    setFiltering(true);

    // debounce the actual applyFilter call (250ms) to avoid rapid duplicate requests
    filterTimer.current = setTimeout(async () => {
      try {
        await applyFilter({ search: s, active: a });
      } catch (err) {
        // keep behavior consistent with previous implementation: don't block UI
        console.error('Error applying filter', err);
      } finally {
        // small delay so UI transition isn't abrupt
        setTimeout(() => setFiltering(false), 180);
        if (filterTimer.current) {
          clearTimeout(filterTimer.current);
          filterTimer.current = null;
        }
      }
    }, 250);
  };

  const openCreate = () => {
    setEditingForm(null);
    setShowFormModal(true);
  };

  const openEdit = (f: FormType) => {
    setEditingForm(f);
    setShowFormModal(true);
  };

  const confirmToggle = (f: FormType) => setConfirmToggleForm(f);

  const doToggle = async () => {
    if (!confirmToggleForm) return;
    setActionLoading(true);
    try {
      const payload = { ...confirmToggleForm, active: !confirmToggleForm.active } as FormType;
      await putForm(payload.id!, payload);
      setNotifType('success');
      setNotifTitle(payload.active ? 'Formulario habilitado' : 'Formulario inhabilitado');
      setNotifMessage(`El formulario "${payload.name}" se ha actualizado.`);
      setNotifOpen(true);
      setConfirmToggleForm(null);
      setConfirmToggleError(null);
      await refresh();
    } catch (e) {
      const msg = parseErrorMessage(e) || String(e);
      // keep confirmation modal open and show backend message inside it
      setConfirmToggleError(msg);
      setConfirmToggleForm(confirmToggleForm);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || filtering || actionLoading)} message={overlayMessage} />
      <div className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex-1 text-left"
        >
          <h3 className="font-semibold text-lg">Formularios</h3>
          <p className="text-sm text-gray-500">Administración de formularios del sistema ({forms.length})</p>
        </button>
        <div>
          {/* show create button only when expanded */}
          {open && (
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                e.preventDefault();
                openCreate(); 
              }}
              className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700"
            >
              <span className="text-xl font-bold">+</span>  Formulario
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="p-6">
          <div className="mb-4">
            <FilterBar
              onFilter={(params) => { setSearch(params.search ?? ''); setActiveFilter(params.active ?? ''); handleFilter(params); }}
              inputWidth="520px"
              searchPlaceholder="Buscar por nombre de formulario"
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

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {paginated.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No hay formularios disponibles con esta búsqueda' : 'No hay formularios disponibles'}
              </div>
            ) : (
              paginated.map((f) => (
                <div key={f.id} className="bg-white rounded-lg shadow p-4 border flex flex-col justify-between transition-transform duration-200 hover:translate-y-0.5">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{f.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{f.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Ruta: {f.path}</p>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <button onClick={() => openEdit(f)} className="px-3 py-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-2xl">Editar</button>
                    <button
                      onClick={() => confirmToggle(f)}
                      className={
                        `px-3 py-1 rounded-2xl ${f.active ? 'bg-red-50 text-red-900 border border-red-700 hover:bg-red-200' : 'bg-green-50 text-green-900 border border-green-700 hover:bg-green-200'}`
                      }
                    >
                      {f.active ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filtering && (
            <div className="mt-4 text-sm text-gray-600">Filtrando resultados…</div>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}

          <ModalFormGeneric
            isOpen={showFormModal}
            title={editingForm ? 'Editar Formulario' : 'Agregar Formulario'}
            fields={formFields}
            onClose={() => { setShowFormModal(false); setEditingForm(null); }}
            onSubmit={(vals) => handleCreate(vals)}
            submitText={editingForm ? 'Actualizar' : 'Registrar'}
            cancelText="Cancelar"
            initialValues={editingForm || undefined}
            customRender={undefined}
            onProgramChange={undefined}
          />

          <ConfirmModal
            isOpen={!!confirmToggleForm}
            title={confirmToggleForm?.active ? '¿Inhabilitar formulario?' : '¿Habilitar formulario?'}
            message={confirmToggleForm?.active ? `¿Seguro que deseas inhabilitar el formulario "${confirmToggleForm?.name}"?` : `¿Seguro que deseas habilitar el formulario "${confirmToggleForm?.name}"?`}
            confirmText="Sí, confirmar"
            cancelText="Cancelar"
            onConfirm={doToggle}
            onCancel={() => { setConfirmToggleForm(null); setConfirmToggleError(null); }}
            errorMessage={confirmToggleError}
          />

          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </div>
      )}
    </div>
  );
};

export default FormsSection;
