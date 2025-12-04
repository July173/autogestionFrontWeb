export interface NotificationApiItem {
  id: number | string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  is_read?: boolean;
  active?: boolean;
  created_at?: string;
  id_user?: number | string;
}

export type NotificationQueryParams = {
  apprentice_id?: number | string;
  instructor_id?: number | string;
  coordinator_id?: number | string;
  sofia_operator_id?: number | string;
  admin_id?: number | string;
};

export default NotificationApiItem;
