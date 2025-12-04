import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from '../../Api/config/ConfigApi';
import Paginator from '../Paginator';
import { getModules, postModule, getModuleForms, putModuleForms, toggleModuleActive } from '../../Api/Services/Module';
import FilterBar from '../FilterBar';
import parseErrorMessage from '../../utils/parseError';
import { getForms } from '../../Api/Services/Form';
import { InfoCard } from './CardSecurity';
import ModalFormGeneric from './ModalFormGeneric';
import ConfirmModal from '../ConfirmModal';
import NotificationModal from '../NotificationModal';
import type { InfoCardProps } from '../../Api/types/entities/misc.types';
import type { Module } from '../../Api/types/entities/module.types';
import type { Form } from '../../Api/types/entities/form.types';
import LoadingOverlay from '../LoadingOverlay';

interface ModuleSectionProps {
  open: boolean;
  onToggle: () => void;
}

const ModuleSection = ({ open, onToggle }: ModuleSectionProps) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [modulesFiltered, setModulesFiltered] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [page, setPage] = useState(1);
  const modulesPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  type ModuleFormValues = { name: string; description?: string; form_ids?: number[] };
  const [pendingModuleData, setPendingModuleData] = useState<ModuleFormValues | null>(null);
  const [editModule, setEditModule] = useState<Partial<Module> & { form_ids?: string[] } | null>(null);
  const [showModuleConfirm, setShowModuleConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingEditData, setPendingEditData] = useState(null);
  const [createConfirmError, setCreateConfirmError] = useState<string | null>(null);
  const [editConfirmError, setEditConfirmError] = useState<string | null>(null);
  const [toggleConfirmError, setToggleConfirmError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [pendingToggleModule, setPendingToggleModule] = useState<Module | null>(null);

  useEffect(() => {
    getModules()
      .then(data => {
        setModules(data);
        setModulesFiltered(data);
      })
      .catch(() => setError('Error al cargar los módulos'))
      .finally(() => setLoading(false));

    (async () => {
      try {
        const f = await getForms();
        setForms(f);
      } catch (e) {
        // ignore fetch errors for forms
        console.debug('Error loading forms for module association', e);
      } finally {
        setLoadingForms(false);
      }
    })();
  }, []);

  const handleFilter = async (params: { search?: string; active?: string }) => {
    setModulesLoading(true);
    setModulesError('');
    const searchValue = params.search ?? search;
    const activeValue = params.active ?? activeFilter;
    setSearch(searchValue);
    setActiveFilter(activeValue);
    try {
      const query = [];
      if (searchValue) query.push(`search=${encodeURIComponent(searchValue)}`);
      if (activeValue !== '') query.push(`active=${activeValue}`);
      const url = `${ENDPOINTS.module.filterModules}${query.length ? '?' + query.join('&') : ''}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error al filtrar módulos');
      const data = await resp.json();
      setModulesFiltered(data);
      setPage(1);
    } catch (e) {
      setModulesError(parseErrorMessage(e) || 'Error al filtrar módulos');
    } finally {
      setModulesLoading(false);
    }
  };

  useEffect(() => {
    if (showEdit && editModule?.name?.toLowerCase() === 'seguridad') {
      if (editModule.form_ids && !editModule.form_ids.includes('1')) {
  setEditModule((prev) => ({ ...(prev as Partial<Module> & { form_ids?: string[] }), form_ids: [ ...(prev?.form_ids || []), '1' ] }));
      }
    }
  }, [showEdit, editModule]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const totalPages = Math.ceil(modulesFiltered.length / modulesPerPage);
  const paginatedModules = modulesFiltered.slice((page - 1) * modulesPerPage, page * modulesPerPage);

  const moduleFields = [
    { name: 'name', label: 'Nombre del Modulo', type: 'text', placeholder: 'Ej : seguridad' },
    { name: 'description', label: 'Descripcion', type: 'text', placeholder: 'Describe que es lo que va  a hacer', maxLength: 100 },
    {
      name: 'form_ids',
      label: 'Formularios',
      type: 'checkbox-group',
      options: forms.filter(f => f.active).map(f => ({ value: String(f.id), label: f.name, disabled: (editModule?.name?.toLowerCase() === 'seguridad' && String(f.id) === '1') })),
    },
  ];

  const overlayMessage = editLoading
    ? 'Actualizando módulo...'
    : loadingForms
      ? 'Cargando formularios...'
      : modulesLoading
        ? 'Filtrando...'
        : loading
          ? 'Cargando...'
          : 'Procesando...';

  const handleCreateModule = (values: ModuleFormValues) => {
    let selectedForms: number[] = [];
    if (Array.isArray(values.form_ids)) selectedForms = values.form_ids.map(Number);
    const data: ModuleFormValues = { name: values.name, description: values.description, form_ids: selectedForms };
    setPendingModuleData(data);
    setShowModuleConfirm(true);
  };

  const handleConfirmCreateModule = async () => {
    if (!pendingModuleData) return;
    setLoading(true);
    setShowModuleConfirm(false);
    try {
      await postModule(pendingModuleData);
      setShowModuleModal(false);
      setPendingModuleData(null);
      setCreateConfirmError(null);
      setNotificationType('success');
      setNotificationTitle('Módulo creado');
      setNotificationMessage('El módulo se ha creado exitosamente.');
      setShowNotification(true);
      const updated = await getModules();
      setModules(updated);
      setModulesFiltered(updated);
    } catch (e) {
      const msg = parseErrorMessage(e) || 'Error al crear el módulo';
      setCreateConfirmError(msg);
      setShowModuleConfirm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditModule = (values: ModuleFormValues) => {
    let selectedForms: number[] = [];
    if (Array.isArray(values.form_ids)) {
      selectedForms = values.form_ids.map(Number);
      if (editModule?.name?.toLowerCase() === 'seguridad' && !selectedForms.includes(1)) selectedForms.push(1);
    }
    const data: ModuleFormValues = { name: values.name, description: values.description, form_ids: selectedForms };
    setPendingEditData(data);
    setShowEditConfirm(true);
  };

  const handleConfirmEditModule = async () => {
    if (!pendingEditData || !editModule) return;
    setLoading(true);
    try {
      await putModuleForms(editModule.id, pendingEditData);
      setShowEdit(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditModule(null);
      setNotificationType('success');
      setNotificationTitle('Módulo actualizado');
      setNotificationMessage('El módulo se ha actualizado exitosamente.');
      setShowNotification(true);
      const updated = await getModules();
      setModules(updated);
    } catch (e) {
      const msg = parseErrorMessage(e) || 'Error al actualizar el módulo';
      setEditConfirmError(msg);
      setShowEditConfirm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (mod: Module) => { setPendingToggleModule(mod); setShowToggleConfirm(true); };

  const handleConfirmToggle = async () => {
    if (!pendingToggleModule) return;
    setShowToggleConfirm(false);
    setLoading(true);
    try {
      await toggleModuleActive(pendingToggleModule.id);
      setNotificationType('success');
      setNotificationTitle(pendingToggleModule.active ? 'Módulo inhabilitado' : 'Módulo habilitado');
      setNotificationMessage(pendingToggleModule.active ? `El módulo "${pendingToggleModule.name}" ha sido inhabilitado exitosamente.` : `El módulo "${pendingToggleModule.name}" ha sido habilitado exitosamente.`);
      setShowNotification(true);
      const updated = await getModules();
      setModules(updated);
    } catch (e) {
      const msg = parseErrorMessage(e) || 'No se pudo cambiar el estado del módulo';
      setToggleConfirmError(msg);
      setShowToggleConfirm(true);
    } finally {
      setLoading(false);
      setPendingToggleModule(null);
    }
  };

  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      <LoadingOverlay isOpen={Boolean(loading || modulesLoading || loadingForms || editLoading)} message={overlayMessage} />
      <div className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex-1 text-left"
        >
          <h3 className="font-semibold text-lg">Módulos</h3>
          <p className="text-sm text-gray-500">Administración de módulos del sistema ({modules.length})</p>
        </button>
        <div>
          {open && (
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                e.preventDefault();
                setShowModuleModal(true); 
              }}
              className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700"
            >
              <span className="text-xl font-bold">+</span>  Modulo
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="p-6">
          <div className="mb-4">
            <FilterBar
              onFilter={params => handleFilter({ search: params.search, active: params.active })}
              inputWidth="710px"
              searchPlaceholder="Buscar por nombre de módulo"
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
            {modulesLoading && <div className="mt-2 text-gray-500">Filtrando...</div>}
            {modulesError && <div className="mt-2 text-red-500">{modulesError}</div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedModules.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">No hay módulos disponibles</div>
            ) : (
              paginatedModules.map((mod) => {
                const showAction = !['inicio', 'seguridad'].includes(mod.name?.toLowerCase());
                const cardProps: InfoCardProps = {
                  title: mod.name,
                  statusLabel: mod.active ? 'Activo' : 'Inhabilitado',
                  statusColor: mod.active ? 'green' : 'red',
                  description: mod.description,
                  count: undefined,
                  buttonText: 'Ajustar',
                  onButtonClick: async () => {
                    setEditLoading(true);
                    try {
                      const data = await getModuleForms(mod.id);
                      const selectedFormIds = (data.form_ids || []).map(String);
                      setEditModule({ id: mod.id, name: data.name, description: data.description, form_ids: selectedFormIds });
                      setShowEdit(true);
                    } catch (e) {
                      alert((e as Error).message || 'No se pudo cargar el módulo');
                    } finally {
                      setEditLoading(false);
                    }
                  },
                  actionLabel: showAction ? (mod.active ? 'Inhabilitar' : 'Habilitar') : undefined,
                  actionType: showAction ? (mod.active ? 'disable' : 'enable') : undefined,
                  onActionClick: showAction ? () => handleToggleClick(mod) : undefined,
                };
                return (
                  <div key={mod.id}>
                    <InfoCard {...cardProps} />
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <Paginator page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
          )}

          <ModalFormGeneric
            isOpen={showEdit}
            title="Editar Modulo-Sena"
            fields={moduleFields}
            onClose={() => { setShowEdit(false); setEditModule(null); setPendingEditData(null); }}
            onSubmit={handleEditModule}
            submitText="Actualizar Modulo"
            cancelText="Cancelar"
            initialValues={editModule ? { ...editModule, form_ids: (editModule.form_ids || []).map(String) } : {}}
            customRender={undefined}
            onProgramChange={undefined}
          />

          <ConfirmModal
            isOpen={showEditConfirm}
            title="¿Confirmar actualización de módulo?"
            message="¿Estás seguro de que deseas actualizar este módulo?"
            confirmText="Sí, actualizar módulo"
            cancelText="Cancelar"
            onConfirm={handleConfirmEditModule}
            onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); setEditConfirmError(null); }}
            errorMessage={editConfirmError}
          />

          <ModalFormGeneric
            isOpen={showModuleModal}
            title="Registrar Nuevo Modulo-Sena"
            fields={moduleFields}
            onClose={() => setShowModuleModal(false)}
            onSubmit={handleCreateModule}
            submitText="Registrar Modulo"
            cancelText="Cancelar"
            customRender={undefined}
            onProgramChange={undefined}
          />

          <ConfirmModal
            isOpen={showModuleConfirm}
            title="¿Confirmar registro de módulo?"
            message="¿Estás seguro de que deseas crear este nuevo módulo?"
            confirmText="Sí, crear módulo"
            cancelText="Cancelar"
            onConfirm={handleConfirmCreateModule}
            onCancel={() => { setShowModuleConfirm(false); setPendingModuleData(null); setCreateConfirmError(null); }}
            errorMessage={createConfirmError}
          />

          <ConfirmModal
            isOpen={showToggleConfirm}
            title={pendingToggleModule?.active ? '¿Inhabilitar módulo?' : '¿Habilitar módulo?'}
            message={pendingToggleModule?.active
              ? `¿Seguro que deseas inhabilitar el módulo "${pendingToggleModule?.name}"?`
              : `¿Seguro que deseas habilitar el módulo "${pendingToggleModule?.name}"?`}
            confirmText="Sí, confirmar"
            cancelText="Cancelar"
            onConfirm={handleConfirmToggle}
            onCancel={() => { setShowToggleConfirm(false); setToggleConfirmError(null); }}
            errorMessage={toggleConfirmError}
          />

          <NotificationModal isOpen={showNotification} onClose={() => setShowNotification(false)} type={notificationType} title={notificationTitle} message={notificationMessage} />
        </div>
      )}
    </div>
  );
};

export default ModuleSection;
