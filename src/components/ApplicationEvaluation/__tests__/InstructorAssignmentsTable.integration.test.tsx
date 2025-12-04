import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the hook to return controlled data
jest.mock('@/hook/useInstructorAssignments', () => jest.fn());
import useInstructorAssignments from '@/hook/useInstructorAssignments';

// Mock the API call used by fetchDetail
jest.mock('@/Api/Services/RequestAssignaton', () => ({
  getFormRequestById: jest.fn(() => Promise.resolve({ data: { name_apprentice: 'Juan', email_apprentice: 'j@e.com' } })),
}));
import { getFormRequestById } from '@/Api/Services/RequestAssignaton';

import InstructorAssignmentsTable from '@/components/ApplicationEvaluation/InstructorAssignmentsTable';

// Mock ConfigApi to avoid import.meta issues from imported modules (PdfView etc.)
jest.mock('@/Api/config/ConfigApi', () => ({
  ENDPOINTS: { user: { validateLogin: '', requestPasswordReset: '', resetPassword: '' } },
}));

// Mock PdfView used by component to avoid import.meta in pdfjs
jest.mock('@/components/assing/PdfView', () => ({ __esModule: true, default: (p: any) => <div>PDF</div> }));

test('integration: InstructorAssignmentsTable expands row and fetches detail', async () => {
  // Provide one row via the hook
  (useInstructorAssignments as jest.Mock).mockReturnValue({ data: [
    { id: 10, name: 'Alumno Uno', tipo_identificacion: 'CC', numero_identificacion: '123', fecha_solicitud: '2025-11-01', estado_solicitud: 'VERIFICANDO', messages: [] }
  ], loading: false, error: null, refresh: jest.fn() });

  render(<InstructorAssignmentsTable instructorId={1} />);

  // Click the first row to expand
  const row = screen.getByText('Alumno Uno');
  fireEvent.click(row);

  await waitFor(() => expect(getFormRequestById).toHaveBeenCalled());
  expect(screen.getByText(/Juan/)).toBeTruthy();
});
