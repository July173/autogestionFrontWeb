import { useState, useCallback } from 'react';
import { getRequestMessages, patchMessageRequest } from '@/Api/Services/RequestAssignaton';

interface OperatorRegisterResult {
  success: boolean;
  message?: string;
  error?: string;
}

export default function useOperatorRegister() {
  const [loading, setLoading] = useState(false);

  /**
   * Verifica si una solicitud tiene registro del operador
   */
  const checkOperatorRegistration = useCallback(async (requestId: number): Promise<boolean> => {
    try {
      const response = await getRequestMessages(requestId);
      
      if (response.success && response.data) {
        // Buscar si hay algún mensaje del OPERADOR
        const hasOperatorMsg = response.data.some((msg: any) => {
          const whoseMsg = String(msg.whose_message || '').toUpperCase();
          return whoseMsg === 'OPERADOR';
        });
        return hasOperatorMsg;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar registro del operador:', error);
      return false;
    }
  }, []);

  /**
   * Registra un mensaje del operador
   */
  const registerOperatorMessage = useCallback(async (
    requestId: number,
    message: string
  ): Promise<OperatorRegisterResult> => {
    setLoading(true);
    try {
      const payload = {
        content: message,
        type_message: 'REGISTRADO',
        whose_message: 'OPERADOR',
        request_state: 'ASIGNADO', // Necesario para que el backend guarde el mensaje
      };

      const response = await patchMessageRequest(requestId, payload);

      return {
        success: true,
        message: 'Registro confirmado exitosamente',
      };
    } catch (error: any) {
      console.error('Error al registrar mensaje del operador:', error);
      return {
        success: false,
        error: error?.message || 'Error al registrar el mensaje',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    checkOperatorRegistration,
    registerOperatorMessage,
  };
}

