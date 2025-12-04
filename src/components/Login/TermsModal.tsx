  import React, { useEffect, useState } from "react";
  import ReactDOM from "react-dom";
  import { fetchActiveTermsDocument, fetchSectionsByDocumentId } from "../../Api/Services/LegalDocument";
  import type { LegalDocument, LegalSection } from "../../Api/types/entities/legalDocument.types";

  /**
   * TermsModal component
   * -------------------
   * Displays a modal with the terms and conditions for SENA services usage.
   *
   * Props:
   * @param {boolean} isOpen - Indicates if the modal is visible.
   * @param {() => void} onClose - Function to close the modal.
   *
   * Features:
   * - Uses React Portal to render the modal outside the main tree.
   * - Allows closing the modal by clicking the background or the close button.
   * - Presents terms and conditions in clear, structured sections.
   *
   * @returns {JSX.Element | null} Rendered terms and conditions modal.
   */

  /**
   * TermsModal component.
   * Handles loading and displaying terms and conditions document and sections.
   * @param {Object} props
   * @param {boolean} props.isOpen - Modal visibility state.
   * @param {() => void} props.onClose - Function to close the modal.
   * @returns {JSX.Element | null}
   */
  const TermsModal = ({ isOpen, onClose }) => {
  // Componente recursivo para renderizar cada sección y sus hijos
  type SectionNodeProps = {
    section: LegalSection & { children?: LegalSection[] };
    level: number;
  };
  const SectionNode: React.FC<SectionNodeProps> = ({ section, level }) => {
    return (
      <div className={level === 1 ? "bg-white shadow rounded-lg p-6" : "bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4"}>
        <h3 className={level === 1 ? "text-lg font-semibold mb-3" : "text-base font-semibold mb-2"}>
          {section.code ? `${section.code}. ` : ""}{section.title}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
        {section.children && section.children.length > 0 && (
          <div className="space-y-4">
            {section.children.map(child => (
              <SectionNode key={child.id} section={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };
    const [document, setDocument] = useState<LegalDocument | null>(null);
    const [sections, setSections] = useState<LegalSection[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
      if (!isOpen) return;
      setLoading(true);
      (async () => {
        const doc = await fetchActiveTermsDocument();
        setDocument(doc);
        if (doc) {
          const secs = await fetchSectionsByDocumentId(doc.id);
          setSections(secs);
        }
        setLoading(false);
      })();
    }, [isOpen]);

    // Construye árbol recursivo de secciones
    const buildSectionTree = (parentId: number | null): LegalSection[] => {
      return sections
        .filter(s => s.parent === parentId)
        .map(s => ({ ...s, children: buildSectionTree(s.id) }));
    };
    const sectionTree = buildSectionTree(null);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 fixed bg-white  max-w-3xl w-full ">
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3 mb-1 justify-center">
                <div className="w-10 h-10 bg-[#43A047] rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 text-center">
                  {document?.title || "Términos y condiciones"}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Condiciones de uso de los servicios del SENA - Servicio Nacional de Aprendizaje
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 ml-4"
            >
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l8 8M6 14L14 6"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 mt-28">
            {loading ? (
              <div className="text-center text-gray-500">Cargando...</div>
            ) : (
              sectionTree.length > 0 ? (
                sectionTree.map(section => (
                  <SectionNode key={section.id} section={section} level={1} />
                ))
              ) : (
                <div className="text-center text-gray-500">No hay información disponible.</div>
              )
            )}
            {/* Footer */}
            <div className="text-xs text-gray-500 text-center pt-6">
              <strong>Última actualización:</strong> {document?.effective_date ? new Date(document.effective_date).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "-"}
            </div>
          </div>
        </div>
      </div>,
      window.document.body
    );
  };

  export default TermsModal;
