import React, { useRef } from 'react';

export interface TarjetaExcelProps {
  variant: 'Variant3' | 'Variant4' | 'aprendices' | 'instructores';
  isUploading: boolean;
  onDownload?: () => void;
  onFileSelect?: (file: File) => void;
  img?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
}

/**
 * Component to display Excel file upload and download cards.
 * Allows selecting and uploading files, and downloading templates.
 */
export function TarjetaExcel({ variant, onDownload, onFileSelect, isUploading = false, img, img1, img2, img3, img4, img5 }: TarjetaExcelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (variant === "Variant3") {
    return (
      <div className="relative rounded-[10px] w-full h-auto min-h-[252px] bg-[#c0fbcd]">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="flex flex-col gap-4 px-[15px] py-[9px] h-full">
            <div className="h-auto min-h-[185px] relative rounded-[10px] w-full">
            <div className="flex flex-col gap-5 h-auto min-h-[185px] items-center justify-center w-full">
              <div className="relative w-12 h-12 sm:w-[50px] sm:h-[50px]">
                <img alt="excel" className="absolute inset-0 w-full h-full object-contain" src={img} />
              </div>
              <div className="flex flex-col font-semibold text-[#055e09] text-[16px] text-center">
                <p className="mb-0">
                  {isUploading ? 'Procesando archivo...' : 'Seleccionar archivo Excel'}
                </p>
                <p className="text-[#7bcc7f]">Formatos soportados: .xlsx, .xls</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-dashed border-green-600 inset-0 pointer-events-none rounded-[10.5px]" />
          </div>
          <div
            className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'} flex gap-3 items-center justify-center py-2 rounded-[10px] w-full transition-colors duration-200`}
            onClick={!isUploading ? handleUploadClick : undefined}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <img alt="upload" className="w-4 h-4" src={img1} />
            )}
            <span className="font-semibold text-[14px] text-white">
              {isUploading ? 'Subiendo...' : 'Subir instructores'}
            </span>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#7bcc7f] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
    );
  }
  if (variant === "Variant4") {
    return (
      <div className="relative rounded-[10px] w-full h-auto min-h-[252px] bg-[#eaf5ff]">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="flex flex-col gap-4 px-[15px] py-[9px] h-full">
            <div className="h-auto min-h-[185px] relative rounded-[10px] w-full">
            <div className="flex flex-col gap-5 h-auto min-h-[185px] items-center justify-center w-full">
              <div className="relative w-12 h-12 sm:w-[50px] sm:h-[50px]">
                <img alt="excel" className="absolute inset-0 w-full h-full object-contain" src={img2} />
              </div>
              <div className="flex flex-col font-semibold text-[#055e09] text-[16px] text-center">
                <p className="mb-0 text-[#154fef]">
                  {isUploading ? 'Procesando archivo...' : 'Seleccionar archivo Excel'}
                </p>
                <p className="text-[rgba(37,99,235,0.7)]">Formatos soportados: .xlsx, .xls</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#154fef] border-dashed inset-0 pointer-events-none rounded-[10.5px]" />
          </div>
          <div
            className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#154fef] hover:bg-[#1145d4] cursor-pointer'} flex gap-3 items-center justify-center py-2 rounded-[10px] w-full transition-colors duration-200`}
            onClick={!isUploading ? handleUploadClick : undefined}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <img alt="upload" className="w-4 h-4" src={img1} />
            )}
            <span className="font-semibold text-[14px] text-white">
              {isUploading ? 'Subiendo...' : 'Subir Aprendices'}
            </span>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#154fef] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
    );
  }
  if (variant === "aprendices") {
    return (
      <div className="relative rounded-[10px] w-full h-auto min-h-[252px] bg-[#eaf5ff]">
        <div className="flex flex-col gap-4 px-[15px] py-[9px] h-full">
          <div className="flex gap-4 items-center">
            <img alt="person" className="w-12 h-12 sm:w-[50px] sm:h-[50px] object-contain" src={img3} />
            <div className="flex flex-col font-semibold text-[#154fef] text-[16px]">
              <p className="mb-0">Plantilla Aprendices</p>
              <p className="text-[12px] text-[rgba(21,79,239,0.7)]">Campos básicos para registro de aprendices</p>
            </div>
          </div>
          <div className="flex flex-col font-semibold text-[#154fef] text-[12px]">
            <p className="mb-0">Campos incluidos:</p>
            <ul className="list-disc ml-5">
              <li>Datos personales básicos</li>
              <li>Información de contacto</li>
              <li>Programa de formación</li>
              <li>Ficha y centro de formación</li>
              <li>Estado del aprendiz</li>
            </ul>
          </div>
          <div className="bg-[#154fef] hover:bg-[#1145d4] flex gap-3 items-center justify-center py-2 rounded-[10px] w-full cursor-pointer transition-colors duration-200" onClick={onDownload}>
            <img alt="download" className="w-4 h-4" src={img4} />
            <span className="font-semibold text-[14px] text-white">Descargar plantilla para aprendices</span>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-2 border-[#154fef] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
    );
  }
  // Default: instructores
  return (
    <div className="relative rounded-[10px] w-full h-auto min-h-[252px] bg-[#c0fbcd]">
      <div className="flex flex-col gap-4 px-[15px] py-[9px] h-full">
        <div className="flex gap-4 items-center">
          <img alt="people" className="w-12 h-12 sm:w-[50px] sm:h-[50px] object-contain" src={img5} />
          <div className="flex flex-col font-semibold text-[#055e09] text-[16px]">
            <p className="mb-0">Plantilla Instructores</p>
            <p className="text-[12px] text-[rgba(5,94,9,0.7)]">Campos para registro de instructores del SENA</p>
          </div>
        </div>
        <div className="flex flex-col font-semibold text-[#055e09] text-[12px]">
          <p className="mb-0">Campos incluidos:</p>
          <ul className="list-disc ml-5">
            <li>Datos personales básicos</li>
            <li>Información de contacto</li>
            <li>Tipo y fecha de contrato</li>
            <li>Área de conocimiento</li>
            <li>Credenciales de acceso</li>
          </ul>
        </div>
        <div className="bg-green-600 hover:bg-green-700 flex gap-3 items-center justify-center py-1.5 rounded-[10px] w-full cursor-pointer transition-colors duration-200" onClick={onDownload}>
          <img alt="download" className="w-4 h-4" src={img4} />
          <span className="font-semibold text-[14px] text-white">Descargar plantilla para instructores</span>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#7bcc7f] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

