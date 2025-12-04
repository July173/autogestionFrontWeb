import React from 'react';

/**
 * Props interface for the Paginator component.
 * Defines the properties needed to control pagination behavior.
 */
interface PaginatorProps {
  /** Current active page number (1-based indexing) */
  page: number;
  /** Total number of available pages */
  totalPages: number;
  /** Callback function called when user navigates to a different page */
  onPageChange: (newPage: number) => void;
  /** Optional additional CSS classes for styling customization */
  className?: string;
  /** Text label for the previous page button. Defaults to "< Anterior" */
  prevLabel?: string;
  /** Text label for the next page button. Defaults to "Siguiente >" */
  nextLabel?: string;
}

/**
 * Paginator component - Simple pagination controls with previous/next buttons.
 *
 * This component provides basic pagination functionality with previous and next buttons.
 * It's designed for scenarios where you need simple navigation between pages without
 * displaying page numbers. The component automatically disables buttons when reaching
 * the first or last page.
 *
 * Features:
 * - Previous/Next button navigation
 * - Automatic button disabling at boundaries
 * - Customizable button labels
 * - Hover effects and visual feedback
 * - Flexible styling with className prop
 *
 * @param props - The component props
 * @returns A pagination control component with previous/next buttons
 *
 * @example
 * ```tsx
 * <Paginator
 *   page={currentPage}
 *   totalPages={10}
 *   onPageChange={(newPage) => setCurrentPage(newPage)}
 *   className="my-custom-class"
 *   prevLabel="Previous"
 *   nextLabel="Next"
 * />
 * ```
 */
const Paginator: React.FC<PaginatorProps> = ({
  page,
  totalPages,
  onPageChange,
  className = '',
  prevLabel = '< Anterior',
  nextLabel = 'Siguiente >',
}) => {
  return (
    <div className={`flex justify-end gap-2 mt-4 ${className}`}>
      {/* Previous page button - disabled on first page */}
      <button
        className={`px-4 py-2 border rounded bg-white text-gray-700 flex items-center gap-1 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        {prevLabel}
      </button>

      {/* Next page button - disabled on last page */}
      <button
        className={`px-4 py-2 border rounded bg-white text-gray-700 flex items-center gap-1 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        {nextLabel}
      </button>
    </div>
  );
};

export default Paginator;
