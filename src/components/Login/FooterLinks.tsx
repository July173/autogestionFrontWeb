
/**
 * FooterLinks component
 * ---------------------
 * Renders footer links for Support, Terms and Conditions, and Privacy Policy.
 * Clicking each link opens the corresponding modal.
 *
 * Usage:
 * <FooterLinks />
 *
 * Modals are managed via local state and closed with their callbacks.
 */

import React, { useState } from 'react';
import SupportModal from './SupportModal';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal'; // Importa el nuevo modal

/**
 * FooterLinks component.
 * Renders footer links for Support, Terms and Conditions, and Privacy Policy modals.
 * Handles modal open/close logic for each link.
 * @returns {JSX.Element}
 */
const FooterLinks: React.FC = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false); // State for privacy modal

  /**
   * Opens the support modal.
   * @param {React.MouseEvent<HTMLAnchorElement>} e
   */
  const openSupportModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsSupportModalOpen(true);
  };

  /**
   * Closes the support modal.
   */
  const closeSupportModal = () => {
    setIsSupportModalOpen(false);
  };

  /**
   * Opens the terms and conditions modal.
   * @param {React.MouseEvent<HTMLAnchorElement>} e
   */
  const openTermsModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
  };

  /**
   * Closes the terms and conditions modal.
   */
  const closeTermsModal = () => {
    setIsTermsModalOpen(false);
  };

  /**
   * Opens the privacy policy modal.
   * @param {React.MouseEvent<HTMLAnchorElement>} e
   */
  const openPrivacyModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
  };

  /**
   * Closes the privacy policy modal.
   */
  const closePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
  };

  return (
    <>
      <div className="sena-footer-links">
        <a 
          href="#" 
          onClick={openSupportModal} 
          className="hover:text-gray-600 transition-colors"
        >
          Soporte
        </a>
        <a 
          href="#" 
          onClick={openTermsModal}
          className="hover:text-gray-600 transition-colors"
        >
          Términos y Condiciones
        </a>
        <a 
          href="#" 
          onClick={openPrivacyModal}
          className="hover:text-gray-600 transition-colors"
        >
          Política de Privacidad
        </a>
      </div>

  {/* Support modal */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={closeSupportModal} 
      />

  {/* Terms and Conditions modal */}
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={closeTermsModal} 
      />

  {/* Privacy Policy modal */}
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={closePrivacyModal} 
      />
    </>
  );
};

export default FooterLinks;