import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { fetchActivePrivacyDocument, fetchSectionsByDocumentId } from '../../Api/Services/LegalDocument';
import type { LegalDocument, LegalSection } from '../../Api/types/entities/legalDocument.types';

/**
 * Props for PrivacyModal component.
 * @property {boolean} isOpen - Indicates if the modal is visible.
 * @property {() => void} onClose - Function to close the modal.
 */
interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * PrivacyModal component
 * ---------------------
 * Displays a modal with SENA's privacy policy.
 *
 * Features:
 * - Uses React Portal to render the modal outside the main tree.
 * - Allows closing the modal by clicking the background or the close button.
 * - Presents the privacy policy in clear, structured sections.
 *
 * @param {PrivacyModalProps} props - Modal properties.
 * @returns {JSX.Element | null} Rendered privacy policy modal.
 */

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    const [document, setDocument] = useState<LegalDocument | null>(null);
    const [sections, setSections] = useState<LegalSection[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        (async () => {
            const doc = await fetchActivePrivacyDocument();
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

    type SectionNodeProps = {
        section: LegalSection & { children?: LegalSection[] };
        level: number;
    };
    const SectionNode: React.FC<SectionNodeProps> = ({ section, level }) => (
        <div className={level === 1 ? "bg-white shadow rounded-lg p-6" : "bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4"}>
            <h3 className={level === 1 ? "text-xl font-bold mb-3" : "text-base font-semibold mb-2"}>
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

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white  w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl rounded-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-semibold text-gray-900 text-center">{document?.title || "Política de privacidad"}</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 text-center">
                            Cómo el SENA protege y utiliza su información personal
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 ml-4"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
export default PrivacyModal;