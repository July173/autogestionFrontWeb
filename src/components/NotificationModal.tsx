import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Mail, AlertCircle, Lock, X } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Props for the NotificationModal component.
 * @property {boolean} isOpen - Indicates if the modal is visible.
 * @property {() => void} onClose - Function to close the modal.
 * @property {'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'} type - Notification type.
 * @property {string} title - Notification title.
 * @property {string} message - Message to show in the modal.
 */
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed';
  title: string;
  message: string;
}

/**
 * NotificationModal component
 * Shows a notification modal with icon, title and message according to notification type.
 *
 * Features:
 * - Dynamic icon and colors according to notification type.
 * - Button to close the modal and accept the notification.
 * - Centered modal with semi-transparent background.
 *
 * @param {NotificationModalProps} props - Modal properties.
 * @returns {JSX.Element | null} Rendered notification modal.
 */
const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message
}) => {
  // Always declare hooks in consistent order
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC and manage focus (effect is guarded by isOpen)
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const prevFocused = document.activeElement as HTMLElement | null;
    // focus the content when opened
    if (contentRef.current) contentRef.current.focus();
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      // restore focus
      if (prevFocused) prevFocused.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
      case 'completed':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case 'password-changed':
        return <Lock className="w-12 h-12 text-green-500" />;
      case 'email-sent':
      case 'info':
        return <Mail className="w-12 h-12 text-green-500" />;
      case 'pending':
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      default:
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
      case 'completed':
      case 'password-changed':
      case 'email-sent':
      case 'info':
        return 'border-green-400';
      case 'pending':
      case 'warning':
        return 'border-yellow-400';
      default:
        return 'border-green-400';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
      case 'completed':
      case 'password-changed':
      case 'email-sent':
      case 'info':
        return 'bg-green-50';
      case 'pending':
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-green-50';
    }
  };


  const modal = (
    <div ref={overlayRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        aria-describedby="notification-desc"
        tabIndex={-1}
        className={`relative max-w-md w-full mx-4 p-8 rounded-lg shadow-lg border-2 ${getBorderColor()} ${getBackgroundColor()}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {getIcon()}
          </div>

          {/* Title */}
          <h2 id="notification-title" className="text-xl font-semibold text-gray-800">
            {title}
          </h2>

          {/* Message */}
          <p id="notification-desc" className="text-gray-600 leading-relaxed">
            {message}
          </p>

          {/* Accept button */}
          <Button 
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md font-medium"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
export default NotificationModal;
