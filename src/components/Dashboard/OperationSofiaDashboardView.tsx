import React, { useEffect, useState } from 'react';
import { getOperatorSofiaDashboard } from '@/Api/Services/RequestAssignaton';

/**
 * OperationSofiaDashboardView
 * - Layout: two stacked white panels
 *   1) Welcome box
 *   2) Chart card showing monthly evolution from backend data
 *
 * Exported: default OperationSofiaDashboardView and RoleGuardOperationSofia
 * RoleGuardOperationSofia reads `user_dashboard` or `user_data` from localStorage
 * and renders the dashboard only when role === 5.
 */

interface MonthData {
  month: string;
  month_number: number;
  registered: number;
  pending: number;
  total: number;
}

interface MonthBarsProps {
  data: MonthData[];
  loading?: boolean;
}

const MonthBars: React.FC<MonthBarsProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-56 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-56 flex items-center justify-center">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    );
  }

  // Calcular altura máxima para escalar las barras
  const maxValue = Math.max(...data.map(d => Math.max(d.registered, d.pending)), 1);
  const maxHeight = 180; // Altura máxima en píxeles

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0;
    return Math.max((value / maxValue) * maxHeight, value > 0 ? 5 : 0); // Mínimo 5px si hay valor
  };

  return (
    <div className="w-full">
      <div className="w-full h-56 flex items-end gap-4 px-4 justify-center">
        {data.map((monthData) => {
          const registeredHeight = getBarHeight(monthData.registered);
          const pendingHeight = getBarHeight(monthData.pending);

          return (
            <div key={monthData.month} className="flex flex-col items-center gap-2">
              <div className="relative flex items-end justify-center" style={{ minHeight: '180px' }}>
                {/* Barra verde - Registrados */}
                <div
                  className="bg-green-500 rounded-t-md transition-all duration-300 hover:bg-green-600"
                  style={{ 
                    width: 36, 
                    height: `${registeredHeight}px`, 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)' 
                  }}
                  title={`Registrados: ${monthData.registered}`}
                />
                {/* Barra azul - Pendientes */}
                {pendingHeight > 0 && (
                  <div
                    className="bg-blue-500 rounded-t-md absolute transition-all duration-300 hover:bg-blue-600"
                    style={{ 
                      width: 16, 
                      height: `${pendingHeight}px`, 
                      bottom: 0, 
                      left: 10 
                    }}
                    title={`Pendientes: ${monthData.pending}`}
                  />
                )}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">{monthData.month}</div>
              <div className="text-xs text-gray-500">
                {monthData.total > 0 ? monthData.total : '-'}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 justify-center mt-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" /> Registrados
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-sm inline-block" /> Pendientes
        </div>
      </div>
    </div>
  );
};

const OperationSofiaDashboardView: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<MonthData[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<{ registered: number; pending: number; total: number }>({
    registered: 0,
    pending: 0,
    total: 0,
  });

  // Cargar nombre de usuario desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem('user_dashboard') || localStorage.getItem('user_data');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // try common locations for name
        const name = parsed?.person?.first_name || parsed?.person?.name || parsed?.email || parsed?.user?.email;
        setUserName(name || null);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOperatorSofiaDashboard();
        if (response.success && response.data) {
          setDashboardData(response.data.monthly_data);
          setCurrentYear(response.data.year);
          setTotals(response.data.totals);
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

    loadDashboardData();
  }, []);

  return (
    <div className="w-full flex flex-col items-center px-4 py-6">
      {/* Welcome box (white) */}
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-green-700 text-3xl md:text-4xl font-bold text-center">BIENVENIDO A AUTOGESTIÓN SENA</h1>
        <p className="text-center text-gray-600 mt-2">{userName ? `Hola, ${userName}` : 'Hola, bienvenido'}</p>
      </div>

      {/* Totals cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#22c55e" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Registrados</div>
              <div className="text-2xl font-bold text-green-600">{totals.registered}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3b82f6" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M5 6.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Pendientes</div>
              <div className="text-2xl font-bold text-blue-600">{totals.pending}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6b7280" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-700">{totals.total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart card (white) */}
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M4 12l4-4 4 4 8-8" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Evolución Mensual de Registros</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Año:</span>
            <div className="border rounded-md px-3 py-2 text-sm font-semibold bg-gray-50">
              {currentYear}
            </div>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="w-full bg-white rounded-md p-4">
          <MonthBars data={dashboardData} loading={loading} />
        </div>
      </div>
    </div>
  );
};

/**
 * RoleGuardOperationSofia
 * Renders the dashboard only when role === 5
 */
export const RoleGuardOperationSofia: React.FC = () => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    try {
      const keysToCheck = ['user_dashboard', 'user_data', 'user'];
      let parsed: any = null;
      for (const k of keysToCheck) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        try {
          parsed = JSON.parse(raw);
          if (parsed) break;
        } catch (_) {
          // not JSON, skip
        }
      }

      if (!parsed) return setAllowed(false);

      // support either a flat object { role: 5 } or nested { user: { role: 5 } }
      const maybeRole = parsed?.role ?? parsed?.user?.role ?? parsed?.role_id ?? parsed?.user?.role_id;
      setAllowed(Number(maybeRole) === 5);
    } catch (e) {
      setAllowed(false);
    }
  }, []);

  if (!allowed) return null;
  return <OperationSofiaDashboardView />;
};

export default OperationSofiaDashboardView;
