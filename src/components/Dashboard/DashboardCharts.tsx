import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DashboardChartsProps {
  requestsData: any[];
}


/**
 * Processes request data for charts.
 * Groups by month and state for assigned and unassigned requests.
 * @param {any[]} requestsData
 * @returns {{dataAsignadas: any[], dataSinAsignar: any[]}}
 */
function getChartData(requestsData: any[]) {
  const arr = Array.isArray(requestsData) ? requestsData : [];
  // Group by month and state
  const asignadas: Record<string, number> = {};
  const sinAsignar: Record<string, number> = {};
  
  arr.forEach((req) => {
    // Use fecha_solicitud or request_date field
    const fechaStr = req.fecha_solicitud || req.request_date || req.date;
    const fecha = fechaStr ? new Date(fechaStr) : null;
    const mes = fecha ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}` : "Sin fecha";
    
    // Use request_state from backend
    if (req.request_state === "ASIGNADO") {
      asignadas[mes] = (asignadas[mes] || 0) + 1;
    } else if (req.request_state === "SIN_ASIGNAR") {
      sinAsignar[mes] = (sinAsignar[mes] || 0) + 1;
    }
  });
  
  // Convert to Recharts format
  const dataAsignadas = Object.entries(asignadas).map(([name, value]) => ({ name, value }));
  const dataSinAsignar = Object.entries(sinAsignar).map(([name, value]) => ({ name, value }));
  
  return { dataAsignadas, dataSinAsignar };
}


/**
 * Dashboard charts for assigned and unassigned requests per month.
 * Uses recharts for bar and line charts.
 * @param {DashboardChartsProps} props
 */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({ requestsData }) => {
  const { dataAsignadas, dataSinAsignar } = getChartData(requestsData);

  return (
    <div className="flex gap-8 w-full justify-center">
      {/* Unassigned requests chart */}
      <div className="bg-white rounded-xl shadow p-4 w-[350px] flex flex-col items-center">
        {dataSinAsignar.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[180px] w-full">
            <span className="text-gray-400">No hay datos para mostrar</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dataSinAsignar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="font-semibold mt-4">Solicitudes sin asignar por mes</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-sm text-gray-500">Recién actualizada</span>
        </div>
      </div>
      {/* Approved assignments chart */}
      <div className="bg-white rounded-xl shadow p-4 w-[350px] flex flex-col items-center">
        {dataAsignadas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[180px] w-full">
            <span className="text-gray-400">No hay datos para mostrar</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dataAsignadas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2196f3" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="font-semibold mt-4">Solicitudes asignadas por mes</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-sm text-gray-500">Recién actualizada</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
