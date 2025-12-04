
import { ENDPOINTS } from '../config/ConfigApi';
import { MenuApiResponse, ProcessedMenuData, MenuItem } from '../types/entities/menu.types';

/**
 * Service for operations related to the user's dynamic menu.
 * Includes retrieval and processing of menu items.
 */
export const menu = {
  /**
   * Gets the menu items for a specific user and processes them.
   * @param userId - User ID
   * @param userName - User name (optional)
   * @returns Promise with the processed menu data
   */
  async getMenuItems(userId: string | number, userName?: string): Promise<ProcessedMenuData> {
    try {
      const url = ENDPOINTS.menu.getMenuItems.replace('{id}', userId.toString());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization token if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiData: MenuApiResponse[] = await response.json();
      
  // Process the API response to convert it to the format needed by the component
      return this.processApiResponse(apiData, userName);
    } catch (error) {
  console.error('Error al obtener elementos del menú:', error);
      throw error;
    }
  },

  /**
   * Processes the API response and converts it to the format needed for the component.
   * @param apiData - API response
   * @param userName - User name (optional)
   * @returns Processed data for menu and user
   */
  processApiResponse(apiData: MenuApiResponse[], userName?: string): ProcessedMenuData {
    if (!apiData || apiData.length === 0) {
      return {
        menuItems: [],
        userInfo: { name: userName || 'Usuario', role: 'Sin rol' }
      };
    }

    const userData = apiData[0]; // Asumiendo que siempre viene un elemento
    const menuItems: MenuItem[] = [];

  // Mapping of modules to icons
    const moduleIconMap: Record<string, string> = {
      'inicio': 'home',
      'seguridad': 'security', 
      'administración': 'user-check',
      'Asignar seguimientos': 'chart',
      'configuración': 'settings',
      // Add more mappings according to your modules
    };

  // Process each module and its forms
    userData.moduleForm.forEach((module) => {
      const moduleIcon = moduleIconMap[module.name.toLowerCase()] || 'home';
      
      module.form.forEach((formItem, index) => {
  // Generate a unique ID by combining module and form
        const id = `${module.name.toLowerCase().replace(/\s+/g, '-')}-${formItem.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        menuItems.push({
          id,
          name: formItem.name,
          title: formItem.name, // o el valor que corresponda
          path: formItem.path || `/${module.name.toLowerCase()}/${formItem.name.toLowerCase().replace(/\s+/g, '-')}`,
          icon: moduleIcon,
          moduleName: module.name,
          module: module.name,
          isActive: false,
          children: [] // If it has no children, use an empty array
        });
      });
    });

    return {
      menuItems,
      userInfo: {
        name: userName || 'Usuario',
        role: userData.rol
      }
    };
  }
};