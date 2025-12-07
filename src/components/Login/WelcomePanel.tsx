
import React from 'react';

/**
 * WelcomePanel component
 * ---------------------
 * Displays a welcome panel with the platform title and description.
 *
 * Features:
 * - Shows the name 'AutoGestión CIES' and a brief description.
 * - Used on the main or home screen.
 *
 * @returns {JSX.Element} Rendered welcome panel.
 */
/**
 * WelcomePanel component.
 * Renders the welcome message and description for the platform.
 * @returns {JSX.Element}
 */
const WelcomePanel = () => {
  return (
    <div className="sena-welcome-panel">
      <div className="text-center z-10 relative">
        <h2 className="text-4xl font-bold mb-4">
          Bienvenido a AutoGestión SENA
        </h2>
        <p className="text-xl opacity-90">
          Tu plataforma de gestión educativa
        </p>
      </div>
    </div>
  );
};

export default WelcomePanel;
