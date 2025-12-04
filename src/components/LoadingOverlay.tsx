import React from 'react';
import ReactDOM from 'react-dom';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  zIndex?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isOpen, message = 'Cargando...', zIndex = 50 }) => {
  if (!isOpen) return null;

  const overlay = (
    <div
      aria-live="polite"
      className="fixed inset-0 flex items-center justify-center"
      role="status"
      style={{ zIndex }}
    >
      <div className="absolute inset-0 bg-black opacity-40" />

      <div className="relative flex flex-col items-center gap-4 px-6 py-4 bg-white rounded-md shadow-lg" style={{ zIndex: zIndex + 1 }}>
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-[#2b9348] rounded-full animate-spin" />
        <div className="text-gray-700 font-medium">{message}</div>
      </div>
    </div>
  );

  // Render overlay at the end of body so it covers everything
  try {
    return ReactDOM.createPortal(overlay, document.body);
  } catch (e) {
    // Fallback for environments without DOM (tests)
    return overlay;
  }
};

export default LoadingOverlay;
