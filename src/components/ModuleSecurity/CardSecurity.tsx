/**
 * InfoCard component
 * ------------------
 * This component displays a reusable information card for security panels, user management, roles, etc.
 * Allows showing title, status, description, user count, and action buttons.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Main card title
 * @param {string} props.statusLabel - Status label (e.g., 'Active', 'Disabled', '2')
 * @param {'green'|'red'} props.statusColor - Status color (green or red)
 * @param {string} props.description - Brief card description
 * @param {number} props.count - Number of assigned users (optional)
 * @param {string} props.buttonText - Primary button text
 * @param {Function} props.onButtonClick - Primary button click handler
 * @param {string} props.actionLabel - Secondary button label (e.g., 'Enable', 'Disable')
 * @param {'enable'|'disable'} props.actionType - Secondary action type (defines color)
 * @param {Function} props.onActionClick - Secondary button click handler
 *
 * Usage:
 * <InfoCard
 *   title="Administrator"
 *   statusLabel="Active"
 *   statusColor="green"
 *   description="Full system access"
 *   count={2}
 *   buttonText="Adjust"
 *   onButtonClick={...}
 *   actionLabel="Disable"
 *   actionType="disable"
 *   onActionClick={...}
 * />
 *
 * If secondary action props are not provided, only the primary button is shown.
 */

import React, { useId } from 'react';
import { User } from 'lucide-react';
import type { InfoCardProps } from '../../Api/types/entities/misc.types';

// Background and border colors for status
const statusBg: Record<string, string> = {
  green: 'bg-green-100 text-green-900 ',
  red: 'bg-red-100 text-red-900 ',
};

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  statusLabel,
  statusColor,
  description,
  count,
  buttonText,
  onButtonClick,
  actionLabel,
  actionType,
  onActionClick,
}) => {
  const id = useId();
  // Determine if secondary action button should be shown
  const showAction = actionLabel && actionType && onActionClick;
  // Button color styles
  const buttonStyles = {
    edit: 'bg-gray-100 text-gray-900 border border-gray-400 hover:bg-gray-200 rounded-2xl',
    enable: 'bg-green-50 text-green-900 border border-green-700 hover:bg-green-200 rounded-2xl',
    disable: 'bg-red-50 text-red-900 border border-red-700 hover:bg-red-200 rounded-2xl',
  };
  return (
    <div
      className="bg-white p-4 rounded-lg shadow min-h-[180px] flex flex-col justify-between border-2 border-gray-300 w-full h-full min-w-0"
      role="article"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
    >
      <div>
        <div className="flex items-start justify-between mb-1 gap-3">
          <h3 id={`${id}-title`} className="text-lg font-semibold truncate mr-2 flex-1 min-w-0">{title}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${statusBg[statusColor]}`}>{statusColor === 'green' ? 'Activo' : 'Inhabilitado'}</span>
        </div>
        <p id={`${id}-desc`} className="text-gray-700 text-sm mb-2 line-clamp-3 break-words">{description}</p>
        <div className="flex flex-col sm:flex-row items-center mb-2 gap-3">
          {typeof count === 'number' && (
            <div className="text-sm text-gray-600 mt-2">{count} usuarios asignados</div>
          )}
          <div className="flex-1" />
          {showAction && (
            <button
              className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold border transition-all duration-300 w-full sm:w-auto ${buttonStyles.edit} whitespace-nowrap`}
              onClick={onButtonClick}
              type="button"
            >
              Editar
            </button>
          )}
        </div>
      </div>
      {/* Primary or secondary button based on props */}
      {showAction ? (
        <button
          className={`flex items-center justify-center gap-2 w-full py-2 font-bold mt-2 border transition-all duration-300 ${
            actionType === 'enable'
              ? buttonStyles.enable
              : buttonStyles.disable
          }`}
          onClick={onActionClick}
        >
          <User className="w-4 h-4" />
          {actionLabel}
        </button>
      ) : (
        <button
          className={`flex items-center justify-center gap-2 w-full sm:w-auto py-2 font-semibold border transition-all duration-300 mt-2 ${buttonStyles.edit}`}
          onClick={onButtonClick}
        >
          Editar
        </button>
      )}
    </div>
  );
};

export { InfoCard };
