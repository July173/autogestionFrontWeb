import { useEffect, useState } from 'react';
import { ENDPOINTS } from '../Api/config/ConfigApi';
import { getRolesUser, toggleRoleActive, postRolPermissions, getRolPermissions, putRolFormPerms, normalizeRolesArray } from '../Api/Services/Rol';
import { getForms } from '../Api/Services/Form';
import { getPermissions } from '../Api/Services/Permission';
import type { RolUser } from '../Api/types/entities/role.types';
import type { Form } from '../Api/types/entities/form.types';
import type { Permission } from '../Api/types/entities/permission.types';
import parseErrorMessage from '../utils/parseError';

// Local type helpers
type FormPermissionPayload = {
  form_id: number;
  permission_ids: number[];
};

type RolePayload = {
  type_role: string;
  description?: string;
  active: boolean;
  forms: FormPermissionPayload[];
  // legacy key kept optional for compatibility
  formularios?: FormPermissionPayload[];
};

type FormValues = {
  formularios_permisos?: Record<number, number[]>;
};

type EditRole = {
  id: number;
  type_role?: string;
  description?: string;
  active?: boolean;
  formularios_permisos?: Record<number, number[]>;
} | null;

type RolPermissionEntry = {
  form_id?: number | string;
  formId?: number | string;
  form?: unknown;
  permission_ids?: Array<number | string>;
  permissionIds?: Array<number | string>;
  permissions?: Array<number | string>;
};

function getErrorMessage(e: unknown): string {
  return parseErrorMessage(e);
}

