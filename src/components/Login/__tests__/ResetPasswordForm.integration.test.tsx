import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock resetPassword service
jest.mock('@/Api/Services/User', () => ({
  resetPassword: jest.fn(() => Promise.resolve({ success: true })),
}));

const mockShowPasswordChanged = jest.fn();
jest.mock('@/hook/useNotification', () => ({
  __esModule: true,
  default: () => ({
    notification: { isOpen: false, type: '', title: '', message: '' },
    hideNotification: jest.fn(),
    showPasswordChanged: mockShowPasswordChanged,
    showNotification: jest.fn(),
  }),
}));

import ResetPasswordForm from '@/components/Login/ResetPasswordForm';
import { resetPassword } from '@/Api/Services/User';

// Mock ConfigApi to prevent import.meta usage in imported modules
jest.mock('@/Api/config/ConfigApi', () => ({
  ENDPOINTS: { user: { validateLogin: '', requestPasswordReset: '', resetPassword: '' } },
}));

test('integration: ResetPasswordForm calls resetPassword and clears localStorage on success', async () => {
  const onNavigate = jest.fn();
  // prepare localStorage values as component expects
  localStorage.setItem('recovery_email', 'user@soy.sena.edu.co');
  localStorage.setItem('reset_code', '123456');
  localStorage.setItem('access_token', 't');
  localStorage.setItem('refresh_token', 'r');

  render(<ResetPasswordForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

  const inputs = screen.getAllByPlaceholderText(/nueva contraseña/i);
  const newInput = inputs[0];
  const confirmInput = inputs[1];
  const submit = screen.getByRole('button', { name: /Actualizar contraseña/i });

  fireEvent.change(newInput, { target: { value: 'ValidPass123!' } });
  fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
  fireEvent.click(submit);

  await waitFor(() => expect(resetPassword).toHaveBeenCalledWith('user@soy.sena.edu.co', '123456', 'ValidPass123!'));
  // showPasswordChanged should be called
  expect(mockShowPasswordChanged).toHaveBeenCalled();
  // localStorage keys removed
  expect(localStorage.getItem('access_token')).toBeNull();
  expect(localStorage.getItem('refresh_token')).toBeNull();
  expect(localStorage.getItem('recovery_email')).toBeNull();
  expect(localStorage.getItem('reset_code')).toBeNull();
});
