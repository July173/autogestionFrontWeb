import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configurar el worker de PDF.js desde node_modules (evita errores de CDN/CORS)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


/**
 * Props for PdfView component.
 * @typedef {Object} PdfViewProps
 * @property {string} uri - PDF file URI
 * @property {function} [onClose] - Function to close the viewer
 * @property {boolean} [initialFullscreen] - Whether to start in fullscreen mode
 */
type PdfViewProps = {
  uri: string;
  onClose?: () => void;
  initialFullscreen?: boolean;
};

/**
 * PDF viewer component with zoom, fullscreen, and download options.
 * Uses react-pdf for rendering and supports error handling in Spanish.
 * @param {PdfViewProps} props
 */
export default function PdfView({ uri, onClose, initialFullscreen = false }: PdfViewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [fullscreen, setFullscreen] = useState(initialFullscreen);

  const src = uri?.startsWith("/") ? `${window.location.protocol}//${window.location.host}${uri}` : uri;

  /**
   * Callback for successful PDF document load.
   * @param {{ numPages: number }} param0
   */
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  /**
   * Zooms in the PDF view.
   */
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  /**
   * Zooms out the PDF view.
   */
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  /**
   * Toolbar component for PDF controls (close, fullscreen, zoom, download).
   */
  const Toolbar = () => (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
      <div className="flex items-center gap-2">
        {onClose && (
          <button
            className="px-3 py-1 rounded-md bg-white border hover:bg-gray-100 text-sm"
            onClick={() => {
              onClose?.();
              if (fullscreen) setFullscreen(false);
            }}
          >
            Close
          </button>
        )}
        <button
          className="px-3 py-1 rounded-md bg-white border hover:bg-gray-100 text-sm"
          onClick={() => setFullscreen((s) => !s)}
        >
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={zoomOut}
          disabled={scale <= 0.5}
          className="px-2 py-1 rounded-md bg-white border hover:bg-gray-100 text-sm disabled:opacity-50"
          title="Zoom out"
        >
          −
        </button>
        <span className="text-sm text-gray-700 min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={zoomIn}
          disabled={scale >= 3.0}
          className="px-2 py-1 rounded-md bg-white border hover:bg-gray-100 text-sm disabled:opacity-50"
          title="Zoom in"
        >
          +
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <span className="text-sm text-gray-700">
          {numPages ? `${numPages} page${numPages > 1 ? 's' : ''}` : "Cargando..."}
        </span>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-md bg-white border hover:bg-gray-100 text-sm"
        >
          Download
        </a>
      </div>
    </div>
  );

  /**
   * PDF content renderer with loading and error states.
   */
  const PdfContent = () => (
    <div className="flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-4">
      <Document
        file={src}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="bg-white/90 p-4 rounded-md shadow">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 animate-spin text-green-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-gray-700">Cargando documento...</span>
            </div>
          </div>
        }
        error={
          <div className="bg-red-50 p-4 rounded-md shadow">
            <span className="text-red-700">Error al cargar el PDF. Verifica la URL o intenta descargar.</span>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="bg-white shadow-lg">
              <Page
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          ))}
        </div>
      </Document>
    </div>
  );

  return (
    <>
      {fullscreen ? (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
          <Toolbar />
          <PdfContent />
        </div>
      ) : (
        <div className="w-full h-[600px] flex flex-col border rounded-lg overflow-hidden shadow">
          <Toolbar />
          <PdfContent />
        </div>
      )}
    </>
  );
}