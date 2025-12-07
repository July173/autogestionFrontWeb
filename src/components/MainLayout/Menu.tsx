/**
 * Props for Menu component.
 * @typedef SidebarMenuProps
 * @property {string} userId - Authenticated user ID.
 * @property {string} userName - Authenticated user name.
 * @property {string} [userImage] - User profile image URL.
 * @property {(form: MenuItem) => void} [onMenuItemClick] - Callback when selecting a form.
 * @property {string} [className] - Additional CSS classes for the menu.
 * @property {(path: string) => void} [onNavigate] - Callback for custom navigation.
 */
/**
 * Menu component
 * -------------
 * Renders the main sidebar menu of the application, showing available modules and forms for the user.
 *
 * Features:
 * - Groups forms by module and allows expanding/collapsing modules.
 * - Highlights active module and form.
 * - Shows user info and allows viewing profile/logging out.
 * - Popover modal for user actions.
 * - Uses custom icons per module.
 *
 * @param {SidebarMenuProps} props - Menu properties.
 * @returns {JSX.Element} Rendered sidebar menu.
 */


import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { List } from 'lucide-react';
import { ChevronDown, LogOut } from 'lucide-react';
import { 
  House, 
  Shield, 
  PersonCheck, 
  Person, 
  BarChart, 
  Gear,
  Fingerprint,
  PersonWorkspace
} from 'react-bootstrap-icons';
import { menu } from '../../Api/Services/Menu';
import { MenuItem, MenuUserInfo, SidebarMenuProps } from '../../Api/types/entities/menu.types';
import { useUserData } from '../../hook/useUserData';
import { useNavigate } from "react-router-dom";
import { User } from '../../Api/types/entities/user.types';
import logo from '/public/logo.png';

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'home': House,
  'inicio': House,
  'security': Fingerprint,
  'seguridad': Fingerprint,
  'user-check': PersonCheck,
  'administración': PersonCheck,
  'asignar seguimiento': PersonWorkspace,
  'asignar seguimientos': PersonWorkspace,
  'user': Person,
  'chart': BarChart,
  'reportes': BarChart,
  'settings': Gear,
  'configuración': Gear,
};


