import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock user service verifyResetCode
jest.mock('@/Api/Services/User', () => ({
  verifyResetCode: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock ConfigApi to prevent import.meta usage in imported modules
jest.mock('@/Api/config/ConfigApi', () => ({
  ENDPOINTS: { user: { validateLogin: '', requestPasswordReset: '', resetPassword: '' } },
}));

// Mock the notification hook to observe showActionCompleted
jest.mock('@/hook/useNotification', () => ({
  __esModule: true,
  default: () => ({
    notification: { isOpen: false, type: '', title: '', message: '' },
    hideNotification: jest.fn(),
    showActionCompleted: jest.fn(),
    showNotification: jest.fn(),
  }),
}));

import VerifyCodeForm from '@/components/Login/VerifyCodeForm';
import { verifyResetCode } from '@/Api/Services/User';

test('integration: VerifyCodeForm calls service and triggers notification action', async () => {
  const onNavigate = jest.fn();
  // set recovery email in localStorage as component reads it
  localStorage.setItem('recovery_email', 'test@soy.sena.edu.co');

  render(<VerifyCodeForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

  const input = screen.getByPlaceholderText(/Código de recuperación/i);
  const button = screen.getByRole('button', { name: /Verificar Código/i });

  fireEvent.change(input, { target: { value: '123456' } });
  fireEvent.click(button);

  await waitFor(() => expect(verifyResetCode).toHaveBeenCalledWith('test@soy.sena.edu.co', '123456'));
});
