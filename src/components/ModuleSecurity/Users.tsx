

import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, getUserStatus, filterUsers } from '../../Api/Services/User';
import { User, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import ModalCreateUser from './ModalCreateUser';
import ConfirmModal from '../ConfirmModal';
import LoadingOverlay from '../LoadingOverlay';
import ModalEditUser from './ModalEditUser';
import NotificationModal from '../NotificationModal';
import type { User as UsuarioRegistrado } from '../../Api/types/entities/user.types';
import FilterBar from '../FilterBar';
import Paginator from '../Paginator';

/**
 * Users component: Comprehensive user management interface
 * Displays users in three collapsible sections: enabled, registered, and disabled users
 * Supports user creation, editing, enabling/disabling, and filtering with pagination
 */
const Users = () => {
  // Status color and label mappings for user states
  const estadoColor = {
    activo: ' border-green-400',
    inhabilitado: ' border-red-400',
  };

  const estadoLabel = {
    activo: 'Activo',
    inhabilitado: 'Inhabilitado',
  };

  // Call fetchRoles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Pagination state for each section
  const [pageHabilitados, setPageHabilitados] = useState(1);
  const [pageRegistrados, setPageRegistrados] = useState(1);
  const [pageInhabilitados, setPageInhabilitados] = useState(1);
  const cardsPerPage = 6;

  // Main state for users and roles data
  const [users, setUsers] = useState<UsuarioRegistrado[]>([]);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState('');

  // Notification modal state management
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'warning'>('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state management for create/edit operations
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalEditUserProps, setModalEditUserProps] = useState<{ userId?: number, userRole?: string } | null>(null);

  // States for collapsible sections
  const [sectionsOpen, setSectionsOpen] = useState({
    habilitados: false,
    registrados: false,
    inhabilitados: false
  });

  /**
   * Fetch all available roles for user role assignment
   */
  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError('');
    try {
      const res = await import('../../Api/Services/Rol');
      const rolesData = await res.getRoles();
      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
        if (rolesData.length === 0) {
          setRolesError('La lista de roles está vacía');
        }
      } else {
        setRoles([]);
        setRolesError('No se pudo obtener los roles (no es array)');
      }
    } catch (err) {
      setRoles([]);
      setRolesError('No se pudo obtener los roles: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setRolesLoading(false);
    }
  };

  /**
   * Filter users based on search term and role criteria
   * @param {Object} params - Filter parameters
   * @param {string} params.search - Search term for user filtering
   * @param {string} params.role - Role filter criteria
   */
  const handleFilter = async ({ search, role }: { search: string; role: string }) => {
    setLoading(true);
    setError('');
    try {
      const filteredUsers = await filterUsers({ role, search });
      if (!Array.isArray(filteredUsers)) {
        throw new Error('Respuesta de filtrado inválida');
      } setUsers(filteredUsers);
    } catch (err) {
      setError('No se pudo filtrar usuarios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all users from the server
   */
  const fetchAll = async () => {
    try {
      const usersData = await getUsers();
      if (!Array.isArray(usersData)) {
        console.error('fetchAll: expected array but got:', usersData);
        throw new Error('Respuesta de usuarios inválida');
      }
      setUsers(usersData);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error fetching users:', err);
      setError(message || 'Error al cargar los usuarios');
      setNotificationType('warning');
      setNotificationTitle('Error');
      setNotificationMessage(message || 'Error al cargar los usuarios');
      setNotificationOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchAll();
  }, []);

  /**
   * Initiate user status toggle (enable/disable) process
   * @param {UsuarioRegistrado} user - User object to toggle status for
   */
  const handleToggleEstado = (user: UsuarioRegistrado) => {
    setPendingUser(user);
    setShowConfirm(true);
  };

  /**
   * Confirm and execute user status toggle operation
   */
  const handleConfirmToggle = async () => {
    if (!pendingUser) return;
    setShowConfirm(false);
    setLoading(true);
    try {
      await deleteUser(pendingUser.id);
      await fetchAll();
      setNotificationType('success');
      setNotificationTitle(
        getUserStatus(pendingUser) === 'activo'
          ? 'Usuario inhabilitado con éxito'
          : 'Usuario habilitado con éxito'
      );
      setNotificationMessage('La acción se realizó correctamente.');
      setNotificationOpen(true);
    } catch (e) {
      setNotificationType('warning');
      setNotificationTitle('Error');
      setNotificationMessage('No se pudo cambiar el estado del usuario.');
      setNotificationOpen(true);
    } finally {
      setLoading(false);
      setPendingUser(null);
    }
  };

  /**
   * Toggle visibility of user management sections
   * Only one section can be open at a time
   * @param {keyof typeof sectionsOpen} section - Section to toggle
   */
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => {
      const isOpen = prev[section];
      if (isOpen) {
        // If already open, close it
        return { habilitados: false, registrados: false, inhabilitados: false };
      } else {
        // If closed, open only this one and close others
        return { habilitados: false, registrados: false, inhabilitados: false, [section]: true };
      }
    });
  };

  // Get current user info from localStorage to prevent self-disable/edit
  // Some deployments store session under different keys (user_dashboard, user_data, user_email)
  const rawUserData = typeof window !== 'undefined' ? (localStorage.getItem('user_dashboard') || localStorage.getItem('user_data') || null) : null;
  const rawUserEmail = typeof window !== 'undefined' ? (localStorage.getItem('user_email') || null) : null;
  let currentUserId: number | null = null;
  let currentUserEmail: string | null = null;
  let currentUserPersonId: number | null = null;
  try {
    if (rawUserData) {
      const parsed = JSON.parse(rawUserData);
      // Support a few possible shapes stored in localStorage
      currentUserId = parsed?.id ?? parsed?.user?.id ?? parsed?.user_id ?? null;
      currentUserEmail = parsed?.email ?? parsed?.user?.email ?? parsed?.user_email ?? null;
      currentUserPersonId = parsed?.person ?? parsed?.person_id ?? parsed?.user?.person ?? parsed?.user?.person_id ?? null;
    }
  } catch (e) {
    // ignore parse errors
  }
  // If there's a separate user_email key, prefer that value for email comparison
  if (!currentUserEmail && rawUserEmail) currentUserEmail = rawUserEmail;

  /**
   * RegistradoCard component: Displays individual user information in card format
   * Shows user details, status, and action buttons for enable/disable and edit
   * @param {Object} props - Component props
   * @param {UsuarioRegistrado} props.user - User object to display
   */
  function RegistradoCard({ user }: { user: UsuarioRegistrado }) {
    const estado = user.is_active ? 'activo' : 'inhabilitado';
    const color = estadoColor[estado];
    const label = estadoLabel[estado];
    const nombre = user.person
      ? [user.person.first_name, user.person.second_name, user.person.first_last_name, user.person.second_last_name].filter(Boolean).join(' ')
      : 'Sin nombre';
    const rol = user.role?.type_role || 'Sin rol';

    const isSelf = Number(user.id) === Number(currentUserId) || (currentUserEmail && String(user.email) === String(currentUserEmail)) || (user.person && currentUserPersonId && Number(user.person.id) === Number(currentUserPersonId));

    return (
      <div className={`border${color} rounded-lg p-6 m-3 w-full sm:w-[390px] max-w-md min-w-0 min-h-[120px] flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="text-600" />
            <span className="font-semibold">{nombre}</span>
          </div>
          {/* Status indicator badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado === 'activo' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>{label}</span>
        </div>
        <div className="text-sm text-gray-700 mb-1">
          <div>{user.email}</div>
          <div>Documento: <span className="font-bold text-gray-800">{user.person?.number_identification || 'Sin documento'}</span></div>
          <div>Rol : <span className="font-bold text-green-700">{rol}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {/* Prevent self-disable: only show toggle button for other users */}
          {!isSelf && (
            <button
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-2 rounded-3xl text-base font-semibold border transition-all duration-300
                ${estado === 'activo'
                  ? 'bg-red-100 text-red-900 border-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-900 border-green-700 hover:bg-green-200'}
              `}
              onClick={() => handleToggleEstado(user)}
            >
              <User className="w-5 h-5" />
              {estado === 'activo' ? 'Inhabilitar' : 'Habilitar'}
            </button>
          )}
          {/* Edit user button: opens edit modal with user data (hidden for current user) */}
          {!isSelf && (
            <button
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-3xl text-base font-semibold border border-gray-400"
              onClick={() => {
                setModalEditUserProps({ userId: Number(user.id), userRole: rol ? String(rol).toLowerCase() : '' });
                setShowEditModal(true);
              }}
            >
              <span className="material-icons text-base"></span>
              Editar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Separate users by status and registration state
  const registradosUsers = users.filter(u => u.registered === true);
  const habilitados = users.filter(u => !u.registered && u.is_active);
  const inhabilitados = users.filter(u => !u.registered && !u.is_active);

  return (
    <div className="bg-white p-8 rounded-lg shadow relative">
      {/* Loading overlay for actions like enable/disable, fetching */}
      <LoadingOverlay isOpen={loading} message={loading ? 'Procesando...' : 'Cargando...'} />
      {/* Create user button: positioned in top-right corner */}
      <button
        className="absolute right-8 top-8 flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"
        onClick={() => setShowModal(true)}
      >
        <Plus className="w-5 h-5" />
        Registro usuario
      </button>

      <h2 className="text-2xl font-bold mb-6">Gestión De Usuarios-Sena</h2>
      {error && <div className="text-red-500">{error}</div>}

      {/* User filter bar: search and role filtering */}
      {rolesLoading ? (
        <div className="mb-6 text-gray-500">Cargando roles...</div>
      ) : rolesError ? (
        <div className="mb-6 text-red-500">{rolesError}</div>
      ) : (
          <FilterBar
          onFilter={handleFilter}
          inputWidth="710px"
          searchPlaceholder="Buscar por nombre, apellido o documento"
          selects={[{
            name: 'role',
            value: '',
            // map service `name` to select value/label
            options: roles.map(r => ({ value: String(r.name), label: String(r.name) })),
            placeholder: 'Todos los roles',
          }]}
        />
      )}
      <div className="space-y-6">
        {/* Sección Usuarios Habilitados */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('habilitados')}
            className="w-full px-6 py-4 bg-green-50 hover:bg-green-100 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-green-700">Usuarios Habilitados</h3>
              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                {habilitados.length} usuarios
              </span>
            </div>
            {sectionsOpen.habilitados ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {sectionsOpen.habilitados && (
            <div className="p-6">
              <div className="flex flex-wrap">
                {habilitados
                  .slice((pageHabilitados - 1) * cardsPerPage, pageHabilitados * cardsPerPage)
                  .map((u, i) => <RegistradoCard key={`hab-${i + (pageHabilitados - 1) * cardsPerPage}`} user={u} />)}
                {habilitados.length === 0 && (
                  <p className="text-gray-500 italic">No hay usuarios habilitados</p>
                )}
              </div>
              {/* Paginador para habilitados */}
              {habilitados.length > cardsPerPage && (
                <div className="mt-4">
                  <Paginator
                    page={pageHabilitados}
                    totalPages={Math.ceil(habilitados.length / cardsPerPage)}
                    onPageChange={setPageHabilitados}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección Usuarios Registrados */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('registrados')}
            className="w-full px-6 py-4 bg-yellow-50 hover:bg-yellow-100 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-yellow-700">Usuarios Registrados</h3>
              <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
                {registradosUsers.length} usuarios
              </span>
            </div>
            {sectionsOpen.registrados ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {sectionsOpen.registrados && (
            <div className="p-6">
              <div className="flex flex-wrap">
                {registradosUsers
                  .slice((pageRegistrados - 1) * cardsPerPage, pageRegistrados * cardsPerPage)
                  .map((u, i) => <RegistradoCard key={`reg-${i + (pageRegistrados - 1) * cardsPerPage}`} user={u} />)}
                {registradosUsers.length === 0 && (
                  <p className="text-gray-500 italic">No hay usuarios registrados</p>
                )}
              </div>
              {/* Paginador para registrados */}
              {registradosUsers.length > cardsPerPage && (
                <div className="mt-4">
                  <Paginator
                    page={pageRegistrados}
                    totalPages={Math.ceil(registradosUsers.length / cardsPerPage)}
                    onPageChange={setPageRegistrados}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección Usuarios Inhabilitados */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('inhabilitados')}
            className="w-full px-6 py-4 bg-red-50 hover:bg-red-100 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-red-700">Usuarios Inhabilitados</h3>
              <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                {inhabilitados.length} usuarios
              </span>
            </div>
            {sectionsOpen.inhabilitados ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {sectionsOpen.inhabilitados && (
            <div className="p-6">
              <div className="flex flex-wrap">
                {inhabilitados
                  .slice((pageInhabilitados - 1) * cardsPerPage, pageInhabilitados * cardsPerPage)
                  .map((u, i) => <RegistradoCard key={`inh-${i + (pageInhabilitados - 1) * cardsPerPage}`} user={u} />)}
                {inhabilitados.length === 0 && (
                  <p className="text-gray-500 italic">No hay usuarios inhabilitados</p>
                )}
              </div>
              {/* Paginador para inhabilitados */}
              {inhabilitados.length > cardsPerPage && (
                <div className="mt-4">
                  <Paginator
                    page={pageInhabilitados}
                    totalPages={Math.ceil(inhabilitados.length / cardsPerPage)}
                    onPageChange={setPageInhabilitados}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal de crear usuario */}
      {showModal && (
        <ModalCreateUser
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchAll();
            setNotificationType('success');
            setNotificationTitle('Usuario creado con éxito');
            setNotificationMessage('El usuario ha sido registrado correctamente.');
            setNotificationOpen(true);
          }}
        />
      )}
      {/* Modal de edición de usuario */}
      {showEditModal && modalEditUserProps && (
        <ModalEditUser
          userId={modalEditUserProps.userId}
          userRole={modalEditUserProps.userRole}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchAll();
            setNotificationType('success');
            setNotificationTitle('Usuario editado con éxito');
            setNotificationMessage('Los datos del usuario han sido actualizados correctamente.');
            setNotificationOpen(true);
          }}
        />
      )}
      {/* Modal de notificación */}
      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
      />
      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirm}
        title={
          pendingUser && getUserStatus(pendingUser) === 'activo'
            ? "¿Inhabilitar usuario?"
            : "¿Habilitar usuario?"
        }
        message={
          pendingUser && getUserStatus(pendingUser) === 'activo'
            ? "¿Quieres inhabilitar este usuario?"
            : "¿Quieres habilitar este usuario?"
        }
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmToggle}
        onCancel={() => setShowConfirm(false)}
      />


    </div>
  );
};

export default Users;
