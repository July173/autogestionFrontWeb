export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  read?: boolean;
  active?: boolean;
  created_at?: string;
  link?: string;
}

export default NotificationItem;
