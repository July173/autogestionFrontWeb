import React from "react";

// SVG images extracted from Figma
const imgVector = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/mcp/get_code/assets/96c0d038-cfad-4fa3-ad2f-b4a3f2991695/figma%3Aasset/c72c0db5407eaab0a7a6dc8129be8dd054c22be3.svg";
const imgVector1 = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/mcp/get_code/assets/96c0d038-cfad-4fa3-ad2f-b4a3f2991695/figma%3Aasset/44b719f128960fe37f8d177d50bde309cb329cfb.svg";
const imgVector2 = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/mcp/get_code/assets/96c0d038-cfad-4fa3-ad2f-b4a3f2991695/figma%3Aasset/00072a6bd66c26bbf87c1adb4aaaec2062cb6f49.svg";


/**
 * Renders an SVG icon based on the variant.
 * @param {{variant: "1"|"3"|"4"|"5"}} props
 */
function IconCard({ variant }: { variant: "1" | "3" | "4" | "5" }) {
  if (variant === "1") {
    return <img src={imgVector1} alt="icon" className="w-6 h-6" />;
  }
  if (variant === "3") {
    return <img src={imgVector2} alt="icon" className="w-6 h-6" />;
  }
  return <img src={imgVector} alt="icon" className="w-6 h-6" />;
}


/**
 * Props for DashboardCards component.
 * @typedef {Object} DashboardCardsProps
 * @property {"admin"|"coordinator"|"instructor"|"aprendiz"} role - User role
 */
interface DashboardCardsProps {
  role: "admin" | "coordinator" | "instructor" | "aprendiz";
}

/**
 * Dashboard cards for different user roles.
 * Shows summary cards and charts for admin, coordinator, instructor, or apprentice.
 * @param {DashboardCardsProps} props
 */
const DashboardCards: React.FC<DashboardCardsProps> = ({ role }) => {
  // You can conditionally render the view based on the role
  if (role === "aprendiz") {
    return (
      <div className="w-full max-w-[1000px] mx-auto my-12 bg-white rounded-[10px] overflow-hidden shadow-lg p-8 text-center">
        <div className="text-green-700/80 text-4xl font-bold mb-8">Bienvenido Aprendiz</div>
        <div className="text-lg text-gray-700">Aquí verás tu progreso, asignaciones y notificaciones personalizadas.</div>
        {/* Puedes agregar aquí componentes específicos para el aprendiz */}
      </div>
    );
  }
  // View for admin, coordinator, and instructor
  return (
    <div className="w-full max-w-[1000px] mx-auto my-12 bg-white rounded-[10px] overflow-hidden shadow-lg p-8">
      <div className="text-green-700/80 text-4xl font-bold text-center mb-8">BIENVENIDO A AUTOGESTIÓN SENA</div>
      <div className="flex flex-wrap justify-center gap-6">
  {/* Apprentices card */}
        <div className="w-56 h-44 bg-white rounded-xl shadow outline outline-1 outline-color-azure-84 relative">
          <div className="absolute right-4 top-4 text-right text-color-azure-40 text-sm">Registro de</div>
          <div className="absolute right-4 top-10 text-right text-color-azure-18 text-2xl font-semibold">Aprendices</div>
          <div className="absolute left-1 top-28 w-56 h-16 px-4 py-4 border-t border-color-grey-94 flex flex-col justify-start items-start">
            <div className="w-48 text-green-500 text-2xl font-bold">125.000.000</div>
            <div className="text-color-azure-40 text-base">Aprendices Registrados</div>
          </div>
          <div className="absolute left-6 top-10 bg-gradient-to-l from-green-500 to-green-700 rounded-xl p-3">
            <IconCard variant="1" />
          </div>
        </div>
  {/* Unassigned requests card */}
        <div className="w-64 h-44 bg-white rounded-xl shadow outline outline-1 outline-color-azure-84 relative">
          <div className="absolute right-4 top-4 text-right text-color-azure-40 text-sm">Registro de</div>
          <div className="absolute right-4 top-10 text-right text-color-azure-18 text-2xl font-semibold">Solicitudes sin asignar</div>
          <div className="absolute left-1 top-32 w-60 px-4 py-4 border-t border-color-grey-94 flex flex-col justify-start items-start">
            <div className="text-green-500 text-2xl font-bold">20</div>
            <div className="text-color-azure-40 text-base">Registros</div>
          </div>
          <div className="absolute left-4 top-12 bg-gradient-to-l from-green-500 to-green-700 rounded-xl p-3">
            <IconCard variant="3" />
          </div>
        </div>
  {/* Assigned requests card */}
        <div className="w-56 h-44 bg-white rounded-xl shadow outline outline-1 outline-color-azure-84 relative">
          <div className="absolute right-4 top-4 text-right text-color-azure-40 text-sm">Registro de</div>
          <div className="absolute right-4 top-10 text-right text-color-azure-18 text-2xl font-semibold">Solicitudes asignadas</div>
          <div className="absolute left-1 top-32 w-56 px-4 py-4 border-t border-color-grey-94 flex flex-col justify-start items-start">
            <div className="text-green-500 text-2xl font-bold">30</div>
            <div className="text-color-azure-40 text-base">Registros</div>
          </div>
          <div className="absolute left-4 top-14 bg-gradient-to-l from-green-500 to-green-700 rounded-xl p-3">
            <IconCard variant="4" />
          </div>
        </div>
  {/* Apprentice assignments chart */}
        <div className="w-80 h-96 bg-white rounded-xl shadow outline outline-1 outline-color-azure-84 relative flex flex-col items-center">
          <div className="absolute left-6 top-[252px] text-color-azure-18 text-base font-semibold">Gráfica de asignaciones de aprendices</div>
          <div className="absolute left-1 top-[328px] w-80 px-6 py-5 border-t border-color-grey-94 flex items-center gap-1">
            <IconCard variant="5" />
            <span className="text-color-azure-40 text-sm">Recién actualizada</span>
          </div>
          <div className="absolute left-4 top-4 w-72 h-56 bg-white rounded-xl flex flex-col items-start overflow-hidden">
            {/* The real chart would go here, you can integrate a library like Chart.js if desired */}
            <div className="w-72 h-56 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Chart</div>
          </div>
        </div>
  {/* Approved assignments chart */}
        <div className="w-80 h-96 bg-white rounded-xl shadow outline outline-1 outline-color-azure-84 relative flex flex-col items-center">
          <div className="absolute left-6 top-[265px] text-color-azure-18 text-base font-semibold">Gráfica de asignaciones aprobadas</div>
          <div className="absolute left-1 top-[302px] w-80 px-6 py-5 border-t border-color-grey-94 flex items-center gap-1">
            <IconCard variant="5" />
            <span className="text-color-azure-40 text-sm">Recién actualizada</span>
          </div>
          <div className="absolute left-4 top-4 w-72 h-56 bg-white rounded-xl flex flex-col items-start overflow-hidden">
            {/* The real chart would go here, you can integrate a library like Chart.js if desired */}
            <div className="w-72 h-56 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Chart</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
