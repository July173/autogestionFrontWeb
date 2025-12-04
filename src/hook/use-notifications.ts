import { useEffect, useRef, useState } from "react";
import {
  getNotifications as apiGetNotifications,
  getNotificationById as apiGetNotificationById,
  deleteNotificationById as apiDeleteNotificationById,
  deleteNotificationsByUser as apiDeleteNotificationsByUser,
} from '@/Api/Services/Notification';
import { NotificationApiItem } from '@/Api/types/entities/Notification.types';

import type { NotificationItem } from '@/Api/types/entities/Notification.shared';
// NotificationItem is imported from shared types

export default function useNotifications(userId: string | number | undefined, role: 'apprentice' | 'instructor' | 'coordinator' | 'sofia_operator' | 'admin' = 'apprentice') {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // helper: map API item -> local shape
  const mapItem = (it: NotificationApiItem): NotificationItem => ({
    id: it.id,
    title: it.title,
    message: it.message,
    type: it.type === 'registro' ? 'info' : (it.type as any) ?? 'info',
    read: !!it.is_read,
    active: it.active !== undefined ? !!it.active : true,
    created_at: it.created_at,
    link: it.link,
  });

  useEffect(() => {
    // allow userId to be provided by param or read from localStorage.user_dashboard
    let effectiveUserId: string | number | undefined = userId as any;
    let effectiveRole = role;
    if (!effectiveUserId) {
      try {
        const raw = localStorage.getItem('user_dashboard');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            effectiveUserId = parsed.id ?? effectiveUserId;
            const numRole = parsed.role ?? undefined;
            const roleMap: Record<number, typeof role> = {
              1: 'admin',
              2: 'apprentice',
              3: 'instructor',
              4: 'coordinator',
              5: 'sofia_operator',
            };
            if (typeof numRole === 'number' && roleMap[numRole]) effectiveRole = roleMap[numRole];
          }
        }
      } catch (e) {
        console.debug('useNotifications: no local user_dashboard found or parse error', e);
      }
    }

    if (!effectiveUserId) {
      console.debug('useNotifications: no effective user id, skipping fetch');
      return;
    }

    // build params according to effectiveRole
    const params: Record<string, any> = {};
    if (effectiveRole === 'apprentice') params.apprentice_id = effectiveUserId;
    if (effectiveRole === 'instructor') params.instructor_id = effectiveUserId;
    if (effectiveRole === 'coordinator') params.coordinator_id = effectiveUserId;
    if (effectiveRole === 'sofia_operator') params.sofia_operator_id = effectiveUserId;
    if (effectiveRole === 'admin') params.admin_id = effectiveUserId;

    // fetch initial notifications from API
    (async () => {
      try {
        const list = await apiGetNotifications(params);
        console.debug('useNotifications: fetched notifications with params', params, 'result', list);
        if (Array.isArray(list)) {
          setNotifications(list.map(mapItem));
        }
      } catch (e) {
        console.error('Error fetching notifications:', e);
      }
    })();

    // then connect websocket for realtime
    // Note: backend routing uses '/ws/notifications/<user_id>/' (English), not 'notificaciones'
    // If an access token is available (SimpleJWT stored in localStorage), send it as query param `token`
    // Read token but ignore the literal strings 'undefined' or 'null' which
    // sometimes end up stored by mistake.
    let accessToken = localStorage.getItem('access_token');
    if (accessToken === 'undefined' || accessToken === 'null' || !accessToken) {
      accessToken = null;
    }

    // Build websocket URL based on current page protocol/host so it works
    // in different dev environments and uses wss when served over https.
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname || 'localhost';
    const port = window.location.port || '8000';
    const wsBase = `${proto}://${host}:${port}/ws/notifications/${effectiveUserId}/`;
    const wsUrl = accessToken ? `${wsBase}?token=${encodeURIComponent(accessToken)}` : wsBase;
    console.debug('useNotifications: opening websocket', wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.debug('WebSocket conectado:', wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const notif: NotificationItem = {
          id: data.id ?? Date.now(),
          title: data.title ?? data.titulo ?? 'Notificación',
          message: data.message ?? data.mensaje ?? '',
          type: (data.type ?? data.level) === 'registro' ? 'info' : (data.type ?? data.level) ?? 'info',
          read: data.is_read ?? false,
          active: data.active !== undefined ? !!data.active : true,
          created_at: data.created_at ?? new Date().toISOString(),
          link: data.link ?? null,
        };

        setNotifications((prev) => [notif, ...prev]);
      } catch (err) {
        console.error('Error parseando mensaje de notificación:', err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.debug('WebSocket cerrado', wsUrl);
    };

    socket.onerror = (e) => {
      console.error('WebSocket error', e);
    };

    return () => {
      try {
        socket.close();
      } catch (e) {
        /* ignore */
      }
    };
  }, [userId, role]);

  async function markAsRead(id: string | number) {
    try {
      const updated = await apiGetNotificationById(id);
      if (!updated) return false;
      setNotifications((prev) => prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true } : n)));
      return true;
    } catch (e) {
      console.error('Error marking notification as read', e);
      return false;
    }
  }

  async function markAllAsRead() {
    // mark all unread using API per-item (no bulk mark endpoint)
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => apiGetNotificationById(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function deleteById(id: string | number) {
    const ok = await apiDeleteNotificationById(id);
    if (ok) setNotifications((prev) => prev.filter((n) => String(n.id) !== String(id)));
    return ok;
  }

  async function deleteByUser() {
    // call delete endpoint for given role/userId
    try {
      // resolve effective id/role (use props or localStorage)
      let effectiveUserId: string | number | undefined = userId as any;
      let effectiveRole = role;
      if (!effectiveUserId) {
        try {
          const raw = localStorage.getItem('user_dashboard');
          if (raw) {
            const parsed = JSON.parse(raw);
            effectiveUserId = parsed.id ?? effectiveUserId;
            const numRole = parsed.role ?? undefined;
            const roleMap: Record<number, typeof role> = {
              1: 'admin',
              2: 'apprentice',
              3: 'instructor',
              4: 'coordinator',
              5: 'sofia_operator',
            };
            if (typeof numRole === 'number' && roleMap[numRole]) effectiveRole = roleMap[numRole];
          }
        } catch (e) {
          console.debug('deleteByUser: no local user_dashboard found or parse error', e);
        }
      }

      if (!effectiveUserId) {
        console.debug('deleteByUser: no effective user id, aborting');
        return null;
      }

      const params: any = {};
      if (effectiveRole === 'apprentice') params.apprentice_id = effectiveUserId;
      if (effectiveRole === 'instructor') params.instructor_id = effectiveUserId;
      if (effectiveRole === 'coordinator') params.coordinator_id = effectiveUserId;
      if (effectiveRole === 'sofia_operator') params.sofia_operator_id = effectiveUserId;
      if (effectiveRole === 'admin') params.admin_id = effectiveUserId;
      console.debug('deleteByUser: calling deleteNotificationsByUser with params', params);
      const res = await apiDeleteNotificationsByUser(params);
      // if deletion succeeded, clear local notifications
      setNotifications([]);
      return res;
    } catch (e) {
      console.error('Error deleting notifications by user', e);
      return null;
    }
  }

  function clearAll() {
    setNotifications([]);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteById,
    deleteByUser,
    socket: socketRef.current,
  } as const;
}
