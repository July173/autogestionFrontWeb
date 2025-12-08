/**
 * Header component
 * ---------------
 * Displays the main header with breadcrumb navigation and notifications button.
 *
 * Props:
 * @param {string} [moduleName] - Name of the current module.
 * @param {string} [formName] - Name of the current form.
 *
 * @returns {JSX.Element} Main header with navigation and notifications.
 */
import React, { useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import useNotifications from '../../hook/use-notifications';
import NotificationModal from './NotificationModal';

interface HeaderProps {
  moduleName?: string;
  formName?: string;
  userId?: string | number;
  role?: 'apprentice' | 'instructor' | 'coordinator' | 'sofia_operator' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ moduleName, formName, userId: propUserId, role: propRole }) => {
  const [open, setOpen] = useState(false);

  // read user info from localStorage if not provided via props
  let resolvedUserId: string | number = 0;
  let resolvedRole: HeaderProps['role'] = 'apprentice';
  try {
    const raw = localStorage.getItem('user_dashboard');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        resolvedUserId = parsed.id ?? resolvedUserId;
        const numRole = parsed.role ?? undefined;
        // map numeric roles to hook role strings
        const roleMap: Record<number, HeaderProps['role']> = {
          1: 'admin',
          2: 'apprentice',
          3: 'instructor',
          4: 'coordinator',
          5: 'sofia_operator',
        };
        if (typeof numRole === 'number' && roleMap[numRole]) resolvedRole = roleMap[numRole];
      }
    }
  } catch (e) {
    console.warn('Unable to parse user_dashboard from localStorage', e);
  }

  // props override localStorage values when provided
  const finalUserId = propUserId ?? resolvedUserId ?? 0;
  const finalRole = propRole ?? resolvedRole ?? 'apprentice';

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteById, deleteByUser } = useNotifications(finalUserId, finalRole);

  return (
    <>
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl h-full px-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Breadcrumb navigation */}
            <nav className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              {moduleName && (
                <>
                  <span>{moduleName}</span>
                  {formName && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span>{formName}</span>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Notifications button */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir notificaciones"
              className="relative inline-flex items-center px-4 py-2 text-gray-600 hover:text-[#43A047] hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
            >
              <Bell className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Notificaciones</span>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}

              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#43A047] transition-colors duration-200 opacity-20"></div>
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteById={deleteById}
        deleteByUser={deleteByUser}
      />
    </>
  );
};

export default Header;