import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock UI subcomponents that pull in assets or Api calls to keep unit tests focused
jest.mock('../../SenaLogo', () => ({ __esModule: true, default: () => null }));
jest.mock('../FooterLinks', () => ({ __esModule: true, default: () => null }));
jest.mock('../SecondFactorModal', () => ({ __esModule: true, default: (props: unknown) => null }));

// Mock getDocumentTypesWithEmpty to avoid network calls
jest.mock('../../../Api/Services/TypeDocument', () => ({
  getDocumentTypesWithEmpty: () => Promise.resolve([]),
}));

// Mock user services to prevent import.meta usage from being evaluated
jest.mock('../../../Api/Services/User', () => ({
  validateInstitutionalLogin: jest.fn(() => Promise.resolve({ access: 't', refresh: 'r', user: { id: 1, email: 'a@soy.sena.edu.co', role: 'user' } })),
}));

// Mock useNotification hook used by child components (NotificationModal etc.)
// Path based on component import resolution: src/hook/useNotification
jest.mock('../../../hook/useNotification', () => ({
  __esModule: true,
  default: () => ({
    notification: { isOpen: false, type: '', title: '', message: '' },
    hideNotification: () => {},
    showNotification: () => {},
    showRegistrationSuccess: () => {},
    showRegistrationPending: () => {},
    showActionCompleted: () => {},
  }),
}));

import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  
  
  test('calls onNavigate when clicking forgot password or register', () => {
    const onNavigate = jest.fn();
  render(<LoginForm onNavigate={onNavigate} />, { wrapper: MemoryRouter });

    const forgot = screen.getByText(/¿Olvidaste tu contraseña\?/i);
    fireEvent.click(forgot);
    expect(onNavigate).toHaveBeenCalledWith('forgot-password');

    const register = screen.getByText(/Regístrate aquí/i);
    fireEvent.click(register);
    expect(onNavigate).toHaveBeenCalledWith('register');
  });
});
