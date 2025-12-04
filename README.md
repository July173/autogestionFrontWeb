# 🎓 AutoGestión SENA - Frontend

Sistema de gestión de asignaciones de instructores y seguimiento de aprendices en etapa productiva para el SENA.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características Principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Convenciones de Código](#convenciones-de-código)
- [Endpoints Principales](#endpoints-principales)

---

## 📝 Descripción

Aplicación web moderna desarrollada con **React** y **TypeScript** que permite gestionar:

- ✅ **Asignación de instructores** a aprendices en etapa productiva
- 📋 **Solicitudes de asignación** (creación, aprobación, rechazo)
- 👨‍🏫 **Gestión de instructores** (límites, disponibilidad, reasignaciones)
- 📊 **Seguimiento y valoración** de aprendices
- 🔐 **Módulo de seguridad** (roles, permisos, formularios)
- 📅 **Gestión de visitas** de seguimiento
- 📢 **Sistema de notificaciones** en tiempo real

---

## 🚀 Tecnologías

### Core
- **React** 18.x - Biblioteca de interfaz de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Build tool y dev server ultra-rápido

### Estilos
- **Tailwind CSS** - Framework de utilidades CSS
- **CSS Modules** - Estilos con alcance local

### Estado y Datos
- **React Hooks** - Gestión de estado (useState, useEffect, useCallback, useRef)
- **Custom Hooks** - Lógica reutilizable (useForms, useRoles, useInstructorAssignments, etc.)

### HTTP Client
- **Fetch API** - Peticiones HTTP nativas

### Routing
- **React Router** - Navegación entre páginas

### Otras Herramientas
- **ESLint** - Linter de código
- **date-fns** / **dateutil** - Manejo de fechas

---

## 📦 Requisitos Previos

- **Node.js** >= 16.x
- **npm** >= 8.x o **yarn** >= 1.22.x
- **Backend Django** corriendo en `http://localhost:8000` o configurado

---

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
cd Frontend
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/

# Configuración adicional (opcional)
VITE_APP_NAME=AutoGestión SENA
VITE_APP_VERSION=1.0.0
```

### Configuración de API

El archivo `src/Api/config/ConfigApi.ts` centraliza todos los endpoints:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";

export const ENDPOINTS = {
  user: { ... },
  requestAsignation: { ... },
  instructor: { ... },
  // ... más endpoints
};
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (hot reload)

# Construcción
npm run build        # Genera build de producción
npm run preview      # Previsualiza el build de producción

# Linting
npm run lint         # Ejecuta ESLint para revisar código
```

---

## 📁 Estructura del Proyecto

```
Frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── Api/               # Capa de servicios y configuración API
│   │   ├── config/        # Configuración de endpoints
│   │   ├── Services/      # Funciones de llamadas API
│   │   └── types/         # Interfaces TypeScript
│   │       ├── entities/  # Tipos de entidades
│   │       └── Modules/   # Tipos por módulo
│   │
│   ├── components/        # Componentes reutilizables
│   │   ├── assing/        # Componentes de asignación
│   │   │   ├── ModalAssign.tsx
│   │   │   ├── ModalPreApprove.tsx
│   │   │   ├── AssignTableView.tsx
│   │   │   └── AssignButton.tsx
│   │   │
│   │   ├── ApplicationEvaluation/  # Evaluación de solicitudes
│   │   │   ├── InstructorAssignmentsTable.tsx
│   │   │   └── AssignReviewModal.tsx
│   │   │
│   │   ├── ModuleSecurity/  # Módulo de seguridad
│   │   │   ├── Roles.tsx
│   │   │   ├── FormsSection.tsx
│   │   │   └── ModalFormGeneric.tsx
│   │   │
│   │   ├── FilterBar.tsx   # Barra de filtros reutilizable
│   │   ├── Paginator.tsx   # Paginación
│   │   ├── ConfirmModal.tsx
│   │   ├── NotificationModal.tsx
│   │   ├── LoadingOverlay.tsx
│   │   └── ReloadButton.tsx
│   │
│   ├── hook/              # Custom Hooks
│   │   ├── useForms.ts
│   │   ├── useRoles.ts
│   │   ├── useInstructorAssignments.ts
│   │   ├── useAssignReviewModal.ts
│   │   └── useNotification.ts
│   │
│   ├── pages/             # Páginas principales
│   │   ├── Assign.tsx
│   │   ├── ApplicationEvaluation.tsx
│   │   └── ...
│   │
│   ├── utils/             # Utilidades
│   │   ├── parseError.ts
│   │   └── ...
│   │
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales (Tailwind)
│
├── .env                   # Variables de entorno
├── .env.example           # Ejemplo de variables
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración TypeScript
├── vite.config.ts         # Configuración Vite
├── tailwind.config.js     # Configuración Tailwind
└── README.md              # Documentación
```

---

## ✨ Características Principales

### 🔐 Módulo de Seguridad
- **Gestión de Roles**: CRUD completo con asignación de permisos por formulario
- **Gestión de Usuarios**: Filtrado, creación, edición, activación/desactivación
- **Gestión de Formularios**: Control de formularios del sistema
- **Permisos Granulares**: Asignación de permisos por rol y formulario

### 📋 Gestión de Asignaciones
- **Creación de Solicitudes**: Formulario completo con datos de empresa, jefe, talento humano
- **Asignación de Instructores**: Modal inteligente con límites de aprendices
- **Estados de Solicitud**:
  - `SIN_ASIGNAR` - Solicitud creada, sin instructor
  - `ASIGNADO` - Instructor asignado
  - `VERIFICANDO` - En proceso de verificación
  - `PRE-APROBADO` - Pre-aprobado por instructor
  - `RECHAZADO` - Rechazado
  - `FINALIZADA` - Completada

### 👨‍🏫 Valoración de Instructores
- **Tabla de Asignaciones**: Lista de aprendices asignados por instructor
- **Modal de Valoración**: Aprobación/rechazo con mensajes
- **Historial de Mensajes**: Trazabilidad completa de comunicaciones
- **Validaciones**: No permite aprobar solicitudes ya rechazadas

### 📊 Evaluación de Solicitudes (Coordinador)
- **Revisión Pre-Aprobación**: Modal con información completa
- **Filtros Avanzados**: Por nombre, documento, estado, modalidad, programa
- **Gestión de Fechas**: Validación de periodos de contrato (máx 7 meses)
- **Creación Automática de Visitas**: 3 visitas al aprobar (Concertación, Parcial, Final)

### 🔔 Sistema de Notificaciones
- Notificaciones en tiempo real
- Indicadores visuales de estado
- Historial de notificaciones

---

## 🏗️ Arquitectura

### Patrón de Diseño

El proyecto sigue una **arquitectura por capas**:

```
┌─────────────────────────────────────┐
│          Pages (Páginas)            │  ← Rutas principales
├─────────────────────────────────────┤
│      Components (Componentes)       │  ← UI reutilizable
├─────────────────────────────────────┤
│        Hooks (Lógica Custom)        │  ← Estado y efectos
├─────────────────────────────────────┤
│     Services (Capa de Datos)        │  ← Llamadas API
├─────────────────────────────────────┤
│          Types (Interfaces)         │  ← TypeScript
└─────────────────────────────────────┘
```

### Flujo de Datos

```
User Interaction → Component → Custom Hook → Service → Backend API
                      ↓            ↓            ↓
                   Update State ← Process ← Response
```

### Custom Hooks Principales

| Hook | Propósito | Ubicación |
|------|-----------|-----------|
| `useForms` | Gestión de formularios del sistema | `hook/useForms.ts` |
| `useRoles` | Gestión de roles y permisos | `hook/useRoles.ts` |
| `useInstructorAssignments` | Asignaciones de instructor | `hook/useInstructorAssignments.ts` |
| `useAssignReviewModal` | Lógica de valoración | `hook/useAssignReviewModal.ts` |
| `useNotification` | Sistema de notificaciones | `hook/useNotification.ts` |

---

## 📝 Convenciones de Código

### TypeScript

```typescript
// ✅ Interfaces para props
interface MyComponentProps {
  title: string;
  onClose: () => void;
  data?: MyData;
}

// ✅ Tipos para estados
type RequestState = 'ASIGNADO' | 'RECHAZADO' | 'VERIFICANDO' | 'PRE-APROBADO' | 'SIN_ASIGNAR';

// ✅ Tipado de funciones async
const fetchData = async (id: number): Promise<DataResponse> => {
  // ...
};
```

### Componentes

```typescript
// ✅ Componentes funcionales con TypeScript
export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  const [state, setState] = useState<StateType>(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
}
```

### Naming Conventions

- **Componentes**: `PascalCase` (ej: `ModalAssign.tsx`)
- **Hooks**: `camelCase` con prefijo `use` (ej: `useForms.ts`)
- **Services**: `camelCase` (ej: `requestAsignation.ts`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `API_BASE_URL`)
- **Funciones**: `camelCase` (ej: `handleSubmit`)

### Estilos (Tailwind)

```tsx
// ✅ Clases Tailwind en orden: layout → espaciado → colores → efectos
<button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
  Botón
</button>

// ✅ Conditional classes
<div className={`base-classes ${isActive ? 'active-classes' : 'inactive-classes'}`}>
```

---

## 🌐 Endpoints Principales

### Autenticación y Usuarios
```
POST   /security/users/validate-institutional-login/
POST   /security/users/validate-2fa-code/
GET    /security/users/{id}/
```

### Asignaciones
```
GET    /assign/request_asignation/form-request-list/
POST   /assign/request_asignation/form-request/
GET    /assign/request_asignation/{id}/form-request-detail/
PATCH  /assign/request_asignation/{id}/form-request-update/
PATCH  /assign/request_asignation/{id}/form-request-reject/
POST   /assign/asignation_instructor/custom-create/
GET    /assign/request_asignation/{id}/messages/
```

### Instructores
```
GET    /general/instructors/
GET    /general/instructors/custom-list/
GET    /general/instructors/{id}/asignations/
PATCH  /general/instructors/{id}/update-learners/
```

### Roles y Permisos
```
GET    /security/roles/
GET    /security/roles/filter/
POST   /security/rol-form-permissions/create-role-with-permissions/
PUT    /security/rol-form-permissions/{id}/update-role-with-permissions/
```

---

## 🎨 Paleta de Colores

```css
/* Colores Principales */
--green-primary: #22c55e    /* Botones principales, estados activos */
--green-hover: #16a34a      /* Hover de botones verdes */
--red-danger: #dc2626        /* Rechazos, errores, alertas */
--yellow-warning: #fbbf24    /* Pendientes, advertencias */
--gray-neutral: #6b7280      /* Texto secundario, bordes */
--white: #ffffff             /* Fondo, texto en botones */
```

---

## 🐛 Debugging

### Logs en Consola

Los servicios incluyen `console.log` y `console.error` para debugging:

```typescript
console.log('[ComponentName] action', { data });
console.error('Error en serviceName:', error);
```

### React DevTools

Instalar extensión de navegador: [React Developer Tools](https://react.dev/learn/react-developer-tools)

---

## 📚 Recursos Adicionales

- [Documentación React](https://react.dev/)
- [Documentación TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación Vite](https://vitejs.dev/)

---

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: descripción del cambio'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Commits Semánticos

```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Formato, espacios (no afecta código)
refactor: Refactorización de código
test: Agregar o modificar tests
chore: Mantenimiento, configuración
```

---

## 📄 Licencia

Este proyecto es propiedad del **SENA** (Servicio Nacional de Aprendizaje).

---

## 📞 Soporte

Para reportar problemas o solicitar características:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para el SENA**

