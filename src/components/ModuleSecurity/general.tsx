
import React from "react";
import FichaSection from "./general/FichaSection";
import TypeDocumentSection from "./general/TypeDocumentSection";
import ColorsSection from "./general/ColorsSection";
import ContractTypeSection from "./general/ContractTypeSection";
import SedeSection from "./general/SedeSection";
import CenterSection from "./general/CenterSection";
import RegionalSection from "./general/RegionalSection";
import SupportScheduleSection from "./general/SupportScheduleSection";
import SupportContactSection from "./general/SupportContactSection";
import LegalDocumentSection from "./general/LegalDocumentSection";
import LegaSsectionSection from "./general/LegaSectionSection";
import ProgramSection from "./general/ProgramSection";
import KnowledgeAreaSection from "./general/KnowledgeAreaSection";
import TypeOfQuerySection from "./general/TypeOfQuerySection";

/**
 * General component - Main dashboard for SENA general management
 *
 * Central hub component that organizes and displays multiple management sections
 * for SENA (Servicio Nacional de Aprendizaje) administrative data. Each section
 * handles different aspects of the training system including:
 * - Training program sheets (fichas)
 * - Document types and legal documents
 * - Color configurations and contract types
 * - Regional centers, support contacts, and schedules
 * - Knowledge areas and query types
 *
 * Only one section can be expanded at a time to maintain clean UI organization.
 * Each section is a collapsible component with CRUD operations.
 */
const General = () => {
  // State to track which section is currently open (only one at a time)
  const [openSection, setOpenSection] = React.useState<string | null>(null);

  /**
   * Helper function to generate consistent props for all sections
   * @param key - Unique identifier for the section
   * @returns Object containing open state and toggle handler for the section
   */
  const sectionProps = (key: string) => ({
    open: openSection === key,
    onToggle: () => setOpenSection(openSection === key ? null : key)
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      {/* Main title for the general management dashboard */}
      <h2 className="text-2xl font-bold mb-6">Gestión General - Sena</h2>

      {/* Training program sheets management section */}
      <FichaSection {...sectionProps('ficha')} />

    {/* Document types management section */}
    <TypeDocumentSection {...sectionProps('document')} />

    {/* Color configurations management section */}
      <ColorsSection {...sectionProps('colors')} />

      {/* Contract types management section */}
      <ContractTypeSection {...sectionProps('contract')} />

      {/* Query types management section */}
      <TypeOfQuerySection {...sectionProps('query')} />

      {/* Legal documents management section */}
      <LegalDocumentSection {...sectionProps('legalDocument')} />

      {/* Legal sections management section */}
      <LegaSsectionSection {...sectionProps('legalSection')} />

      {/* Training programs management section */}
      <ProgramSection {...sectionProps('program')} />

      {/* Training centers management section */}
      <CenterSection {...sectionProps('center')} />

      {/* Regional management section */}
      <RegionalSection {...sectionProps('regional')} />

      {/* Support schedule management section */}
      <SupportScheduleSection {...sectionProps('supportSchedule')} />

      {/* Support contacts management section */}
      <SupportContactSection {...sectionProps('supportContact')} />

      {/* Knowledge areas management section */}
      <KnowledgeAreaSection {...sectionProps('knowledge')} />

      {/* Headquarters/Sede management section */}
      <SedeSection {...sectionProps('sede')} />
    </div>
  );
};

export default General;