import React, { useEffect, useState } from "react";
import { BsCalendar2Week, BsClockHistory, BsMortarboardFill, BsPersonCheck } from "react-icons/bs";
import { User } from "../../Api/types/entities/user.types";
import { getInstructorDashboard } from "@/Api/Services/Instructor";
import { getUserById } from "@/Api/Services/User";


/**
 * Props for InstructorDashboardCard component.
 * @typedef {Object} InstructorDashboardCardProps
 * @property {string} title - Card title
 * @property {number|string} value - Card value
 * @property {string} subtitle - Card subtitle
 * @property {React.ReactNode} icon - Card icon
 * @property {string} bgIcon - Icon background class
 */
interface InstructorDashboardCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bgIcon: string;
}

/**
 * Card component for instructor dashboard statistics.
 * @param {InstructorDashboardCardProps} props
 */
const InstructorDashboardCard: React.FC<InstructorDashboardCardProps> = ({ title, value, subtitle, icon, bgIcon }) => (
  <div className="bg-white rounded-[10px] outline outline-1 outline-neutral-400 p-5 w-52 flex flex-col gap-5">
    <div className="flex justify-between items-center">
      <div className="text-black text-sm font-normal font-roboto leading-none w-32">{title}</div>
      <div className={`w-10 h-10 ${bgIcon} rounded-full flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <div className="text-black text-2xl font-bold font-roboto leading-none">{value}</div>
    <div className="text-black text-sm font-normal font-roboto leading-none w-44">{subtitle}</div>
  </div>
);

/**
 * Instructor dashboard view.
 * Displays summary cards and scheduled visits from backend data.
 */
export const InstructorDashboard: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    visitas_programadas: 0,
    aprendices_asignados: 0,
    aprendices_evaluados: 0,
  });
  const [proximasVisitas, setProximasVisitas] = useState<any[]>([]);

  // Cargar el ID del instructor desde el usuario en localStorage
  useEffect(() => {
    const loadInstructorId = async () => {
      try {
        const storedUser = localStorage.getItem("user_dashboard");
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUserData(parsedUser);
          
          // Obtener el ID del instructor
          const userId = parsedUser?.id;
          if (userId) {
            const user = await getUserById(userId);
            const instructor = user?.instructor;
            if (instructor && instructor.id) {
              setInstructorId(Number(instructor.id));
            } else {
              setError('El usuario no tiene un instructor asociado');
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener instructor:", error);
        setError('Error al cargar datos del usuario');
      }
    };

    loadInstructorId();
  }, []);

  // Cargar datos del dashboard cuando tengamos el instructorId
  useEffect(() => {
    const loadDashboard = async () => {
      if (!instructorId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getInstructorDashboard(instructorId);
        if (response.success && response.data) {
          setStats(response.data.stats);
          setProximasVisitas(response.data.proximas_visitas || []);
        } else {
          setError('No se pudieron cargar los datos del dashboard');
        }
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [instructorId]);

  const cards = [
    {
      title: "Visitas programadas",
      value: stats.visitas_programadas,
      subtitle: "Para esta semana",
      icon: <BsCalendar2Week className="text-green-700" size={24} />,
      bgIcon: "bg-green-200",
    },
    {
      title: "Aprendices Asignados",
      value: stats.aprendices_asignados,
      subtitle: "Aprendices tienes asignados para ser evaluados",
      icon: <BsMortarboardFill className="text-green-700" size={24} />,
      bgIcon: "bg-green-200",
    },
    {
      title: "Aprendices en proceso de seguimiento",
      value: stats.aprendices_evaluados,
      subtitle: "Aprendices en proceso",
      icon: <BsPersonCheck className="text-green-700" size={24} />,
      bgIcon: "bg-green-200",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center px-4 py-6">
      {/* Title outside the white panel */}
      <div className="w-full max-w-6xl mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-green-700 text-3xl md:text-4xl font-bold text-center">BIENVENIDO A AUTOGESTIÓN SENA</h1>
      </div>

      {/* White panel that contains the rest */}
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando datos...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <>
            {/* Statistics Cards (three) - centered */}
            <div className="w-full flex flex-wrap gap-5 justify-center items-center mb-6">
              {cards.map((card, idx) => (
                <div key={idx} className="w-56 flex justify-center">
                  <InstructorDashboardCard {...card} />
                </div>
              ))}
            </div>

            {/* Section Header */}
            <div className="w-full flex justify-start items-center mb-6 px-2">
              <h2 className="text-black text-2xl font-semibold">Aprendices Asignados</h2>
            </div>

            {/* Scheduled Visits Cards - centered, stronger shadow */}
            {proximasVisitas.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No hay visitas programadas próximamente</div>
            ) : (
              <div className="w-full flex flex-wrap gap-6 justify-center items-start">
                {proximasVisitas.map((visita) => (
                  <div key={visita.id} className="w-full sm:w-6/12 max-w-md p-5 bg-white rounded-lg flex flex-col gap-4 shadow-2xl border border-gray-100">
                    {/* Card Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                        <BsCalendar2Week className="text-green-700" size={20} />
                      </div>
                      <div className="text-black text-lg md:text-xl font-semibold">Visita programada</div>
                    </div>

                    {/* Card Content */}
                    <div className="text-gray-700 text-base">Tienes una visita programada</div>
                    
                    <div className="flex items-center gap-2 text-gray-800">
                      <BsPersonCheck className="text-green-700" size={18} />
                      <div className="text-gray-800 text-base">
                        {visita.aprendiz_nombre} : {visita.aprendiz_identificacion}
                      </div>
                    </div>

                    <div className="text-gray-700 text-base">
                      <span className="font-medium">Programa de formación:</span>
                      <div className="mt-1">{visita.programa}</div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-800">
                      <BsClockHistory className="text-green-700" size={18} />
                      <div className="text-gray-800 text-base">{visita.fecha_texto}</div>
                    </div>

                    {/* Button: Redirigir a Seguimiento */}
                    <button
                      className="w-full h-12 rounded-lg border border-gray-200 hover:bg-green-50 flex justify-center items-center transition-colors"
                      type="button"
                      onClick={() => {
                        window.location.href = '/following';
                      }}
                    >
                      <span className="text-green-700 text-base font-medium">Ver detalles</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