export function useRoles() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [rolesFiltered, setRolesFiltered] = useState<RolUser[]>([]);
  const [roles, setRoles] = useState<RolUser[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState('');
  const [page, setPage] = useState(1);
  const rolesPerPage = 6;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<RolUser | null>(null);
  const [confirmActionError, setConfirmActionError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const [pendingRoleData, setPendingRoleData] = useState<RolePayload | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);

  const [openFormId, setOpenFormId] = useState<number | null>(null);

  const [editRole, setEditRole] = useState<EditRole>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<RolePayload | null>(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'warning' | 'info' | 'completed'>('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Load initial data
  useEffect(() => {
    getRolesUser()
      .then(data => {
        const normalized = Array.isArray(data) ? normalizeRolesArray(data) : [];
        setRoles(normalized);
        setRolesFiltered(normalized);
      })
      .catch(() => setError('Error al cargar los roles'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getForms().then((f: Form[]) => setForms(f)).finally(() => setLoadingForms(false));
    getPermissions().then((p: Permission[]) => setPermissions(p)).finally(() => setLoadingPermissions(false));
  }, []);

  const handleActionClick = (rol: RolUser) => {
    setPendingRole(rol);
    setShowConfirm(true);
  };

  const handleEditClick = async (rol: RolUser) => {
    setEditLoading(true);
    try {
      const data = await getRolPermissions(rol.id);
      const formularios_permisos: Record<string, number[]> = {};
      const formsArray = data?.formularios || data?.forms || [];
      (formsArray || []).forEach((f: RolPermissionEntry) => {
        const item = f || {};
        // normalize possible shapes for `form` / `form_id`
        let formIdentifier: number | string | undefined = undefined;
        if (item.form_id !== undefined) formIdentifier = item.form_id;
        else if (item.formId !== undefined) formIdentifier = item.formId;
        else if (item.form !== undefined) {
          if (typeof item.form === 'object' && item.form !== null) {
            const fo = item.form as Record<string, unknown>;
            formIdentifier = (fo['form_id'] ?? fo['id']) as number | string | undefined;
          } else {
            formIdentifier = item.form as number | string | undefined;
          }
        }

        const rawPermissionIds = item.permission_ids ?? item.permissionIds ?? item.permissions ?? [];
        const key = typeof formIdentifier === 'number' ? formIdentifier : Number(formIdentifier);
        formularios_permisos[key] = Array.isArray(rawPermissionIds) ? (rawPermissionIds as Array<number | string>).map(Number) : [];
      });
      setEditRole({
        id: rol.id,
        type_role: data.type_role,
        description: data.description,
        active: data.active,
        formularios_permisos,
      });
      setShowEdit(true);
    } catch (e: unknown) {
      alert(getErrorMessage(e) || 'No se pudo cargar el rol');
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingRole) return;
    setShowConfirm(false);
    try {
      await toggleRoleActive(pendingRole.id, pendingRole.active);
      const updated = await getRolesUser();
      setRoles(Array.isArray(updated) ? normalizeRolesArray(updated) : []);
      showNotif(
        'success',
        pendingRole.active ? 'Rol inhabilitado' : 'Rol habilitado',
        pendingRole.active
          ? `El rol "${pendingRole.name}" ha sido inhabilitado exitosamente.`
          : `El rol "${pendingRole.name}" ha sido habilitado exitosamente.`
      );
      setConfirmActionError(null);
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || 'No se pudo cambiar el estado del rol';
      // keep confirm open and show backend message inside modal
      setConfirmActionError(msg);
      setShowConfirm(true);
      showNotif('warning', 'Error al cambiar estado', msg);
    }
    setPendingRole(null);
  };

  const handleFilter = async (params: { search?: string; active?: string }) => {
    setRolesLoading(true);
    setRolesError('');
    const searchValue = params.search ?? search;
    const activeValue = params.active ?? activeFilter;
    setSearch(searchValue);
    setActiveFilter(activeValue);
    try {
      const query: string[] = [];
      if (searchValue) query.push(`search=${encodeURIComponent(searchValue)}`);
      if (activeValue !== '') query.push(`active=${activeValue}`);
      const url = `${ENDPOINTS.rol.filterRol}${query.length ? '?' + query.join('&') : ''}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error al filtrar roles');
      const data = await resp.json();
      setRolesFiltered(Array.isArray(data) ? normalizeRolesArray(data) : []);
      setPage(1);
    } catch (e: unknown) {
      setRolesError(getErrorMessage(e) || 'Error al filtrar roles');
    } finally {
      setRolesLoading(false);
    }
  };

  const handleCreateRole = (values: FormValues & { type_role?: string; description?: string }) => {
    const formularios: FormPermissionPayload[] = Object.entries(values.formularios_permisos || {})
      .filter(([_, perms]) => Array.isArray(perms) && perms.length > 0)
      .map(([formId, perms]) => ({ form_id: Number(formId), permission_ids: Array.isArray(perms) ? perms.map(Number) : [] }));
    const data: RolePayload = { type_role: values['type_role'] || '', description: values['description'], active: true, forms: formularios, formularios };
    setPendingRoleData(data);
    setShowCreateConfirm(true);
  };

  const handleEditRole = (values: FormValues & { type_role?: string; description?: string }) => {
    let formularios: FormPermissionPayload[] = Object.entries(values.formularios_permisos || {})
      .filter(([_, perms]) => Array.isArray(perms) && perms.length > 0)
      .map(([formId, perms]) => ({ form_id: Number(formId), permission_ids: Array.isArray(perms) ? perms.map(Number) : [] }));
    if ((!formularios || formularios.length === 0) && editRole && editRole.formularios_permisos) {
      formularios = Object.entries(editRole.formularios_permisos || {})
        .filter(([_, perms]) => Array.isArray(perms) && perms.length > 0)
        .map(([formId, perms]) => ({ form_id: Number(formId), permission_ids: Array.isArray(perms) ? perms.map(Number) : [] }));
    }
    const data: RolePayload = { type_role: values['type_role'] || '', description: values['description'], active: true, forms: formularios, formularios };
    setPendingEditData(data);
    setShowEditConfirm(true);
  };

  const handleConfirmCreateRole = async () => {
    if (!pendingRoleData) return;
    try {
      await postRolPermissions(pendingRoleData);
      setShowCreate(false);
      setShowCreateConfirm(false);
      setPendingRoleData(null);
      const updated = await getRolesUser();
      setRoles(Array.isArray(updated) ? normalizeRolesArray(updated) : []);
      showNotif('success', 'Rol creado', 'El rol se ha creado exitosamente.');
    } catch (e: unknown) {
      showNotif('warning', 'Error al crear rol', getErrorMessage(e) || 'Error al crear el rol');
    }
  };

  const handleConfirmEditRole = async () => {
    if (!pendingEditData || !editRole) return;
    try {
      console.log('PUT payload for role update:', JSON.parse(JSON.stringify(pendingEditData)));
      const resp = await putRolFormPerms(editRole.id, pendingEditData);
      console.log('PUT response for role update:', resp);
      setShowEdit(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditRole(null);
      const updated = await getRolesUser();
      setRoles(Array.isArray(updated) ? normalizeRolesArray(updated) : []);
      showNotif('success', 'Rol actualizado', 'El rol se ha actualizado exitosamente.');
    } catch (e: unknown) {
      showNotif('warning', 'Error al actualizar rol', getErrorMessage(e) || 'Error al actualizar el rol');
    }
  };

  const renderFormPermissions = ({ values, setValues }: { values: FormValues; setValues: React.Dispatch<React.SetStateAction<FormValues>> }) => {
    const isAdminRole = (editRole?.type_role?.toLowerCase() === 'administrador');
    return { forms, permissions, values, setValues, isAdminRole, openFormId, setOpenFormId };
  };

  const showNotif = (type: 'success' | 'warning' | 'info' | 'completed', title: string, message: string) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const totalPages = Math.ceil(rolesFiltered.length / rolesPerPage);
  const paginatedRoles = rolesFiltered.slice((page - 1) * rolesPerPage, page * rolesPerPage);

  return {
    // states
    search, setSearch, activeFilter, setActiveFilter,
    rolesFiltered, roles, rolesLoading, rolesError,
    page, setPage, rolesPerPage, totalPages, paginatedRoles,
    loading, error,
    showConfirm, setShowConfirm, pendingRole, setPendingRole,
  confirmActionError,
    showCreate, setShowCreate, forms, permissions, loadingForms, loadingPermissions,
    pendingRoleData, setPendingRoleData, showCreateConfirm, setShowCreateConfirm,
    openFormId, setOpenFormId,
    editRole, setEditRole, showEdit, setShowEdit, editLoading,
    showEditConfirm, setShowEditConfirm, pendingEditData, setPendingEditData,
    showNotification, setShowNotification, notificationType, notificationTitle, notificationMessage,
    // handlers
    handleActionClick, handleEditClick, handleConfirmAction, handleFilter,
    handleCreateRole, handleEditRole, handleConfirmCreateRole, handleConfirmEditRole,
    renderFormPermissions, showNotif,
  };
}

export default useRoles;
