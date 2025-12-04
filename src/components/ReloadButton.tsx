import React from 'react';

interface ReloadButtonProps {
  onClick?: () => void;
  title?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ReloadButton({ onClick, title = 'Recargar tabla', className = '', disabled = false, size = 'md' }: ReloadButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
      return;
    }
    // Fallback: dispatch a global event that pages/components can listen to
    try {
      window.dispatchEvent(new CustomEvent('global:reload-table', { detail: { source: 'ReloadButton', date: Date.now() } }));
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-sm' : size === 'lg' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50 ${sizeClasses} ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 12a9 9 0 1 0-3.16 6.12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3v6h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{title}</span>
    </button>
  );
}
