import React, { useEffect, useState } from "react";
import DashboardCharts from "./DashboardCharts";
import { getApprentices } from "../../Api/Services/Apprentice";
import { getAllRequests, getRequestAsignationById } from "../../Api/Services/RequestAssignaton";
import { User } from "../../Api/types/entities/user.types";

interface RequestData {
  fecha_solicitud?: string;
  request_date?: string;
  date?: string;
  request_state: "ASIGNADO" | "SIN_ASIGNAR";
}

/**
 * Admin dashboard home view (extracted from Figma design).
 * Shows statistics and charts for apprentices and requests.
 */
const AdminDashboardView: React.FC = () => {
  const [aprendicesCount, setAprendicesCount] = useState<number | null>(null);
  const [solicitudesSinAsignar, setSolicitudesSinAsignar] = useState<number | null>(null);
  const [solicitudesAsignadas, setSolicitudesAsignadas] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestsData, setRequestsData] = useState<RequestData[]>([]);

  useEffect(() => {
    /**
     * Fetches dashboard data: apprentices, requests, and assignment states.
     * Handles errors and updates state for charts and statistics.
     */
    async function fetchData() {
      setLoading(true);
     
      try {
        // Apprentices
        const aprendices = await getApprentices();
       
        const activos = Array.isArray(aprendices) ? aprendices.filter(a => a.active).length : 0;
        setAprendicesCount(activos);

        // Requests
        const solicitudes = await getAllRequests();
      
        
        // Validate that requests is an array
        const solicitudesArray = Array.isArray(solicitudes) ? solicitudes : [];

        // Get request_asignation for each request in parallel
        const requestAsignationPromises = solicitudesArray.map(solicitud => 
          getRequestAsignationById(solicitud.id).catch(error => {
            console.error(`Error al obtener request_asignation para solicitud ${solicitud.id}:`, error);
            return null;
          })
        );

        const requestAsignations = await Promise.all(requestAsignationPromises);

        // Filter out nulls
        const validRequestAsignations = requestAsignations.filter(r => r !== null);
        
        // Save for charts
        setRequestsData(validRequestAsignations);

        // Count by state
        let sinAsignar = 0;
        let asignadas = 0;

        validRequestAsignations.forEach(requestAsignation => {
          if (requestAsignation.request_state === 'SIN_ASIGNAR') {
            sinAsignar++;
          } else if (requestAsignation.request_state === 'ASIGNADO') {
            asignadas++;
          }
        });

        setSolicitudesSinAsignar(sinAsignar);
        setSolicitudesAsignadas(asignadas);

      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    // Always fetch dashboard data on mount
    fetchData();
  }, []);

  // Render dashboard even if user data is not available

  return (
    <div className="bg-white rounded-lg p-2 sm:p-4 md:p-8 w-full min-h-[80vh] py-6 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center w-full">BIENVENIDO A AUTOGESTIÓN SENA</h1>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center mb-8 w-full">
        {/* Card 1: Aprendices */}
        <div className="w-full sm:w-64 border border-gray-200 rounded-xl bg-white p-4 shadow-sm h-48 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-white">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
                <path fillRule="evenodd" d="M8 7a3 3 0 100-6 3 3 0 000 6z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-gray-500 text-sm">Registro de</div>
              <div className="text-gray-800 text-lg font-semibold">Aprendices</div>
            </div>
          </div>
          <div>
            <div className="w-full h-[1px] bg-gray-200 mb-3" />
            <div>
              <div className="text-green-600 text-2xl font-bold">
                {loading ? '...' : (typeof aprendicesCount === 'number' && !isNaN(aprendicesCount) ? aprendicesCount.toLocaleString('es-CO') : '0')}
              </div>
              <div className="text-gray-500 text-sm mt-1">Aprendices Registrados</div>
            </div>
          </div>
        </div>

        {/* Card 2: Solicitudes sin asignar */}
        <div className="w-full sm:w-64 border border-gray-200 rounded-xl bg-white p-4 shadow-sm h-48 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-white">
                <path d="M8 0a2 2 0 00-2 2v12a2 2 0 104 0V2a2 2 0 00-2-2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-gray-500 text-sm">Registro de</div>
              <div className="text-gray-800 text-lg font-semibold">Solicitudes sin asignar</div>
            </div>
          </div>
          <div>
            <div className="w-full h-[1px] bg-gray-200 mb-3" />
            <div>
              <div className="text-green-600 text-2xl font-bold">{loading ? '...' : `${solicitudesSinAsignar ?? 0} Registros`}</div>
              <div className="text-gray-500 text-sm mt-1">Registros</div>
            </div>
          </div>
        </div>

        {/* Card 3: Solicitudes asignadas */}
        <div className="w-full sm:w-64 border border-gray-200 rounded-xl bg-white p-4 shadow-sm h-48 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-white">
                <path d="M0 0h4v16H0zM6 4h4v12H6zM12 8h4v8h-4z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-gray-500 text-sm">Registro de</div>
              <div className="text-gray-800 text-lg font-semibold">Solicitudes asignadas</div>
            </div>
          </div>
          <div>
            <div className="w-full h-[1px] bg-gray-200 mb-3" />
            <div>
              <div className="text-green-600 text-2xl font-bold">{loading ? '...' : `${solicitudesAsignadas ?? 0} Registros`}</div>
              <div className="text-gray-500 text-sm mt-1">Registros</div>
            </div>
          </div>
         </div>
       </div>
      <div className="w-full overflow-x-auto">
        <DashboardCharts requestsData={requestsData} />
      </div>
    </div>
  );
}

export default AdminDashboardView;
