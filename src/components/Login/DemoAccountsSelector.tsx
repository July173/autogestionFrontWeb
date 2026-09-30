import React from 'react';
import { Shield, GraduationCap, Briefcase, UserCheck, Monitor, Sparkles } from 'lucide-react';

interface DemoAccount {
  roleName: string;
  roleId: number;
  email: string;
  icon: React.ReactNode;
  badgeColor: string;
  borderColor: string;
  bgHover: string;
  description: string;
}

interface DemoAccountsSelectorProps {
  onSelectAccount: (email: string, password: string) => void;
  selectedEmail?: string;
}

const DEMO_PASSWORD = 'Sena2026*';

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleName: 'Administrador',
    roleId: 1,
    email: 'admin.demo@sena.edu.co',
    icon: <Shield className="w-4 h-4 text-purple-600" />,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    borderColor: 'border-purple-200 hover:border-purple-500',
    bgHover: 'hover:bg-purple-50/50',
    description: 'Gestión total de usuarios, roles, módulos y permisos',
  },
  {
    roleName: 'Aprendiz',
    roleId: 2,
    email: 'aprendiz.demo@soy.sena.edu.co',
    icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-200 hover:border-emerald-500',
    bgHover: 'hover:bg-emerald-50/50',
    description: 'Autogestión de novedades, excusas y seguimiento de fichas',
  },
  {
    roleName: 'Instructor',
    roleId: 3,
    email: 'instructor.demo@sena.edu.co',
    icon: <Briefcase className="w-4 h-4 text-blue-600" />,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    borderColor: 'border-blue-200 hover:border-blue-500',
    bgHover: 'hover:bg-blue-50/50',
    description: 'Control de asistencia, aprendices y evaluación de fichas',
  },
  {
    roleName: 'Coordinador',
    roleId: 4,
    email: 'coordinador.demo@sena.edu.co',
    icon: <UserCheck className="w-4 h-4 text-amber-600" />,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    borderColor: 'border-amber-200 hover:border-amber-500',
    bgHover: 'hover:bg-amber-50/50',
    description: 'Supervisión académica, comités y gestión de coordinación',
  },
  {
    roleName: 'Operador Sofia',
    roleId: 5,
    email: 'sofia.demo@sena.edu.co',
    icon: <Monitor className="w-4 h-4 text-cyan-600" />,
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    borderColor: 'border-cyan-200 hover:border-cyan-500',
    bgHover: 'hover:bg-cyan-50/50',
    description: 'Carga masiva de datos y sincronización desde Excel',
  },
];

export const DemoAccountsSelector: React.FC<DemoAccountsSelectorProps> = ({
  onSelectAccount,
  selectedEmail,
}) => {
  return (
    <div className="w-full mt-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-50/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-green-100 text-green-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Cuentas Demo para Pruebas (1 Clic)
          </span>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          2FA Demo: 123456
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Selecciona un perfil institucional para autocompletar el login y probar los módulos:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((account) => {
          const isSelected = selectedEmail === account.email;
          return (
            <button
              key={account.email}
              type="button"
              onClick={() => onSelectAccount(account.email, DEMO_PASSWORD)}
              className={`text-left p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-green-600 bg-green-50/60 shadow-sm ring-1 ring-green-500'
                  : `bg-white ${account.borderColor} ${account.bgHover}`
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center space-x-1.5">
                  {account.icon}
                  <span className="text-xs font-semibold text-gray-900">
                    {account.roleName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${account.badgeColor}`}
                >
                  Rol {account.roleId}
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-600 truncate w-full">
                {account.email}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                {account.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-gray-500">
        <span>Contraseña unificada: <strong className="font-mono text-gray-700">{DEMO_PASSWORD}</strong></span>
        <span className="text-green-700 font-medium">Bypass 2FA activo</span>
      </div>
    </div>
  );
};

export default DemoAccountsSelector;
