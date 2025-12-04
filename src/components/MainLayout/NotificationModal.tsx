 import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import { X, Bell } from "lucide-react";
import type { NotificationItem } from '@/Api/types/entities/Notification.shared';
import ConfirmModal from '../ConfirmModal';
import LoadingOverlay from '../LoadingOverlay';

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  deleteById: (id: string | number) => Promise<boolean> | boolean;
  deleteByUser: () => Promise<number | boolean | null> | null;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

const NotificationModal: React.FC<Props> = ({ open, onClose, notifications, markAsRead, markAllAsRead, deleteById, deleteByUser }) => {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Handlers for delete confirmation / loading
  const handleConfirmDeleteAll = async () => {
    setConfirmAllOpen(false);
    setLoading(true);
    try {
      await deleteByUser();
    } catch (err) {
      console.error("Error deleting all notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => {
    // Only consider notifications that are active (treat undefined as active)
    const activeNotifications = notifications.filter((n) => n.active !== false);
    return tab === "all" ? activeNotifications : activeNotifications.filter((n) => !n.read);
  }, [tab, notifications]);

  // Always declare hooks in the same order regardless of `open`
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC and manage focus (effect runs only when 'open' changes to true)
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div ref={overlayRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-[99999]">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        aria-describedby="notification-desc"
        tabIndex={-1}
        className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 id="notification-title" className="text-lg font-semibold">Notificaciones</h3>
              <p id="notification-desc" className="text-sm text-gray-600">Tienes {notifications.filter((n) => n.active !== false && !n.read).length} notificaciones sin leer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={markAllAsRead} className="text-sm px-3 py-2 bg-gray-100 rounded-md">Marcar todas leídas</button>
            <button onClick={() => setConfirmAllOpen(true)} className="text-sm px-3 py-2 bg-red-100 text-red-700 rounded-md">Eliminar todas</button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-100">
          <div className="flex gap-3 items-center">
            <button className={`px-4 py-2 rounded-md ${tab === "all" ? "bg-white shadow" : "text-gray-600"}`} onClick={() => setTab("all")}>
              Todas ({notifications.filter((n) => n.active !== false).length})
            </button>
            <button className={`px-4 py-2 rounded-md ${tab === "unread" ? "bg-white shadow" : "text-gray-600"}`} onClick={() => setTab("unread")}>
              Sin leer ({notifications.filter((n) => n.active !== false && !n.read).length})
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
          {items.length === 0 && <p className="text-sm text-gray-500">No hay notificaciones</p>}

          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) markAsRead(n.id);
              }}
              role="button"
              tabIndex={0}
              className={`relative bg-white rounded-lg shadow-sm p-5 border-l-4 cursor-pointer focus:outline-none focus:ring ${n.read ? "border-gray-200" : n.type === "error" ? "border-red-500" : "border-green-500"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{n.title}</h4>
                  <p className="text-sm text-gray-700 mt-2">{n.message}</p>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {!n.read && (
                      <button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-100">Marcar leída</button>
                    )}
                    <button onClick={async (e) => { e.stopPropagation(); setDeletingId(n.id); setLoading(true); try { await deleteById(n.id); } catch (err) { console.error('Delete item error', err); } finally { setLoading(false); setDeletingId(null); } }} className="text-xs text-red-600 px-2 py-1 rounded hover:bg-red-50">Eliminar</button>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(n.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <LoadingOverlay isOpen={loading} message={deletingId ? 'Eliminando notificación...' : 'Eliminando notificaciones...'} zIndex={90} />
      )}

      <ConfirmModal
        isOpen={confirmAllOpen}
        title="Eliminar todas las notificaciones"
        message="¿Estás seguro? Esta acción eliminará todas las notificaciones para tu cuenta."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => setConfirmAllOpen(false)}
      />
    </div>
  );

  return createPortal(modal, document.body);
};

export default NotificationModal;
