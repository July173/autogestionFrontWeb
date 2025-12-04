import React from "react";
import { useNavigate } from 'react-router-dom';
import useApprenticeDashboard, { DashboardData } from '@/hook/useApprenticeDashboard';


interface AprendizDashboardProps {
  name?: string;
  apprenticeId?: number;
}

/**
 * Apprentice dashboard view.
 * Shows request status, assigned instructor, and request details.
 * @param {AprendizDashboardProps} props
 */
const AprendizDashboardView: React.FC<AprendizDashboardProps> = ({ name, apprenticeId }) => {
  const navigate = useNavigate();
  const { dashboardData, loading, userData, showInstructor, reload } = useApprenticeDashboard(apprenticeId);


  


  /**
   * Gets initials for the assigned instructor.
   * @param {DashboardData['instructor']} instructor
   * @returns {string}
   */
  const getInstructorInitials = (instructor: DashboardData['instructor']) => {
    if (!instructor) return "CW";
    const firstInitial = instructor.first_name?.charAt(0) || "";
    const lastInitial = instructor.first_last_name?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };


  /**
   * Gets full name for the assigned instructor.
   * @param {DashboardData['instructor']} instructor
   * @returns {string}
   */
  const getInstructorFullName = (instructor: DashboardData['instructor']) => {
    if (!instructor) return "No asignado";
    return `${instructor.first_name || ""} ${instructor.second_name || ""} ${instructor.first_last_name || ""} ${instructor.second_last_name || ""}`.trim();
  };


  /**
   * Formats a date string to DD/MM/YYYY.
   * @param {string} dateString
   * @returns {string}
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };


  /**
   * Gets information for the current request state.
   * @returns {object|null}
   */
  const getRequestStateInfo = () => {
    if (!dashboardData?.request_state) return null;
    
    const states = {
      'PENDIENTE': { text: 'Solicitud enviada', desc: 'Has enviado tu solicitud de etapa productiva', icon: '⏱️', color: 'text-blue-600' },
      'EN_REVISION': { text: 'En revisión', desc: 'Tu solicitud está siendo revisada por el coordinador', icon: '🔍', color: 'text-yellow-600' },
      'ASIGNADO': { text: 'Asignación de instructor', desc: 'Se te asignará un instructor de seguimiento', icon: '👤', color: 'text-green-600' },
      'RECHAZADO': { text: 'Solicitud rechazada', desc: 'Tu solicitud ha sido rechazada', icon: '❌', color: 'text-red-600' },
    };
    
    return states[dashboardData.request_state as keyof typeof states] || states['PENDIENTE'];
  };

  /**
   * Renders the timeline of request states with proper colors.
   */
  const renderTimeline = () => {
    const state = dashboardData?.request_state ?? 'PENDIENTE';

    const isCompleted = (step: string) => {
      if (state === 'RECHAZADO') {
        // For rejected: Solicitud enviada and En revisión are considered completed
        return step === 'PENDIENTE' || step === 'EN_REVISION';
      }
      if (state === 'ASIGNADO') {
        return step === 'PENDIENTE' || step === 'EN_REVISION' || step === 'ASIGNADO';
      }
      if (state === 'EN_REVISION') {
        return step === 'PENDIENTE' || step === 'EN_REVISION';
      }
      // default treat only PENDIENTE completed
      return step === 'PENDIENTE';
    };

    const getDot = (step: string) => {
      // Larger dots and emoji/icon sizing for better visibility
      if (state === 'RECHAZADO' && step === 'RECHAZADO') {
        return (<div className="bg-red-500 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-white text-2xl">⚠</div>);
      }
      if (isCompleted(step)) {
        if (step === 'PENDIENTE') return (<div className="bg-green-500 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-white text-2xl">✓</div>);
        if (step === 'EN_REVISION') return (<div className="bg-blue-500 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-white text-2xl">⏳</div>);
        if (step === 'ASIGNADO') return (<div className="bg-green-600 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-white text-2xl">👤</div>);
      }
      // not completed
      return (<div className="bg-gray-300 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-white"> </div>);
    };

    return (
      <div className="flex flex-col gap-4 px-6">
        {/* Solicitud enviada */}
        <div className="flex items-start gap-3">
          {getDot('PENDIENTE')}
          <div className="flex-1">
            <p className="font-semibold text-lg">Solicitud enviada</p>
            <p className="text-sm text-gray-600">Has enviado tu solicitud de etapa productiva</p>
          </div>
        </div>

        {/* separator */}
        <div className="h-12 w-0.5 bg-gray-300 ml-6"></div>

        {/* En revisión */}
        <div className="flex items-start gap-3">
          {getDot('EN_REVISION')}
            <div className="flex-1">
            <p className="font-semibold text-2xl">En revisión</p>
            <p className="text-base text-gray-600">Tu solicitud está siendo revisada por el coordinador</p>
            {state === 'EN_REVISION' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">En Progreso...</p>
              </div>
            )}
          </div>
        </div>

        {/* separator */}
        <div className="h-12 w-0.5 bg-gray-300 ml-6"></div>

        {/* Assigned / Rejected */}
        {state === 'RECHAZADO' ? (
          <div className="flex items-start gap-3">
            {getDot('RECHAZADO')}
            <div className="flex-1">
              <p className="font-semibold text-2xl text-red-600">Solicitud rechazada</p>
              <p className="text-base text-gray-600">Tu solicitud ha sido rechazada</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {getDot('ASIGNADO')}
            <div className="flex-1">
              <p className="font-semibold text-2xl">Asignación de instructor</p>
              <p className="text-base text-gray-600">Se te asignará un instructor de seguimiento</p>
            </div>
          </div>
        )}

        {/* If assigned, show approved step */}
        {state === 'ASIGNADO' && (
          <>
            <div className="h-12 w-0.5 bg-gray-300 ml-6"></div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-300 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-white"> </div>
              <div className="flex-1">
                <p className="font-semibold text-2xl">Proceso aprobado</p>
                <p className="text-base text-gray-600">Tu solicitud ha sido aprobada completamente</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Note: `showInstructor` is returned by the hook; use the destructured value above.

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 w-full">
        <div className="text-center py-10">
          <p className="text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 w-full">
  {/* Welcome banner */}
      <div className="w-full max-w-[1000px] mb-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="h-3 bg-green-600 rounded-t-lg" />
        <div className="flex items-center px-6 py-6">
          <div className="bg-gray-200/50 rounded-full flex items-center justify-center w-[70px] h-[70px] mr-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
          </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-gray-800 mb-0">¡ Bienvenido !</p>
            <p className="text-2xl font-normal text-gray-700 mb-0">{userData?.person?.first_name || "Aprendiz"}</p>
            <p className="text-base text-gray-600">Gestione Desde Aquí Tus Procesos De Formación</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
  {/* Request status */}
        <div className="bg-white rounded-lg w-full sm:w-[495px] p-6 flex flex-col" style={{ boxShadow: '0 10px 30px rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.06)' }}>
          <div className="bg-green-600 rounded-t-md w-full py-4 mb-6 flex items-center justify-center text-white">
            <p className="text-xl font-bold">Estado de tu solicitud</p>
          </div>
          
          {!dashboardData?.has_request ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-300/70 rounded-full w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="gray" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                </svg>
              </div>
              <p className="text-lg text-black font-semibold">Sin solicitudes para tu etapa productiva</p>
              <p className="text-base text-black text-center">Aún no has solicitado ningún proceso para tu etapa productiva, por favor registra una solicitud</p>
              <button
                className="bg-green-600 text-white rounded-lg px-6 py-3 font-medium mt-2 hover:bg-green-700"
                onClick={() => navigate('/request-registration')}
              >
                Hacer una solicitud
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {renderTimeline()}
            </div>
          )}
        </div>

          {/* Right column */}
        <div className="flex flex-col gap-5 w-full sm:w-[486px]">
          {/* Your assigned instructor */}
          <div className="bg-white rounded-lg w-full p-6 flex flex-col items-center" style={{ boxShadow: '0 10px 30px rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.04)' }}>
            {/** Header title: cambiar a 'Instructor de revisión' cuando el estado sea VERIFICANDO o PRE-APROBADO */}
            <div className="bg-green-600 rounded-t-md w-full py-4 mb-4 flex items-center justify-center text-white">
                <p className="text-lg font-bold">
                  {(() => {
                    const rawState = dashboardData?.request?.request_state;
                    const reviewStates = ['VERIFICANDO', 'PRE-APROBADO', 'PRE_APROBADO'];
                    if (rawState && reviewStates.includes(String(rawState).toUpperCase())) {
                      return 'Tu Instructor de revisión';
                    }
                    return 'Tu Instructor asignado';
                  })()}
                </p>
              </div>
            
            {!showInstructor ? (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-gray-400/70 rounded-full w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] flex items-center justify-center mb-2">
                  <p className="text-2xl font-semibold text-white">CW</p>
                </div>
                <p className="text-xl font-semibold text-black">No asignado</p>
                <div className="bg-gray-400/50 rounded-lg px-4 py-2">
                  <p className="text-xl font-semibold text-black">pendiente de Asignar</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="bg-purple-400/70 rounded-full w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] flex items-center justify-center mb-2">
                  <p className="text-3xl font-bold text-white">{getInstructorInitials(dashboardData.instructor)}</p>
                </div>
                <p className="text-xl font-semibold text-black text-center">{getInstructorFullName(dashboardData.instructor)}</p>
                <p className="text-base text-gray-600">{dashboardData.instructor.knowledge_area || "Área de conocimiento"}</p>
                {dashboardData.instructor.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                    </svg>
                    <p className="text-sm">{dashboardData.instructor.email}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                  </svg>
                  <p className="text-sm">{dashboardData.instructor.phone}</p>
                </div>
                {dashboardData.instructor.email && (
                  <button
                    className="bg-green-600 text-white rounded-lg px-6 py-2 font-medium mt-2 hover:bg-green-700 flex items-center gap-2"
                    onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(dashboardData.instructor!.email || '')}`, '_blank')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                    </svg>
                    Enviar Email
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Request details */}
          <div className="bg-white rounded-lg w-full p-6 flex flex-col" style={{ boxShadow: '0 10px 30px rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.04)' }}>
            <div className="bg-green-600 rounded-t-md w-full py-4 mb-4 flex items-center justify-center text-white">
              <p className="text-lg font-bold">Detalle de tu Solicitud</p>
            </div>
            
            {!dashboardData?.has_request ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xl font-semibold text-black">Sin solicitud</p>
                <p className="text-base text-black text-center">Aparecerán los detalles de la solicitud una vez sea aprobado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="font-semibold">{dashboardData.request?.enterprise_name || "No especificada"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0a5 5 0 0 0-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-semibold">{dashboardData.request?.location || "No especificada"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Enviado el</p>
                    <p className="font-semibold">{dashboardData.request?.request_date ? formatDate(dashboardData.request.request_date) : "No disponible"}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-semibold">Tipo de solicitud: <span className="font-normal">{dashboardData.request?.modality || "Etapa práctica"}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AprendizDashboardView;
