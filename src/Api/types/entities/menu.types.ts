/**
 * Types and interfaces for the Menu and navigation entity.
 * Includes menu structure, user, and processed sidebar data.
 */
/**
 * Types and interfaces for the Menu and navigation entity.
 * Includes menu structure, user, and processed sidebar data.
 */
import { ReactNode } from 'react';

export interface MenuApiResponse {
  rol: string;
  moduleForm: import('./module.types').ModuleForm[];
}

export interface MenuItem {
  children: MenuItem[];
  title: ReactNode;
  moduleName: string;
  id: string;
  name: string;
  path: string;
  icon: string;
  module: string;
  isActive?: boolean;
}

export interface MenuUserInfo {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

export interface ProcessedMenuData {
  menuItems: MenuItem[];
  userInfo: MenuUserInfo;
}


export interface SidebarMenuProps {
  userId: string | number;
  userName?: string;
  userImage?: string;
  onMenuItemClick?: (item: MenuItem) => void;
  className?: string;
  onNavigate?: (view: string) => void;
}
