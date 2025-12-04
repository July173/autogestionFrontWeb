import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import NotificationModal from '@/components/MainLayout/NotificationModal';

describe('NotificationModal', () => {
  type NotificationTestItem = {
    id: number;
    title: string;
    message: string;
    read: boolean;
    active: boolean;
    created_at: string;
  };

  const baseNotifications: NotificationTestItem[] = [
    { id: 1, title: 'Active One', message: 'msg1', read: false, active: true, created_at: new Date().toISOString() },
    { id: 2, title: 'Inactive', message: 'msg2', read: false, active: false, created_at: new Date().toISOString() },
    { id: 3, title: 'Active Read', message: 'msg3', read: true, active: true, created_at: new Date().toISOString() },
  ];

  it('does not render inactive notifications and counts reflect only active ones', () => {
    const markAsRead = jest.fn();
    const markAllAsRead = jest.fn();
    const deleteById = jest.fn().mockResolvedValue(true);
    const deleteByUser = jest.fn().mockResolvedValue(1);

    render(
      <NotificationModal
        open={true}
        onClose={() => {}}
        notifications={baseNotifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteById={deleteById}
        deleteByUser={deleteByUser}
      />
    );

    // Should show only titles for active notifications (id 1 and 3)
    expect(screen.queryByText('Active One')).toBeTruthy();
    expect(screen.queryByText('Active Read')).toBeTruthy();
    expect(screen.queryByText('Inactive')).toBeNull();

    // Counts: total active = 2, unread active = 1 (id 1)
    expect(screen.getByText(/Todas \(2\)/)).toBeTruthy();
    expect(screen.getByText(/Sin leer \(1\)/)).toBeTruthy();
  });

  it('calls handlers when actions pressed', async () => {
    const markAsRead = jest.fn();
    const markAllAsRead = jest.fn();
    const deleteById = jest.fn().mockResolvedValue(true);
    const deleteByUser = jest.fn().mockResolvedValue(1);

    render(
      <NotificationModal
        open={true}
        onClose={() => {}}
        notifications={baseNotifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteById={deleteById}
        deleteByUser={deleteByUser}
      />
    );

    // Click 'Marcar todas leídas'
    fireEvent.click(screen.getByText('Marcar todas leídas'));
    expect(markAllAsRead).toHaveBeenCalled();

    // Click 'Eliminar todas' opens confirm - we can't interact with ConfirmModal internals easily here,
    // but ensure deleteByUser mock exists (the handler is wired in component)
    fireEvent.click(screen.getByText('Eliminar todas'));

    // There should be exactly 1 'Marcar leída' button (only for the single active unread item)
    const markButtons = screen.queryAllByText('Marcar leída');
    expect(markButtons.length).toBe(1);
    fireEvent.click(markButtons[0]);
    expect(markAsRead).toHaveBeenCalledTimes(1);
  });

  it('confirms delete all and shows loading overlay during deletion', async () => {
    const markAsRead = jest.fn();
    const markAllAsRead = jest.fn();
    // deleteByUser resolves after a tick so we can assert loading shows
    let resolveDelete: ((value?: unknown) => void) | undefined;
    const deleteByUser = jest.fn().mockImplementation(() => new Promise((res) => { resolveDelete = res; }));
    const deleteById = jest.fn().mockResolvedValue(true);

    render(
      <NotificationModal
        open={true}
        onClose={() => {}}
        notifications={baseNotifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteById={deleteById}
        deleteByUser={deleteByUser}
      />
    );

    // Click 'Eliminar todas' to open confirm modal
    fireEvent.click(screen.getByText('Eliminar todas'));

    // Confirm modal should present confirm button
    const confirmButton = screen.getByText('Sí, eliminar') || screen.getByText('Confirmar');
    fireEvent.click(confirmButton);

    // After clicking confirm, deleteByUser should have been called
    expect(deleteByUser).toHaveBeenCalled();

    // Loading overlay should be visible while promise pending
    expect(screen.getByText(/Eliminando notificaciones/)).toBeTruthy();

    // Resolve the promise to finish deletion (wrap in act)
    await act(async () => {
      if (resolveDelete) resolveDelete();
    });

    // Wait for overlay to disappear
    await waitFor(() => expect(screen.queryByText(/Eliminando notificaciones/)).toBeNull());
  });
});

//npm test -- -t "NotificationModal" --runInBand      