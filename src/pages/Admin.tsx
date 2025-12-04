
/**
 * Admin Component
 * Main administration screen for permissions, users, roles, modules and forms.
 *
 * Features:
 * - Displays counts of users, roles, modules and forms.
 * - Navigation bar to switch between different administrative views.
 * - Loads and displays dynamic components according to the active tab.
 * - Handles smooth transitions between tabs and loading/error states.
 *
 * @returns {JSX.Element} Rendered administration view.
 */

import React from 'react'
import { useEffect, useState } from 'react';
import SummarySecurity from '../components/ModuleSecurity/SummarySecurity';
import Users from '../components/ModuleSecurity/Users';
import Roles from '../components/ModuleSecurity/Roles';
import Modules from '../components/ModuleSecurity/Modules';
import General from '../components/ModuleSecurity/general';
import { User, Shield, Layout, FileText, BookOpen } from 'lucide-react';
import { getUsers } from '../Api/Services/User';
import { getRoles } from '../Api/Services/Rol';
import { getModules } from '../Api/Services/Module';
import { getForms } from '../Api/Services/Form';



export const Admin = () => {
  // States for counts
  const [userCount, setUserCount] = useState<number>(0);
  const [roleCount, setRoleCount] = useState<number>(0);
  const [moduleCount, setModuleCount] = useState<number>(0);
  const [formCount, setFormCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'usuarios' | 'roles' | 'modulos' | 'general'>('resumen');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Function to change tab with smooth transition
  const handleTabChange = (newTab: typeof activeTab) => {
    if (newTab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50); // Small delay for the component to mount
    }, 200); // Time of fade out more long
  };

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      setError(null);
      try {
        const [users, roles, modules, forms] = await Promise.all([
          getUsers(),
          getRoles(),
          getModules(),
          getForms()
        ]);
        setUserCount(users.length);
        setRoleCount(roles.length);
        setModuleCount(modules.length);
        setFormCount(forms.length);
      } catch (err: unknown) {
        console.error('Error fetching admin counts:', err);
        const getMessage = (e: unknown): string => {
          if (!e || typeof e !== 'object') return 'Error al cargar los datos';
          const maybe = e as { message?: unknown };
          return typeof maybe.message === 'string' ? maybe.message : 'Error al cargar los datos';
        };
        setError(getMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
  <div className='text-center justify-center'>
        <h1 className='text-3xl font-semibold '>Administración de Permisos </h1>
        <p className='text-gray-600'>Gestiona usuarios, roles, módulos y permisos desde una sola pantalla</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-6 justify-center items-center">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col w-full sm:w-44 md:w-48 lg:w-52 xl:w-56">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-green-600" />
            <div className="flex flex-col  mb-2">
              <span className="text-2xl font-bold text-black">{userCount}</span>
              <span className="text-gray-600 mt-1">Usuarios</span>
            </div>
          </div>
        </div>
  <div className="bg-white rounded-xl shadow p-4 flex flex-col w-full sm:w-44 md:w-48 lg:w-52 xl:w-56">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-600" />
            <div className="flex flex-col items-start mb-2">
              <span className="text-2xl font-bold text-black">{roleCount}</span>
              <span className="text-gray-600 mt-1">Roles</span>
            </div>
          </div>
        </div>
  <div className="bg-white rounded-xl shadow p-4 flex flex-col w-full sm:w-44 md:w-48 lg:w-52 xl:w-56">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-8 h-8 text-green-600" />
            <div className="flex flex-col  mb-2">
              <span className="text-2xl font-bold text-black">{moduleCount}</span>
              <span className="text-gray-600 mt-1">Módulos</span>
            </div>
          </div>
        </div>
  <div className="bg-white rounded-xl shadow p-4 flex flex-col w-full sm:w-44 md:w-48 lg:w-52 xl:w-56">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="flex flex-col  mb-2">
              <span className="text-2xl font-bold text-black">{formCount}</span>
              <span className="text-gray-600 mt-1">Formularios</span>
            </div>
          </div>
        </div>
            
      </div>
      {loading && <div className="text-gray-500 text-center mt-6">Cargando...</div>}
      {error && <div className="text-red-500 text-center mt-6">{error}</div>}

      {/* Navigation bar */}
  <div className="mt-10 bg-[#E9EBF5] rounded-xl flex flex-wrap items-center justify-center sm:justify-between px-2 py-2 gap-2 sm:gap-6 w-full max-w-5xl mx-auto">
        <button
          className={`flex flex-col items-center justify-center w-1/2 sm:w-1/5 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'resumen' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          onClick={() => handleTabChange('resumen')}
          aria-pressed={activeTab === 'resumen'}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            <span>Resumen</span>
          </span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-1/2 sm:w-1/5 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'usuarios' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          onClick={() => handleTabChange('usuarios')}
          aria-pressed={activeTab === 'usuarios'}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            <span>Usuarios</span>
          </span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-1/2 sm:w-1/5 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'roles' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          onClick={() => handleTabChange('roles')}
          aria-pressed={activeTab === 'roles'}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Roles</span>
          </span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-1/2 sm:w-1/5 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'modulos' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          onClick={() => handleTabChange('modulos')}
          aria-pressed={activeTab === 'modulos'}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <Layout className="w-5 h-5" />
            <span>Módulos</span>
          </span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-1/2 sm:w-1/5 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'general' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
          onClick={() => handleTabChange('general')}
          aria-pressed={activeTab === 'general'}
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>General</span>
          </span>
        </button>
      </div>

      {/* Dynamic content below the navigation bar */}
  <div className="mt-6">
        <div 
          className={`transition-all duration-500 ease-in-out transform ${
            isTransitioning ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}
          style={{
            transitionDelay: isTransitioning ? '0ms' : '100ms'
          }}
        >
          {activeTab === 'resumen' && !isTransitioning && <SummarySecurity />}
          {activeTab === 'usuarios' && !isTransitioning && <Users />}
          {activeTab === 'roles' && !isTransitioning && <Roles />}
          {activeTab === 'modulos' && !isTransitioning && <Modules />}
          {activeTab === 'general' && !isTransitioning && <General />}
        </div>
      </div>
    </div>
  );
}

