import React from 'react';
/**
 * Footer component
 * ---------------
 * Simple and reusable footer for the application.
 * Displays the current year and institutional text.
 *
 * Usage:
 * <Footer />
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#D9D9D9] w-full h-16 flex items-center justify-center text-center border-t border-gray-400">
        <p className="text-sm text-gray-500 m-0">
        © {currentYear}. Desarrollado por Servicio Nacional de Aprendizaje
      </p>
    </footer>
  );
};

export default Footer;