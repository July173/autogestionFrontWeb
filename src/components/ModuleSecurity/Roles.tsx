import React from 'react';
import FilterBar from '../FilterBar';
import Paginator from '../Paginator';
import ConfirmModal from '../ConfirmModal';
import { InfoCard } from './CardSecurity';
import type { InfoCardProps } from '../../Api/types/entities/misc.types';
import type {  RolUser } from '../../Api/types/entities/role.types';
import type { Form } from '../../Api/types/entities/form.types';
import type { Permission } from '../../Api/types/entities/permission.types';
import ModalFormGeneric from './ModalFormGeneric';
import { useRoles } from '../../hook/useRoles';
import NotificationModal from '../NotificationModal';
import LoadingOverlay from '../LoadingOverlay';

/**
 * Roles component for managing user roles and their permissions.
 * Provides comprehensive CRUD operations for roles including creation, editing,
 * enable/disable functionality, and complex permission assignment by forms.
 * Features advanced filtering, pagination, and custom permission management UI.
 */
const Roles = () => {
  const {
    search, setSearch, activeFilter, setActiveFilter,
    rolesFiltered, roles, rolesLoading, rolesError,
    page, setPage, rolesPerPage, totalPages, paginatedRoles,
    loading, error,
    showConfirm, setShowConfirm, pendingRole, setPendingRole, confirmActionError,
    showCreate, setShowCreate, forms, permissions, loadingForms, loadingPermissions,
    pendingRoleData, setPendingRoleData, showCreateConfirm, setShowCreateConfirm,
    openFormId, setOpenFormId,
    editRole, setEditRole, showEdit, setShowEdit, editLoading,
    showEditConfirm, setShowEditConfirm, pendingEditData, setPendingEditData,
    showNotification, setShowNotification, notificationType, notificationTitle, notificationMessage,
    handleActionClick, handleEditClick, handleConfirmAction, handleFilter,
    handleCreateRole, handleEditRole, handleConfirmCreateRole, handleConfirmEditRole,
    showNotif,
  } = useRoles();

  type FormValues = { formularios_permisos?: Record<number, number[]> };

  // Form fields configuration for create/edit role modal with custom permissions assignment
  const roleFields = [
    { name: 'type_role', label: 'Nombre del Rol', type: 'text', placeholder: 'Ej: coordinador, aprendiz.' },
    { name: 'description', label: 'Descripcion', type: 'text', placeholder: 'Describe que es lo que va a administrar ese rol', maxLength: 100 },
    {
      name: 'formularios_permisos',
      label: 'Formularios y Permisos',
      type: 'custom-permissions',
      forms: forms.filter((f: Form) => f.active), // only active forms
      permissions: permissions, // use all permissions; Permission type doesn't include `active`
    },
  ];

  // Determine overlay message depending on what is loading
  const overlayMessage = editLoading
    ? 'Actualizando rol...'
    : (loadingForms || loadingPermissions)
      ? 'Cargando...'
      : loading
        ? 'Procesando...'
        : 'Cargando...';

  /**
   * Custom render component for form-permissions assignment UI.
   * Provides accordion-style interface for assigning permissions to forms.
   */
  const renderFormPermissions = ({ values, setValues }: { values: FormValues, setValues: (updater: (prev: FormValues) => FormValues) => void }) => {
    const isAdminRole = (editRole?.type_role?.toLowerCase() === 'administrador');

    return (
      <div className="space-y-4">
        {forms.map((form: Form) => {
          const formId = Number(form.id);
          const formChecked = Array.isArray(values.formularios_permisos?.[formId]) && values.formularios_permisos[formId].length > 0;
          const allPermsChecked = permissions.length > 0 && Array.isArray(values.formularios_permisos?.[formId]) && permissions.every((perm: Permission) => values.formularios_permisos![formId].includes(Number(perm.id)));
          // normalize comparison: openFormId is number | null, form.id may be string -> use numeric formId
          const isOpen = openFormId === formId;
          const isAdminForm = form.name?.toLowerCase().includes('administración') || Number(form.id) === 1;

          return (
            <div key={form.id} className="border rounded-lg mb-2 bg-gray-50">
              <div className="flex items-center p-4 cursor-pointer select-none" onClick={() => setOpenFormId(isOpen ? null : formId)}>
                <span className={`mr-2 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                <input
                  type="checkbox"
                  checked={formChecked}
                  disabled={isAdminRole && isAdminForm}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    if (isAdminRole && isAdminForm) return;
                    setValues((prev: FormValues) => {
                      let newPerms: number[] = [];
                      if (e.target.checked) {
                        newPerms = permissions.map((perm: Permission) => Number(perm.id));
                      }
                      return {
                        ...prev,
                        formularios_permisos: {
                          ...prev.formularios_permisos,
                          [formId]: newPerms
                        }
                      };
                    });
                  }}
                />
                <span className="font-semibold ml-2">{form.name}</span>
                <button
                  type="button"
                  className="ml-4 text-xs text-blue-600 underline"
                  disabled={isAdminRole && isAdminForm}
                  onClick={e => {
                    if (isAdminRole && isAdminForm) return;
                    e.stopPropagation();
                    setValues((prev: FormValues) => {
                      const prevPerms = Array.isArray(prev.formularios_permisos?.[formId]) ? prev.formularios_permisos[formId] : [];
                      let newPerms: number[] = [];
                      if (prevPerms.length < permissions.length) {
                        newPerms = permissions.map((perm: Permission) => Number(perm.id));
                      }
                      return {
                        ...prev,
                        formularios_permisos: {
                          ...prev.formularios_permisos,
                          [formId]: newPerms
                        }
                      };
                    });
                  }}
                >{allPermsChecked ? 'Desmarcar todos' : 'Marcar todos'}</button>
              </div>
              {isOpen && (
                <div className="flex flex-wrap gap-4 ml-10 pb-4">
                  {permissions.map((perm: Permission) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Array.isArray(values.formularios_permisos?.[formId]) ? values.formularios_permisos![formId].includes(Number(perm.id)) : false}
                        disabled={!formChecked || (isAdminRole && isAdminForm)}
                        onChange={e => {
                          if (isAdminRole && isAdminForm) return;
                          setValues((prev: FormValues) => {
                            const prevPerms = Array.isArray(prev.formularios_permisos?.[formId]) ? prev.formularios_permisos[formId] : [];
                            let newPerms: number[];
                            if (e.target.checked) {
                              newPerms = [...prevPerms, Number(perm.id)];
                            } else {
                              newPerms = prevPerms.filter((pid: number) => pid !== Number(perm.id));
                            }
                            return {
                              ...prev,
                              formularios_permisos: {
                                ...prev.formularios_permisos,
                                [formId]: newPerms
                              }
                            };
                          });
                        }}
                      />
                      <span>{perm.type_permission}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <LoadingOverlay isOpen={Boolean(loading || editLoading || loadingForms || loadingPermissions)} message={overlayMessage} />
      {/* Header section with title and create role button */}
      <div className="flex items-center gap-4 mb-6 justify-between">
        <h2 className="text-2xl font-bold">Gestión de Roles - Sena</h2>
        {/* Create new role button */}
        <button
          className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-xl font-bold">+</span> Registro Rol
        </button>
      </div>

      {/* Filter section for search and status */}
      <div className="mb-4">
        <FilterBar
          onFilter={params => handleFilter({ search: params.search, active: params.active })}
          inputWidth="710px"
          searchPlaceholder="Buscar por nombre de rol"
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
        {/* Filter loading and error states */}
  {rolesLoading && <div className="mt-2 text-gray-500">Filtrando...</div>}
  {rolesError && <div className="mt-2 text-red-500">{rolesError}</div>}
        {/* Empty state when filters/search return no results */}
        {!rolesLoading && !rolesError && rolesFiltered.length === 0 && (
          <div className="mt-4 p-4 text-center text-gray-600 w-full">{
            search
              ? `No se encontraron roles para "${search}"`
              : activeFilter === 'true'
                ? 'No hay roles activos'
                : activeFilter === 'false'
                  ? 'No hay roles inactivos'
                  : 'No hay roles registrados'
          }</div>
        )}
      </div>

      {/* Roles display section with cards grid */}
  <div className="flex gap-4 flex-wrap">
        {/* (debug UI removed) */}
        {/* Map through paginated roles to create role cards */}
  {paginatedRoles.map((rol, index) => {
          // `rolesFiltered` contains normalized roles (see normalizeRole)
          const nombre = (rol && (rol.name || ''));
          const descripcion = (rol && (rol.description || ''));
          const cantidadUsuarios = rol?.user_count ?? 0;
          const activeFlag = typeof rol?.active === 'boolean' ? rol.active : true;
          const isAdministrador = (nombre || '').toString().toLowerCase() === 'administrador';
          const cardProps: InfoCardProps = {
            title: nombre,
            statusLabel: activeFlag ? cantidadUsuarios.toString() : 'Inhabilitado',
            statusColor: activeFlag ? 'green' : 'red',
            description: descripcion,
            count: cantidadUsuarios,
            buttonText: 'Ajustar',
            onButtonClick: () => handleEditClick(rol),
            actionLabel: activeFlag ? 'Inhabilitar' : 'Habilitar',
            actionType: activeFlag ? 'disable' : 'enable',
            onActionClick: isAdministrador ? undefined : () => handleActionClick(rol),
          };
          return (
            <div
              key={rol.id}
              className={`transform transition-all duration-300 hover:scale-105 animate-in slide-in-from-left bg-white rounded-lg shadow-md flex flex-col`}
              style={{ animationDelay: `${index * 150}ms`, minWidth: '320px', maxWidth: '320px', minHeight: '220px', maxHeight: 'auto', height: 'auto', display: 'flex' }}
            >
              <InfoCard {...cardProps} />
            </div>
          );
        })}
      </div>
      {/* Pagination component when multiple pages exist */}
      {totalPages > 1 && (
        <Paginator
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-6"
        />
      )}

      {/* Modal for editing existing roles */}
      <ModalFormGeneric
        isOpen={showEdit}
        title="Editar Rol-Sena"
        fields={roleFields}
        onClose={() => { setShowEdit(false); setEditRole(null); setPendingEditData(null); }}
        onSubmit={handleEditRole}
        submitText="Actualizar Rol"
        cancelText="Cancelar"
        initialValues={editRole || {}}
        customRender={renderFormPermissions}
        onProgramChange={undefined}
      />

      {/* Confirmation modal for role edit */}
      <ConfirmModal
        isOpen={showEditConfirm}
        title="¿Confirmar actualización de rol?"
        message="¿Estás seguro de que deseas actualizar este rol?"
        confirmText="Sí, actualizar rol"
        cancelText="Cancelar"
        onConfirm={handleConfirmEditRole}
        onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); }}
      />

      {/* Confirmation modal for enable/disable toggle */}
      <ConfirmModal
        isOpen={showConfirm}
        title={pendingRole?.active ? '¿Inhabilitar rol?' : '¿Habilitar rol?'}
        message={pendingRole?.active
          ? `¿Seguro que deseas inhabilitar el rol "${pendingRole?.name}"?`
          : `¿Seguro que deseas habilitar el rol "${pendingRole?.name}"?`}
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirm(false)}
        errorMessage={confirmActionError}
      />

      {/* Modal for creating new roles */}
      <ModalFormGeneric
        isOpen={showCreate}
        title="Registrar Nuevo Rol-Sena"
        fields={roleFields}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateRole}
        submitText="Registrar Rol"
        cancelText="Cancelar"
        customRender={renderFormPermissions}
        onProgramChange={undefined}
      />

      {/* Confirmation modal for role creation */}
      <ConfirmModal
        isOpen={showCreateConfirm}
        title="¿Confirmar registro de rol?"
        message="¿Estás seguro de que deseas crear este nuevo rol?"
        confirmText="Sí, crear rol"
        cancelText="Cancelar"
        onConfirm={handleConfirmCreateRole}
        onCancel={() => { setShowCreateConfirm(false); setPendingRoleData(null); }}
      />

      {/* Global notification modal for success/error messages */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
      />
    </div>
  );
};


export default Roles;
