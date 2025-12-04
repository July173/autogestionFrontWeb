import React from 'react';
import InstructorAssignmentsTable from '@/components/ApplicationEvaluation/InstructorAssignmentsTable';

export const Following = () => {
  // This page shows assignments with state ASIGNADO for current user-instructor
  const [instructorId, setInstructorId] = React.useState<number | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const raw = localStorage.getItem('user_dashboard');
        if (!raw) {
          setError('No hay información de usuario en localStorage (user_dashboard)');
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(raw);
        const userId = parsed?.id;
        if (!userId) {
          setError('ID de usuario no encontrado en localStorage');
          setLoading(false);
          return;
        }
        // lazy import to reuse service
        const { getUserById } = await import('@/Api/Services/User');
        const user = await getUserById(userId);
        const instructor = user?.instructor;
        if (instructor && instructor.id) setInstructorId(Number(instructor.id));
        else setError('El usuario no tiene un instructor asociado');
      } catch (e: any) {
        setError(e?.message || 'Error al obtener datos de usuario');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actionRenderer = (row: any) => (
    <div className="flex gap-2">
      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Ver</button>
      <button className="px-3 py-1 bg-yellow-400 text-black rounded text-sm">Reasignar</button>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seguimientos</h1>
      {loading ? (
        <div className="text-gray-600">Cargando datos del usuario...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : instructorId ? (
        <InstructorAssignmentsTable instructorId={instructorId} filterState={'ASIGNADO'} renderAction={actionRenderer} />
      ) : (
        <div className="text-gray-600">No se encontró instructor asociado al usuario.</div>
      )}
    </div>
  );
};

export default Following;

