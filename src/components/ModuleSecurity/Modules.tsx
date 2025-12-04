import React, { useState } from 'react';
import ModuleSection from './ModuleSection';
import FormsSection from './FormsSection';

const Modules = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sectionProps = (key: string) => ({
    open: openSection === key,
    onToggle: () => setOpenSection(openSection === key ? null : key),
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <h2 className="text-2xl font-bold mb-6">Gestión de Módulos y Formularios - Sena</h2>

      <ModuleSection {...sectionProps('modules')} />
      <FormsSection {...sectionProps('forms')} />
    </div>
  );
};

export default Modules;
