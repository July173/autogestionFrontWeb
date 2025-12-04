import React from 'react';
import { UploadResult } from '../../Api/Services/ExcelTemplate';

export interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: UploadResult | null;
  type: 'instructor' | 'aprendiz';
}

/**
 * Modal to display the results of mass upload.
 * Shows summary, successful records, and errors.
 */
export function ResultModal({ isOpen, onClose, results, type }: ResultModalProps) {
  if (!isOpen || !results) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Resultados de carga de {type === 'instructor' ? 'Instructores' : 'Aprendices'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{results.total_processed}</div>
              <div className="text-sm text-gray-600">Total procesados</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{results.successful_registrations}</div>
              <div className="text-sm text-gray-600">Exitosos</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{results.errors.length}</div>
              <div className="text-sm text-gray-600">Con errores</div>
            </div>
          </div>

          {/* Successful records */}
          {results.success.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                ✅ Registros exitosos ({results.success.length})
              </h3>
              <div className="max-h-40 overflow-y-auto bg-green-50 p-4 rounded-lg">
                {results.success.map((success, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <span className="font-medium">Fila {success.row}:</span> {success.message}
                    <div className="text-sm text-gray-600">Email: {success.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-red-600">
                  ❌ Errores encontrados ({results.errors.length})
                </h3>
                {results.error_report_url && (
                  <button
                    onClick={async () => {
                      try {
                        await import('../../Api/Services/ExcelTemplate').then(m => m.excelTemplateService.downloadErrorReport(results.error_report_url!));
                      } catch (error) {
                        console.error('Error descargando reporte:', error);
                        alert('Error al descargar el reporte de errores');
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    📥 Descargar Reporte
                  </button>
                )}
              </div>
              {results.error_report_message && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                  💡 {results.error_report_message}
                </div>
              )}
              <div className="max-h-40 overflow-y-auto bg-red-50 p-4 rounded-lg">
                {results.errors.map((error, index) => (
                  <div key={index} className="mb-3 last:mb-0 border-b border-red-200 last:border-b-0 pb-2 last:pb-0">
                    {error.row ? (
                      <div className="font-medium">Fila {error.row}:</div>
                    ) : (
                      <div className="font-medium">Error general:</div>
                    )}
                    <ul className="list-disc ml-4 text-sm">
                      {error.errors.map((err, errIndex) => (
                        <li key={errIndex}>{err}</li>
                      ))}
                    </ul>
                    {error.general && (
                      <div className="text-sm text-red-700 mt-1">{error.general}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
