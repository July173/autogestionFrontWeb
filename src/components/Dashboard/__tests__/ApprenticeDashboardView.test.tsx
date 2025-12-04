import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApprenticeDashboardView from '@/components/Dashboard/ApprenticeDashboardView';

// Mock the hook to return controlled data
jest.mock('@/hook/useApprenticeDashboard', () => jest.fn());
import useApprenticeDashboard from '@/hook/useApprenticeDashboard';

// Mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockNavigate,
}));

describe('ApprenticeDashboardView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows no-request view and navigates to request-registration', () => {
    (useApprenticeDashboard as jest.Mock).mockReturnValue({ dashboardData: null, loading: false, userData: null, showInstructor: false, reload: jest.fn() });

    render(<ApprenticeDashboardView />);

    expect(screen.getByText(/Sin solicitudes para tu etapa productiva/i)).toBeTruthy();

    fireEvent.click(screen.getByText('Hacer una solicitud'));
    expect(mockNavigate).toHaveBeenCalledWith('/request-registration');
  });

  it('shows assigned instructor block when showInstructor true', () => {
    const instructor = { id: 1, first_name: 'Pedro', first_last_name: 'Gomez', email: 'p@g.com', phone: '123', knowledge_area: 'AreaX' };
    const dashboardData = { has_request: true, request: { enterprise_name: 'E', location: 'L', request_date: '2025-11-01', modality: 'M' }, instructor, request_state: 'ASIGNADO' };

    (useApprenticeDashboard as jest.Mock).mockReturnValue({ dashboardData, loading: false, userData: { person: { first_name: 'Test' } }, showInstructor: true, reload: jest.fn() });

    render(<ApprenticeDashboardView />);

    // Instructor initials should appear
    expect(screen.getByText('PG')).toBeTruthy();
    // Full name
    expect(screen.getByText(/Pedro/)).toBeTruthy();
    // Email button exists
    expect(screen.getByText('Enviar Email')).toBeTruthy();
    // Request date formatted (compute same locale format to avoid hardcoded mismatch)
    const expected = new Date('2025-11-01').toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('renders rejected timeline when state is RECHAZADO', () => {
    const dashboardData = { has_request: true, request: { enterprise_name: 'E', request_date: '2025-11-01' }, instructor: null, request_state: 'RECHAZADO' };
    (useApprenticeDashboard as jest.Mock).mockReturnValue({ dashboardData, loading: false, userData: null, showInstructor: false, reload: jest.fn() });

    render(<ApprenticeDashboardView />);

    expect(screen.getByText(/Solicitud rechazada/i)).toBeTruthy();
  });
});
