import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock ConfigApi to avoid `import.meta.env` usage in tests
jest.mock('../../../Api/config/ConfigApi', () => ({
  ENDPOINTS: {
    user: {
      validateLogin: 'http://test/api/security/users/validate-institutional-login/',
      requestPasswordReset: 'http://test/api/security/users/request-password-reset/',
      resetPassword: 'http://test/api/security/users/reset-password/',
    },
  },
}));

// Mock the user service used by the component to simulate an integration-like flow
jest.mock('../../../Api/Services/User', () => ({
  validateInstitutionalLogin: jest.fn(() =>
    Promise.resolve({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: { id: '1', email: 'user@soy.sena.edu.co', role: 1, person: '1' },
    })
  ),
}));

import LoginForm from '../LoginForm';

// Mock ConfigApi to avoid `import.meta.env` usage in tests
jest.mock('../../../Api/config/ConfigApi', () => ({
  ENDPOINTS: {
    user: {
      validateLogin: 'http://test/api/security/users/validate-institutional-login/',
      requestPasswordReset: 'http://test/api/security/users/request-password-reset/',
      resetPassword: 'http://test/api/security/users/reset-password/',
    },
  },
}));

beforeEach(() => {
  localStorage.clear();
});
test('integration: successful login stores tokens and opens second-factor flow', async () => {
  const onNavigate = jest.fn();
  render(<LoginForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

  const emailInput = screen.getByPlaceholderText(/ejemplo@soy.sena.edu.co/i);
  const passwordInput = screen.getByPlaceholderText(/\*\*\*\*\*\*\*\*\*\*\*/i);
  const submit = screen.getByRole('button', { name: /Iniciar Sesión/i });

  fireEvent.change(emailInput, { target: { value: 'user@soy.sena.edu.co' } });
  fireEvent.change(passwordInput, { target: { value: 'validpassword' } });

  fireEvent.click(submit);

  await waitFor(() => {
    expect(localStorage.getItem('access_token')).toBe('mock-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    expect(localStorage.getItem('user_email')).toBe('user@soy.sena.edu.co');
  });

    });
