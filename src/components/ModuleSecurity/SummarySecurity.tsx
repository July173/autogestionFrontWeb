import React, { useEffect, useState } from 'react';
import { getRolesFormsPerms, getRolesUser } from '../../Api/Services/Rol';
import { getForms } from '../../Api/Services/Form';
import type { Permission, RolUserCount } from '../../Api/types/entities/role.types';

/**
 * Color mapping for different user roles in the distribution display
 * Each role has specific background, border, and text colors for visual distinction
 */
const roleColors: Record<string, string> = {
  Administrador: 'bg-green-50 border-green-400 text-green-700',
  Usuarios: 'bg-red-50 border-red-400 text-red-700',
  Aprendices: 'bg-blue-50 border-blue-400 text-blue-700',
  Instructores: 'bg-yellow-50 border-yellow-400 text-yellow-700',
  Coordinadores: 'bg-pink-50 border-pink-400 text-pink-700',
};

/**
 * Check icon for granted permissions
 */
const iconCheck = <span className="text-green-600 text-lg">✓</span>;
/**
 * Cross icon for denied permissions
 */
const iconCross = <span className="text-red-600 text-lg">✗</span>;

/**
 * SummarySecurity component
 * ------------------------
 * Shows a comprehensive summary of the platform's security model:
 * - Permissions table by role and form (view, edit, register, delete, activate/deactivate).
 * - User distribution by role with custom colors, labels, and animated cards.
 * - Loading and error handling for both permissions and user role queries.
 * - Pagination for large permissions datasets.
 *
 * Features:
 * - Responsive table with permission matrix visualization
 * - Color-coded role distribution cards with hover animations
 * - Custom pagination controls for permissions table
 * - Error boundaries for API failures
 * - Loading states for better UX
 *
 * @returns {JSX.Element} Security summary dashboard panel.
 */
