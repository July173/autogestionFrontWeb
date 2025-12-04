import React, { useEffect, useState } from "react";
import { BsCalendar2Week, BsClockHistory, BsMortarboardFill, BsPersonCheck } from "react-icons/bs";
import { User } from "../../Api/types/entities/user.types";


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
 * Displays summary cards and scheduled visits.
 * Replace static data with real backend data as needed.
 */
export const InstructorDashboard: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_dashboard");
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error al parsear los datos del usuario desde el localStorage:", error);
      }
    }
  }, []);

  // Real backend data should be consumed here
  // Example static data:
  const cards = [
    {
      title: "Visitas programadas",
      value: 2,
      subtitle: "Para esta semana",
      icon: <BsCalendar2Week className="text-green-700" size={24} />,
      bgIcon: "bg-green-200",
    },
    {
      title: "Aprendices Asignados",
      value: 2,
      subtitle: "Aprendices tienes asignados para ser evaluados",
      icon: <BsMortarboardFill className="text-green-700" size={24} />,
      bgIcon: "bg-green-200",
    },
    {
      title: "Aprendices Evaluados",
      value: 2,
      subtitle: "Aprendices evaluados",
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
        {/* Statistics Cards (three) - centered */}
        <div className="w-full flex flex-wrap gap-5 justify-center items-center mb-6">
          {cards.map((card, idx) => (
            <div key={idx} className="w-56 flex justify-center">
              <InstructorDashboardCard {...card} />
            </div>
          ))}
        </div>

        {/* Section Header (no button) */}
        <div className="w-full flex justify-start items-center mb-6 px-2">
          <h2 className="text-black text-2xl font-semibold">Aprendices Asignados</h2>
        </div>

        {/* Scheduled Visits Cards - centered, stronger shadow */}
        <div className="w-full flex flex-wrap gap-6 justify-center items-start">
          {[1, 2].map((_, idx) => (
            <div key={idx} className="w-full sm:w-6/12 max-w-md p-5 bg-white rounded-lg flex flex-col gap-4 shadow-2xl border border-gray-100">
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
                <div className="text-gray-800 text-base">Carlos ruiz : 11292221893</div>
              </div>

              <div className="text-gray-700 text-base">
                <span className="font-medium">Programa de formación:</span>
                <div className="mt-1">desarrollo de videojuegos</div>
              </div>

              <div className="flex items-center gap-2 text-gray-800">
                <BsClockHistory className="text-green-700" size={18} />
                <div className="text-gray-800 text-base">Mañana</div>
              </div>

              {/* Button */}
              <button className="w-full h-12 rounded-lg border border-gray-200 hover:bg-green-50 flex justify-center items-center transition-colors">
                <span className="text-green-700 text-base font-medium">Ver detalles</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
