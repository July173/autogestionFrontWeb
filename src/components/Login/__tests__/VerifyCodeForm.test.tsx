import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock UI subcomponents that pull in assets or Api calls
jest.mock('../../SenaLogo', () => ({ __esModule: true, default: () => null }));
jest.mock('../FooterLinks', () => ({ __esModule: true, default: () => null }));
// __tests__ folder is nested, NotificationModal lives in src/components
jest.mock('../../NotificationModal', () => ({ __esModule: true, default: (props: unknown) => null }));

// Mock the hook used by the component to control notifications
jest.mock('../../../hook/useNotification', () => ({
  __esModule: true,
  default: () => ({
    notification: { isOpen: false, type: '', title: '', message: '' },
    hideNotification: () => {},
    showNotification: () => {},
    showActionCompleted: () => {},
  }),
}));
// Mock user services used in verification flow
jest.mock('../../../Api/Services/User', () => ({
  verifyResetCode: jest.fn(() => Promise.resolve({ success: true })),
}));

import VerifyCodeForm from '../VerifyCodeForm';

describe('VerifyCodeForm', () => {
  beforeEach(() => localStorage.clear());

  test('displays recovery email from localStorage', () => {
    localStorage.setItem('recovery_email', 'test@soy.sena.edu.co');
  const onNavigate = jest.fn();
  render(<VerifyCodeForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

    expect(screen.getByText(/test@soy.sena.edu.co/)).toBeInTheDocument();
  });

  test('shows validation error for invalid code and disables submit', async () => {
  const onNavigate = jest.fn();
  render(<VerifyCodeForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

    const input = screen.getByPlaceholderText(/Código de recuperación/i);
    fireEvent.change(input, { target: { value: 'abc' } });

    await waitFor(() => {
      expect(screen.getByText(/El código debe ser de 6 dígitos numéricos/i)).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Verificar Código/i });
    expect(button).toBeDisabled();
  });

  test('back button navigates to forgot-password', () => {
  const onNavigate = jest.fn();
  render(<VerifyCodeForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

    const back = screen.getByText(/Volver/i);
    fireEvent.click(back);
    expect(onNavigate).toHaveBeenCalledWith('forgot-password');
  });
});