const SummarySecurity = () => {
  // Pagination state for permissions table
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Permissions data states
  const [permisos, setPermisos] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User roles distribution states
  const [rolesUser, setRolesUser] = useState<RolUserCount[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState('');
  const [roleNames, setRoleNames] = useState<Record<number, string>>({});
  const [formNames, setFormNames] = useState<Record<number, string>>({});
  type FormType = { id: number; name?: string; title?: string; label?: string };

  // Calculate pagination after permissions/useState/useEffect
  let permisosFiltrados: Permission[] = [];
  let totalPages = 1;
  let paginatedPerms: Permission[] = [];
  if (Array.isArray(permisos)) {
    // Filter permissions to show only those with at least one granted permission
    permisosFiltrados = permisos.filter(perm => perm.Ver || perm.Editar || perm.Registrar || perm.Eliminar || perm.Activar);
    totalPages = Math.max(1, Math.ceil(permisosFiltrados.length / rowsPerPage));
    paginatedPerms = permisosFiltrados.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }

  // Fetch permissions and user roles on component mount
  useEffect(() => {
    // Load permissions matrix (role-form-permission relationships)
    getRolesFormsPerms()
      .then(setPermisos)
      .catch(() => setError('Error al cargar permisos'))
      .finally(() => setLoading(false));

    // Load user distribution by roles
    getRolesUser()
      .then(data => {
        // The backend returns objects with keys like { id, nombre, descripcion, active, cantidad_usuarios }
        // Map them to the shape the component expects: { id, name, description, active, user_count }
        const mapped = Array.isArray(data)
          ? (data as unknown[]).map((r: unknown) => {
            const o = r as Record<string, unknown>;
            const id = (o['id'] as number) ?? Number(String(o['id'] ?? 0));
            const name = (o['nombre'] as string) ?? (o['name'] as string) ?? String(id);
            const description = (o['descripcion'] as string) ?? (o['description'] as string) ?? '';
            const active = typeof o['active'] === 'boolean' ? (o['active'] as boolean) : ((o['active'] as boolean) ?? true);
            const user_count = (o['cantidad_usuarios'] as number) ?? (o['user_count'] as number) ?? 0;
            return {
              id,
              name,
              description,
              active,
              user_count,
            } as RolUserCount;
          })
          : [];
        setRolesUser(mapped); const map: Record<number, string> = {};
        mapped.forEach(r => { map[r.id] = r.name; }); setRoleNames(map);
      })
      .catch(() => setErrorRoles('Error al cargar roles'))
      .finally(() => setLoadingRoles(false));

    // Load forms to map form id -> form name
    getForms()
      .then((forms: FormType[]) => {
        const fmap: Record<number, string> = {};
        if (Array.isArray(forms)) {
          forms.forEach(f => { fmap[f.id] = f.name || f.title || f.label || String(f.id); });
        }
        setFormNames(fmap);
      })
      .catch(() => {
        // ignore form name mapping failures
      });
  }, []);

  // Loading and error states for permissions data
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    // Main container with spacing and animations
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Permissions table section */}
      <div className="bg-white p-8 rounded-lg shadow overflow-x-auto transform transition-all duration-500 hover:shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Resumen del modelo de seguridad</h2>
        {/* Permissions matrix table with role-form-permission relationships */}
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border">Rol</th>
              <th className="px-3 py-2 border">Formulario</th>
              <th className="px-3 py-2 border">Visualizar</th>
              <th className="px-3 py-2 border">Editar</th>
              <th className="px-3 py-2 border">Registrar</th>
              <th className="px-3 py-2 border">Eliminar</th>
              <th className="px-3 py-2 border">Inhabilitar / Habilitar</th>
            </tr>
          </thead>
          <tbody>
            {/* Render paginated permissions with check/cross icons */}
            {paginatedPerms.map((perm, i) => {
              // Backend may return either { role: 'Name', form: 'Name', ... }
              // or the numeric id shape { rol: 1, form: 2, ... } depending on endpoint.
              // Resolve role label robustly:
              // Use a safe, minimal cast to inspect possible backend keys without `any`.
              const p = perm as unknown as Record<string, unknown>;
              const rawRole = (p['role'] ?? p['rol']) as string | number | undefined; const roleLabel = typeof rawRole === 'string'
                ? rawRole
                : roleNames[String(rawRole ?? '')] || String(rawRole ?? '');
              // Resolve form label robustly (string name or id)
              // Resolve form label (backend may return 'form', 'formulario' or ids)
              const rawForm = (p['form'] ?? p['formulario'] ?? p['formulario_id'] ?? p['form_id']) as string | number | undefined; const formLabel = typeof rawForm === 'string'
                ? rawForm
                : formNames[String(rawForm ?? '')] || String(rawForm ?? '');

              return (
                <tr key={i + (page - 1) * rowsPerPage} className="text-center">
                  <td className="px-3 py-2 border">
                    <span className="inline-block rounded-full px-2 py-1 text-xs font-semibold">
                      {roleLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 border">{formLabel}</td>
                  <td className="px-3 py-2 border">{perm.Ver ? iconCheck : iconCross}</td>
                  <td className="px-3 py-2 border">{perm.Editar ? iconCheck : iconCross}</td>
                  <td className="px-3 py-2 border">{perm.Registrar ? iconCheck : iconCross}</td>
                  <td className="px-3 py-2 border">{perm.Eliminar ? iconCheck : iconCross}</td>
                  <td className="px-3 py-2 border">{perm.Activar ? iconCheck : iconCross}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Custom pagination controls */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className={`px-4 py-2 border rounded bg-white text-gray-700 flex items-center gap-1 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            &lt; Anterior
          </button>
          <button
            className={`px-4 py-2 border rounded bg-white text-gray-700 flex items-center gap-1 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Siguiente &gt;
          </button>
        </div>
      </div>

      {/* User distribution by roles section */}
      <div className="bg-white p-8 rounded-lg shadow transform transition-all duration-500 hover:shadow-lg delay-100">
        <h3 className="text-xl font-bold mb-1">Distribución por Roles</h3>
        <p className="mb-4 text-gray-700">Usuarios asignados por rol</p>
        {/* Loading state for roles data */}
        {loadingRoles ? (
          <div className="text-gray-500">Cargando...</div>
        ) : errorRoles ? (
          <div className="text-red-500">{errorRoles}</div>
        ) : (
          /* Role distribution cards with custom colors and animations */
          <div className="flex flex-col gap-3">
            {rolesUser.map((rol, index) => {
              // Choose color based on role name, default is green
              const color = roleColors[rol.name] || 'bg-green-50 border-green-400 text-green-700';
              // Map role names to plural labels for display
              const label =
                rol.name === 'Administrador' ? 'Administradores' :
                  rol.name === 'Usuarios' ? 'usuarios' :
                    rol.name === 'Aprendices' ? 'Aprendices' :
                      rol.name === 'Instructores' ? 'instructores' :
                        rol.name === 'Coordinadores' ? 'Coordinadores' : rol.name;
              return (
                // Role card with hover animations and staggered entrance
                <div
                  key={rol.id}
                  className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 ${color} transform transition-all duration-300 hover:scale-105 animate-in slide-in-from-left`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="font-semibold text-lg">{rol.name}</div>
                    <div className="text-gray-500 text-sm">{rol.description}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold">{rol.user_count}</span>
                    <span className="text-xs font-semibold mt-1">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarySecurity;
