import AdminDashboardView from "../components/Dashboard/AdminDashboardView";
import ApprenticeDashboardView from "../components/Dashboard/ApprenticeDashboardView";
import InstructorDashboard from "../components/Dashboard/InstructorDashboard";
import GenericDashboardView from "../components/Dashboard/GenericDashboardView";
import OperationSofiaDashboardView from "../components/Dashboard/OperationSofiaDashboardView";
import { useUserData } from "../hook/useUserData";
import { useState, useEffect } from "react";
import { getUserById } from "../Api/Services/User";
import { User } from "../Api/types/entities/user.types"; // Importar el tipo User
import { useNavigate } from "react-router-dom"; // Importar navigate

export const Home = () => {
  const { userData, isLoading } = useUserData();
  const [apprenticeId, setApprenticeId] = useState<number | undefined>(undefined);
  const [loadingApprentice, setLoadingApprentice] = useState(false);
  const [localUserData, setLocalUserData] = useState<User | null>(null); // Estado local para manejar los datos del usuario
  const navigate = useNavigate();

  const getUserName = () => {
    if (userData?.email) {
      const emailPart = userData.email.split("@")[0];
      const nameParts = emailPart.split(".");
      return nameParts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return "Usuario";
  };

  // Get apprentice_id from user endpoint (avoid general/aprendices/?person=...)
  useEffect(() => {
    const fetchApprenticeId = async () => {
      if (userData?.id && userData?.role === 2) {
        setLoadingApprentice(true);
        try {
          const fullUser: any = await getUserById(userData.id);
          const apprenticeIdFromUser = fullUser?.apprentice?.id ?? fullUser?.apprentice ?? null;
          if (apprenticeIdFromUser) setApprenticeId(apprenticeIdFromUser);
        } catch (error) {
          console.error("Error al obtener aprendiz ID desde user endpoint:", error);
        } finally {
          setLoadingApprentice(false);
        }
      }
    };

    fetchApprenticeId();
  }, [userData]);

  useEffect(() => {
    // Leer los datos del usuario desde el localStorage
    const storedUser = localStorage.getItem("user_dashboard");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        if (parsedUser && parsedUser.role) {
          
          setLocalUserData(parsedUser); // Asignar los datos al estado local
        } else {
          console.warn("El usuario no tiene un rol definido en los datos parseados."); // Log de depuración
        }
      } catch (error) {
        console.error("Error al parsear los datos del usuario desde el localStorage:", error);
        localStorage.removeItem("user_dashboard");
        navigate("/login");
      }
    } else {
      console.warn("No se encontraron datos del usuario en localStorage. Redirigiendo a login."); // Log de depuración
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading || loadingApprentice) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Role mapping
  // 1: admin, 2: aprendiz, 3: instructor, 4: coordinator, 5: operation (Sofia)
  const roleMap: Record<string | number, "admin" | "coordinator" | "instructor" | "aprendiz" | "operation"> = {
    1: "admin",
    2: "aprendiz",
    3: "instructor",
    4: "coordinator",
    5: "operation",
    "admin": "admin",
    "aprendiz": "aprendiz",
    "instructor": "instructor",
    "coordinator": "coordinator",
    "operation": "operation"
  };



const roleRaw = localUserData?.role; // Acceder directamente al rol (es un número, no un objeto)


const role = roleMap[roleRaw] || null;

  if (role === "admin") {
  
    return <AdminDashboardView />;
  }
  if (role === "aprendiz") {
  
    return <ApprenticeDashboardView name={getUserName()} apprenticeId={apprenticeId} />;
  }
  if (role === "operation") {
    return <OperationSofiaDashboardView />;
  }
  if (role === "instructor") {
  
    return <InstructorDashboard />;
  }
  if (role === "coordinator") {
  
    return <AdminDashboardView/>;
  }

  // Generic view for unrecognized roles
  
  return <GenericDashboardView name={getUserName()} />;
};

export default Home;
