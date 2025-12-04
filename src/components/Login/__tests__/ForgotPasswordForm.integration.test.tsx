import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock user service requestPasswordResetCode
jest.mock('@/Api/Services/User', () => ({
  requestPasswordResetCode: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock notification hook to observe showEmailSent
const mockShowEmailSent = jest.fn();
jest.mock('@/hook/useNotification', () => ({
  __esModule: true,
  default: () => ({
    notification: { isOpen: false, type: '', title: '', message: '' },
    hideNotification: jest.fn(),
    showEmailSent: mockShowEmailSent,
    showNotification: jest.fn(),
  }),
}));

import ForgotPasswordForm from '@/components/Login/ForgotPasswordForm';
import { requestPasswordResetCode } from '@/Api/Services/User';

// Mock ConfigApi to prevent import.meta usage in imported modules
jest.mock('@/Api/config/ConfigApi', () => ({
  ENDPOINTS: { user: { validateLogin: '', requestPasswordReset: '', resetPassword: '' } },
}));

test('integration: ForgotPasswordForm requests reset and triggers notification/navigation', async () => {
  const onNavigate = jest.fn();
  render(<ForgotPasswordForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

  const input = screen.getByPlaceholderText(/ejemplo@soy.sena.edu.co/i);
  const submit = screen.getByRole('button', { name: /Enviar Código/i });

  fireEvent.change(input, { target: { value: 'user@soy.sena.edu.co' } });
  fireEvent.click(submit);

  await waitFor(() => expect(requestPasswordResetCode).toHaveBeenCalledWith('user@soy.sena.edu.co'));
  expect(mockShowEmailSent).toHaveBeenCalled();
});
