

import React from 'react';
import LogoSena from '/public/logoSenaVerde.png';

/**
 * SenaLogo component
 * Shows the institutional SENA logo along with the platform title.
 *
 * Features:
 * - Presents the SENA logo and 'AutoGestión CIES' name.
 * - Used in forms and main panels.
 *
 * @returns {JSX.Element} Visual element of logo and title.
 */
const SenaLogo = () => {
  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Logo SENA */}
      <div >
         <img src={LogoSena} alt="Carta" className="w-20 h-auto -ml-4" />

      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#01AF01]">AutoGestión SENA</h1>
      </div>
    </div>
  );
};

export default SenaLogo;
