import { ENDPOINTS } from '@/Api/config/ConfigApi';
import { NotificationApiItem, NotificationQueryParams } from '@/Api/types/entities/Notification.types';

async function buildUrlWithParams(base: string, params?: Record<string, any>) {
  if (!params) return base;
  const esc = encodeURIComponent;
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && String(v) !== '')
    .map(([k, v]) => `${esc(k)}=${esc(String(v))}`)
    .join('&');
  return query ? `${base}?${query}` : base;
}

export async function getNotifications(params?: NotificationQueryParams): Promise<NotificationApiItem[] | null> {
  const url = await buildUrlWithParams(ENDPOINTS.Notification.getNotifications, params as Record<string, any>);
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data as NotificationApiItem[] : (data.data ?? null);
}

// Retrieve by id (the backend marks it as read when retrieving)
export async function getNotificationById(id: number | string): Promise<NotificationApiItem | null> {
  const url = ENDPOINTS.Notification.markAsRead.replace('{id}', String(id));
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return data as NotificationApiItem;
}

// Delete a single notification by id (DELETE query param id)
export async function deleteNotificationById(id: number | string): Promise<boolean> {
  const url = `${ENDPOINTS.Notification.deleteNotification}?id=${encodeURIComponent(String(id))}`;
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  return res.ok;
}

// Delete notifications by user/role (returns number deleted or true/false)
export async function deleteNotificationsByUser(params?: NotificationQueryParams): Promise<number | boolean | null> {
  const url = await buildUrlWithParams(ENDPOINTS.Notification.DeleteAll, params as Record<string, any>);
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) {
    return null;
  }
  try {
    const data = await res.json();
    // backend may return { detail: '...' } or a number or a list
    if (typeof data === 'number') return data;
    if (data && typeof data === 'object' && 'detail' in data) return data.detail as any;
    return true;
  } catch (e) {
    return true;
  }
}

export default {
  getNotifications,
  getNotificationById,
  deleteNotificationById,
  deleteNotificationsByUser,
};
