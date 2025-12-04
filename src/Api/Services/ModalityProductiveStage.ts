import { ENDPOINTS } from '../config/ConfigApi';

export interface ModalityProductiveStage {
  id: number;
  name_modality: string; // Change from 'name' to 'name_modality'
  description?: string;
  active?: boolean;
}

/**
 * Gets all productive stage modalities
 */
export const getModalityProductiveStages = async (): Promise<ModalityProductiveStage[]> => {
  try {
    const response = await fetch(ENDPOINTS.modalityProductiveStage.getModalityProductiveStage, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las modalidades de etapa productiva');
    }

    return await response.json();
  } catch (error) {
  console.error('Error en getModalityProductiveStages:', error);
    throw error;
  }
};