const Menu: React.FC<SidebarMenuProps> = ({ 
  userId, 
  userName,
  userImage,
  onMenuItemClick,
  className = '',
  onNavigate
}) => {
  // Estado para menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userInfo, setUserInfo] = useState<MenuUserInfo>({ name: 'Cargando...', role: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [localUserData, setLocalUserData] = useState<User | null>(null);

  // Get real user email
  const { userData } = useUserData();

  const userBtnRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_dashboard');
    localStorage.removeItem('user_email');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (onNavigate) {
      onNavigate('login');
    } else {
      navigate('/');
    }
  };

  // Efecto para cargar los datos del usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user_dashboard");
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setLocalUserData(parsedUser);
      } catch (error) {
        console.error("Error al parsear los datos del usuario en Menu:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar los datos del localStorage para obtener el menú
        const userIdFromStorage = localUserData?.id?.toString() || userId;
        const userNameFromStorage = localUserData?.person?.first_name || userName;
        
        
        const data = await menu.getMenuItems(userIdFromStorage, userNameFromStorage);
        setMenuItems(data.menuItems);
        
        // Actualizar la información del usuario con los datos del localStorage
        const updatedUserInfo = {
          name: localUserData?.person?.first_name 
            ? `${localUserData.person.first_name} ${localUserData.person.first_last_name || ''}`.trim()
            : data.userInfo.name,
          role: localUserData?.role?.type_role || data.userInfo.role
        };
        
        setUserInfo(updatedUserInfo);
      } catch (err) {
        setError('Error al cargar el menú');
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Solo cargar el menú si tenemos datos del usuario (ya sea del localStorage o de las props)
    if (localUserData || userId) {
      fetchMenuData();
    }
  }, [localUserData, userId, userName]);

  const groupedModules: Record<string, MenuItem[]> = {};
  menuItems.forEach(item => {
    if (!groupedModules[item.module]) groupedModules[item.module] = [];
    groupedModules[item.module].push(item);
  });

  const orderedModules = Object.entries(groupedModules).sort(([a], [b]) => {
    if (a.toLowerCase() === 'inicio') return -1;
    if (b.toLowerCase() === 'inicio') return 1;
    return a.localeCompare(b);
  });

  // Opens the modal just above the button, inside the menu container
  const handleOpenModal = () => {
    setShowModal(true);
  };

  //  Closes when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !userBtnRef.current?.contains(e.target as Node)
      ) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  // Cierra menú móvil al navegar
  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Bloquea scroll del body cuando el menú está abierto en móvil
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // cerrar cualquier modal si el menú se cierra (evitar modal suelto en pantalla)
      setShowModal(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Detecta cambio de tamaño para cerrar menú móvil si es desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="fixed top-4 left-4 z-[100] md:hidden bg-green-700 hover:bg-green-800 text-white p-2 rounded-lg shadow-lg focus:outline-none"
        aria-label="Abrir menú"
        onClick={() => setMobileMenuOpen(true)}
        style={{ display: mobileMenuOpen ? 'none' : 'block' }}
      >
        <List className="w-7 h-7" />
      </button>

      {/* Overlay y menú como modal en móvil */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[90] md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={`fixed top-0 left-0 w-64 h-full rounded-r-xl bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] text-white flex flex-col m-0 z-[101] shadow-2xl transition-transform duration-300 md:hidden animate-slide-in overflow-y-auto`}
            style={{ maxWidth: '16rem', height: '100vh', minHeight: '100vh' }}
          >
            {/* Header */}
            <div className="p-6 flex items-center gap-3 flex-shrink-0">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-10 h-10" />
              </div>
              <h1 className="text-white font-semibold">Autogestión SENA</h1>
            </div>
            {/* Scrollable menu area (igual que en desktop) */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <nav className="flex-1 px-4 overflow-y-auto min-h-0 max-h-[calc(100vh-180px)] md:max-h-none">
                <ul className="space-y-2">
                  {Object.entries(menuItems.reduce((acc, item) => {
                    if (!acc[item.module]) acc[item.module] = [];
                    acc[item.module].push(item);
                    return acc;
                  }, {} as Record<string, MenuItem[]>)).sort(([a], [b]) => {
                    if (a.toLowerCase() === 'inicio') return -1;
                    if (b.toLowerCase() === 'inicio') return 1;
                    return a.localeCompare(b);
                  }).map(([moduleName, forms]) => {
                    const IconComponent = iconMap[moduleName.toLowerCase()] || House;
                    const isOpen = openModule === moduleName;
                    const isInicio = moduleName.toLowerCase() === 'inicio';
                    const isActiveModule = activeModule === moduleName;
                    if (isInicio) {
                      return (
                        <li key={moduleName}>
                          <button
                            onClick={() => {
                              setActiveModule(moduleName);
                              setActiveItem(null);
                              handleNavigate('/home');
                            }}
                            className={`w-full flex items-start gap-2 px-4 py-3 rounded-lg text-left transition-colors ${isActiveModule ? "bg-white/20 text-white" : "hover:bg-white/10"}`}
                          >
                            <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span className="font-medium leading-tight">{moduleName}</span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={moduleName}>
                        <button
                          onClick={() => {
                            setOpenModule(isOpen ? null : moduleName);
                            setActiveModule(moduleName);
                          }}
                          className={`w-full flex items-start justify-between px-4 py-3 rounded-lg text-left transition-colors ${isActiveModule ? "bg-white/20 text-white" : "hover:bg-white/10"}`}
                        >
                          <span className="flex items-start gap-2 flex-1">
                            <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span className="font-medium leading-tight">{moduleName}</span>
                          </span>
                          <ChevronDown className={`w-4 h-4 mt-0.5 flex-shrink-0 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
                          {isOpen && (
                            <ul className="ml-8 mt-2 space-y-1">
                              {forms.map(form => {
                                const isActive = activeItem === form.id;
                                return (
                                  <li key={form.id}>
                                    <button
                                      onClick={() => {
                                        setActiveItem(form.id);
                                        setActiveModule(moduleName);
                                        if (onMenuItemClick) onMenuItemClick({ ...form, moduleName });
                                        handleNavigate(form.path);
                                      }}
                                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs md:text-sm whitespace-nowrap ${isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"}`}
                                    >
                                      <span className="w-4 h-4 flex items-center justify-center text-white/80">•</span>
                                      {form.name}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
            {/* Información de usuario fija abajo con borde superior */}
            <div
              ref={userBtnRef}
              onClick={handleOpenModal}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenModal(); } }}
              tabIndex={0}
              className="p-4 border-t border-white/20 cursor-pointer hover:bg-white/10 flex-shrink-0"
              style={{
                background: '',
                zIndex: 10,
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                position: 'sticky',
                bottom: 0,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden">
                  {userImage ? (
                    <img 
                      src={userImage.startsWith('http') ? userImage : `http://localhost:8000${userImage}`} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {localUserData?.person?.first_name 
                      ? `${localUserData.person.first_name} ${localUserData.person.first_last_name || ''}`.trim()
                      : userInfo.name}
                  </p>
                  <div className="inline-block bg-[#0F172A] text-[#61F659] text-xs px-2 py-1 rounded-full mt-1">
                    {localUserData?.role?.type_role || userInfo.role}
                  </div>
                </div>
              </div>
            </div>
            {/* Botón cerrar menú móvil */}
            <button
              className="absolute top-4 right-4 md:hidden bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-[102]"
              aria-label="Cerrar menú"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Sidebar menú en desktop */}
      <div
        className={`w-64 rounded-xl bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] text-white flex flex-col m-2 relative md:h-screen h-auto
        transition-transform duration-300 z-[101] hidden md:flex
        ${className}`}
        style={{
          maxWidth: '16rem',
          minHeight: '100vh',
          zIndex: 101,
        }}
      >
      {/* Header */}
      <div className="p-6 flex items-center gap-3 flex-shrink-0">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-10 h-10" />
        </div>
        <h1 className="text-white font-semibold">Autogestión SENA</h1>
      </div>

      {/* Scrollable menu area */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 px-4 overflow-y-auto min-h-0 max-h-[calc(100vh-180px)] md:max-h-none">
          <ul className="space-y-2">
            {orderedModules.map(([moduleName, forms]) => {
              const IconComponent = iconMap[moduleName.toLowerCase()] || House;
              const isOpen = openModule === moduleName;
              const isInicio = moduleName.toLowerCase() === 'inicio';
              const isActiveModule = activeModule === moduleName;
              
                // If it's "Inicio", render as a direct button without submodules
              if (isInicio) {
                return (
                  <li key={moduleName}>
                    <button
                      onClick={() => {
                        setActiveModule(moduleName);
                        setActiveItem(null);
                        handleNavigate('/home');
                      }}
                      className={`w-full flex items-start gap-2 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActiveModule 
                          ? "bg-white/20 text-white" 
                          : "hover:bg-white/10"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="font-medium leading-tight">{moduleName}</span>
                    </button>
                  </li>
                );
              }
              
                // For other modules, keep the expandable functionality
              return (
                <li key={moduleName}>
                  <button
                    onClick={() => {
                      setOpenModule(isOpen ? null : moduleName);
                      setActiveModule(moduleName);
                    }}
                    className={`w-full flex items-start justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      isActiveModule 
                        ? "bg-white/20 text-white" 
                        : "hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-start gap-2 flex-1">
                      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="font-medium leading-tight">{moduleName}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 transform transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}
                  >
                    {isOpen && (
                      <ul className="ml-8 mt-2 space-y-1">
                        {forms.map(form => {
                          const isActive = activeItem === form.id;
                          return (
                            <li key={form.id}>
                              <button
                                onClick={() => {
                                  setActiveItem(form.id);
                                    setActiveModule(moduleName); // Keep the module active
                                    if (onMenuItemClick) onMenuItemClick({ ...form, moduleName }); // <-- SENDS MODULE AND FORM
                                    handleNavigate(form.path);
                                }}
                                className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs md:text-sm whitespace-nowrap ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:bg-white/10"
                                }`}
                              >
                                <span className="w-4 h-4 flex items-center justify-center text-white/80">•</span>
                                {form.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Información de usuario fija abajo con borde superior */}
        <div
          ref={userBtnRef}
          onClick={handleOpenModal}
          className="p-4 border-t border-white/20 cursor-pointer hover:bg-white/10 flex-shrink-0"
          style={{
            background: '',
            zIndex: 10,
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden">
              {userImage ? (
                <img 
                  src={userImage.startsWith('http') ? userImage : `http://localhost:8000${userImage}`} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-sm font-medium">
                  {userInfo.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {localUserData?.person?.first_name 
                  ? `${localUserData.person.first_name} ${localUserData.person.first_last_name || ''}`.trim()
                  : userInfo.name}
              </p>
              <div className="inline-block bg-[#0F172A] text-[#61F659] text-xs px-2 py-1 rounded-full mt-1">
                {localUserData?.role?.type_role || userInfo.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal style popover */}
      {showModal && mobileMenuOpen && createPortal(
        <div
          ref={modalRef}
          className="fixed bottom-[84px] left-4 w-56 z-[103] bg-white rounded-xl shadow-lg p-4 mx-2 md:mx-0"
          style={{ left: 16 }}
        >
          <div className="flex flex-col items-start mb-4">
            <span className="text-gray-800 font-semibold text-base leading-tight">
              {localUserData?.person?.first_name 
                ? `${localUserData.person.first_name} ${localUserData.person.first_last_name || ''}`.trim()
                : userInfo.name}
            </span>
            <span className="text-gray-500 text-sm leading-tight break-all">
              {localUserData?.email || userData?.email || ''}
            </span>
          </div>
          <button
            onClick={() => {
              navigate("/perfil");
              setShowModal(false);
            }}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-gray-700 hover:bg-green-50 mb-2"
          >
            <Person className="w-4 h-4" />
            Ver perfil
          </button>
          <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-4 pl-1">
            <PersonCheck className="w-4 h-4" />
            {localUserData?.role?.type_role || userInfo.role}
            {(localUserData?.role?.type_role || userInfo.role) && (
              <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-[#EE7878] hover:bg-red-600 flex items-center gap-2 text-black"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>,
        document.body
      )}
      {showModal && !mobileMenuOpen && (
        <div
          ref={modalRef}
          className="absolute bottom-20 left-4 right-4 z-50 bg-white rounded-xl shadow-lg p-4"
        >
          {/* Desktop popover content stays unchanged */}
            {/* User information: name and email */}
            <div className="flex flex-col items-start mb-4">
              <span className="text-gray-800 font-semibold text-base leading-tight">
                {localUserData?.person?.first_name 
                  ? `${localUserData.person.first_name} ${localUserData.person.first_last_name || ''}`.trim()
                  : userInfo.name}
              </span>
              <span className="text-gray-500 text-sm leading-tight break-all">
                {localUserData?.email || userData?.email || ''}
              </span>
            </div>

            {/* View profile button */}
            <button
              onClick={() => {
                navigate("/perfil");
                setShowModal(false);
              }}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-gray-700 hover:bg-green-50 mb-2"
            >
              <Person className="w-4 h-4" />
              Ver perfil
            </button>

            {/* Rol */}
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-4 pl-1">
              <PersonCheck className="w-4 h-4" />
              {localUserData?.role?.type_role || userInfo.role}
              {(localUserData?.role?.type_role || userInfo.role) && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              )}
            </div>

              {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-lg bg-[#EE7878] hover:bg-red-600 flex items-center gap-2 text-black"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
        </div>
      )}
        {/* Botón cerrar menú móvil */}
        <button
          className="absolute top-4 right-4 md:hidden bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-[102]"
          aria-label="Cerrar menú"
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: mobileMenuOpen ? 'block' : 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default Menu;
