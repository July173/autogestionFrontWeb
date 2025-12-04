import React from 'react';
import { FileEarmarkPdf, BoxArrowUp } from 'react-bootstrap-icons';

/**
 * Props interface for the PdfUploadSection component.
 * Defines the properties needed to handle PDF file upload functionality.
 */
interface PdfUploadSectionProps {
  /** Currently selected PDF file or null if no file is selected */
  selectedFile: File | null;
  /** Handler for file input change events */
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Function to trigger the hidden file input click */
  triggerFileInput: () => void;
  /** Whether the selected modality is 'Contrato de Aprendizaje' */
  modalityIsContrato?: boolean;
}

/**
 * PdfUploadSection component provides a drag-and-drop PDF file upload interface.
 * 
 * This component renders a file upload section with the following features:
 * - Drag and drop area for PDF files
 * - Click to select file functionality
 * - File size display (converted to KB)
 * - Visual feedback for file selection state
 * - Validation messages and requirements
 * - Detailed instructions for different apprenticeship modalities
 * 
 * The component uses a green/red color scheme to indicate file selection status
 * and includes comprehensive instructions for users about required documentation
 * based on different apprenticeship contract types.
 * 
 * @param props - Component props as defined in PdfUploadSectionProps
 * @returns React component for PDF file upload section
 */
const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({ selectedFile, handleFileSelect, triggerFileInput, modalityIsContrato = false }) => (
  <div className="mb-6 bg-white rounded-lg shadow-md border-2" style={{ borderColor: '#7BCC7C' }}>
    {/* Header section with PDF icon and upload instructions */}
    <div className="flex items-center gap-3 px-6 py-4 rounded-t-lg border-b" style={{ backgroundColor: '#E7FFE8', borderBottomColor: '#7BCC7C' }}>
      <FileEarmarkPdf size={24} color="#0C672D" />
      <span className="font-semibold text-xl" style={{ color: '#0C672D' }}>
        Cargue aquí un solo archivo en PDF con el documento que soporte su solicitud (máximo 1MB)
        <span style={{ color: '#DC395F' }}>*</span>
      </span>
    </div>
    <div className="p-6 bg-white rounded-b-lg">
        {/* Instructions paragraph with detailed requirements for different modalities (dynamic) */}
        {modalityIsContrato ? (
          <div className="text-sm text-gray-600 mb-4 leading-relaxed">
            <p>
              Por favor tenga en cuenta que, para Contrato de Aprendizaje debe cargar la copia del contrato celebrado con la empresa. 1-2-2 Autorización Modalidad Etapa Práctica Aprendiz, diferente a Contrato de Aprendizaje.
            </p>
          </div>
        ) : (
          <div className="text-sm text-gray-600 mb-4 leading-relaxed">
            <p>
              Para las modalidades de Desempeño a través de vinculación laboral o contractual, Participación en un proyecto productivo, De apoyo a una unidad productiva familiar o Pasantías, debe cargar la evidencia mediante la cual el Coordinador Académico le Aprobó realizar su etapa práctica bajo algunas de estas modalidades. Si aún no cuenta con dicha autorización puede ingresar al siguiente enlace y solicitar la aprobación. <a href="#" className="text-green-700 underline hover:text-green-800">1-2-2 Autorización Modalidad Etapa Práctica Aprendiz, diferente a Contrato de Aprendizaje.</a>
            </p>
            <p className="mt-3">
              Tenga en cuenta que para demostrar la relación por Vínculo Laboral debe enviar Certificado laboral expedido por la empresa para la que trabaja, en la cual especifiquen las actividades y/o funciones que realiza y la certificación de afiliación ARL. Para el caso de Vínculo Formativo, debe remitir copia del contrato de Vínculo Formativo celebrado con la empresa en el cual se indiquen las actividades o constancia de la práctica que va a realizar con las labores y la certificación de afiliación ARL. Si su caso es el de Unidad Productiva Familiar, debe remitir el certificado de Cámara y Comercio, RUT y copia del documento del representante legal para definir el vínculo familiar de dicha unidad, documento en el cual indique las actividades afines a su programa de formación que va a realizar en dicha Unidad y la certificación de afiliación ARL. Si desea acogerse a la opción de participar en un proyecto productivo, debe anexar la propuesta del proyecto en el que se involucrará, el cual debe estar enmarcado en las competencias de su programa de formación. Si usted fue seleccionado(a) como Monitor fase productiva en su centro de formación debe presentar la copia de la Resolución expedida por el centro de formación en la que se encuentra incluido(a) como seleccionado(a) y el certificado de afiliación ARL. Cuando por el tiempo asignado en la monitoria (horas semanales y meses) y las horas totales que se realicen sean menores a las estipuladas para su etapa productiva, el aprendiz deberá completar las horas establecidas para la Etapa Productiva con otra alternativa, según la Resolución 2198 de 2019 y el diseño curricular.
            </p>
          </div>
        )}
      <div className={`w-full flex flex-col items-center border-2 border-dashed rounded-lg py-8 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${!selectedFile ? 'border-red-300 bg-red-50' : ''}`}
        style={{ borderColor: !selectedFile ? '#DC395F' : '#7BCC7C' }}
        onClick={triggerFileInput}
      >
        <BoxArrowUp size={40} color={!selectedFile ? '#DC395F' : '#0C672D'} className="mb-3" />
        <span className="font-medium text-lg mb-2" style={{ color: !selectedFile ? '#DC395F' : '#0C672D' }}>
          {selectedFile ? selectedFile.name : 'Seleccionar archivo PDF (Requerido)'}
        </span>
        <span className="text-sm text-gray-500 text-center max-w-md">
          {selectedFile 
            ? 'Haz clic para cambiar el archivo seleccionado'
            : 'Arrastra y suelta tu archivo aquí o haz clic para seleccionar'
          }
        </span>
        {/* Hidden file input for file selection */}
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      {/* File information display when file is selected */}
      {selectedFile && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border" style={{ borderColor: '#7BCC7C' }}>
          <p className="text-sm font-medium" style={{ color: '#0C672D' }}>
            Archivo seleccionado: {selectedFile.name}
          </p>
          <p className="text-xs text-gray-600">
            Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}
      {/* Warning message when no file is selected */}
      {!selectedFile && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">
            ⚠️ Debe seleccionar un archivo PDF para continuar
          </p>
        </div>
      )}
    </div>
  </div>
);

export default PdfUploadSection;
