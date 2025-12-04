// Service to handle Excel templates for mass registration
import { ENDPOINTS } from '../config/ConfigApi';

export interface TemplateInfo {
  name: string;
  description: string;
  fields: string[];
  download_url: string;
  additional_sheets: string[];
}

export interface TemplatesInfo {
  instructor_template: TemplateInfo;
  apprentice_template: TemplateInfo;
}

export interface UploadResult {
  success: Array<{
    row: number;
    message: string;
    email: string;
  }>;
  errors: Array<{
    row?: number;
    errors: string[];
    data?: Record<string, unknown>;
    general?: string;
  }>;
  total_processed: number;
  successful_registrations: number;
  error_report_url?: string;
  error_report_message?: string;
}

class ExcelTemplateService {
  
  /**
   * Gets information about available templates
   */
  async getTemplateInfo(): Promise<TemplatesInfo> {
    try {
      const response = await fetch(ENDPOINTS.excelTemplates.templateInfo, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener información de plantillas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo información de plantillas:', error);
      throw error;
    }
  }

  /**
   * Downloads the Excel template for instructors
   */
  async downloadInstructorTemplate(): Promise<void> {
    try {
      const response = await fetch(ENDPOINTS.excelTemplates.instructorTemplate, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar plantilla de instructores: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_instructores.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando plantilla de instructores:', error);
      throw error;
    }
  }

  /**
   * Downloads the Excel template for apprentices
   */
  async downloadApprenticeTemplate(): Promise<void> {
    try {
      const response = await fetch(ENDPOINTS.excelTemplates.apprenticeTemplate, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar plantilla de aprendices: ${response.statusText}`);
      }

  // Create blob and download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_aprendices.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando plantilla de aprendices:', error);
      throw error;
    }
  }

  /**
   * Uploads and processes an instructor Excel file for mass registration
   */
  async uploadInstructorExcel(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(ENDPOINTS.excelTemplates.uploadInstructorExcel, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al procesar archivo: ${response.status}`);
      }

      const result: UploadResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error subiendo archivo de instructores:', error);
      throw error;
    }
  }

  /**
   * Uploads and processes an apprentice Excel file for mass registration
   */
  async uploadApprenticeExcel(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(ENDPOINTS.excelTemplates.uploadApprenticeExcel, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al procesar archivo: ${response.status}`);
      }

      const result: UploadResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error subiendo archivo de aprendices:', error);
      throw error;
    }
  }

  /**
   * Generic function to download any template
   */
  async downloadTemplate(type: 'instructor' | 'aprendiz'): Promise<void> {
    if (type === 'instructor') {
      return this.downloadInstructorTemplate();
    } else if (type === 'aprendiz') {
      return this.downloadApprenticeTemplate();
    } else {
      throw new Error('Tipo de plantilla no válido');
    }
  }

  /**
   * Generic function to upload any template
   */
  async uploadTemplate(type: 'instructor' | 'aprendiz', file: File): Promise<UploadResult> {
    if (type === 'instructor') {
      return this.uploadInstructorExcel(file);
    } else if (type === 'aprendiz') {
      return this.uploadApprenticeExcel(file);
    } else {
      throw new Error('Tipo de plantilla no válido');
    }
  }

  /**
   * Downloads error report from URL
   */
  async downloadErrorReport(errorReportUrl: string): Promise<void> {
    try {
  // Build full server URL
      const fullUrl = errorReportUrl.startsWith('http') 
        ? errorReportUrl 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${errorReportUrl}`;

  // Create temporary element for download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = errorReportUrl.split('/').pop() || 'error_report.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar reporte de errores:', error);
      throw new Error('Error al descargar el reporte de errores');
    }
  }
}

// Export an instance of the service
export const excelTemplateService = new ExcelTemplateService();
export default ExcelTemplateService;