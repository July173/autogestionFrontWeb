# 📚 AutoGestión SENA - Frontend

## 🚀 Descripción del Proyecto

Frontend desarrollado en **React + TypeScript + Vite + Tailwind CSS** para el sistema de AutoGestión del Centro de Industria, Empresa y Servicios (CIES) del SENA. Este proyecto consume una API REST desarrollada en Python/Django.

---

## 📁 Estructura Detallada del Proyecto

### 🗂️ **Carpetas Principales**

#### **`/public`** - Recursos Estáticos
```
public/
├── favicon.ico      # Icono de la pestaña del navegador
├── placeholder.svg  # Imagen placeholder para cuando no hay imagen
```
**📋 Propósito**: Archivos que se sirven directamente sin procesamiento. Aquí se colocan:
- Logo institucional del SENA
- Imágenes corporativas
- Iconos estáticos
- Documentos de metadatos

---

#### **`/src`** - Código Fuente Principal

##### **`/src/Api`** - Configuración y Servicios de API 🌐
```
Api/
├── config/
│   └── ConfigApi.ts    # Configuración base de la API (URL, headers, interceptors)
└── Services/
    └── api.ts         # Servicios específicos para cada endpoint puede ser en distintos archivos para mas orden
```

**📋 Propósito**:
- **`ConfigApi.ts`**: Configurar la conexión con la API Django
  - URL base: `http://127.0.0.1:8000/api/`
  - Headers de autenticación
  - Interceptors para manejo de errores
  - Timeouts y retry logic

- **`api.ts`**: Funciones para consumir cada endpoint:
  ```typescript
  // Ejemplos de servicios
  export const authService = {
    login: (credentials) => POST('/security/auth/login/'),
    register: (userData) => POST('/security/auth/register/'),
    logout: () => POST('/security/auth/logout/')
  };
  
  export const formsService = {
    getForms: () => GET('/security/forms/'),
    createForm: (data) => POST('/security/forms/'),
    logicalDelete: (id) => DELETE(`/security/forms/${id}/logical-delete/`),
    persistentialDelete: (id) => DELETE(`/security/forms/${id}/persistential-delete/`)
  };
  ```

---

##### **`/src/components`** - Componentes Reutilizables 🧩
```
components/
└── ui/               # Componentes de interfaz reutilizables
```

**📋 Propósito**: Componentes que se usan en múltiples lugares:
- **Buttons**: Botones con estilos corporativos del SENA
- **Cards**: Tarjetas para mostrar información
- **Modals**: Ventanas emergentes para confirmaciones
- **Forms**: Componentes de formulario base
- **Headers/Footers**: Componentes de navegación
- **Loading**: Spinners y estados de carga
- **Alerts**: Notificaciones y mensajes

**🎯 Casos de uso**:
- Formularios de autenticación
- Tablas de datos de la API
- Confirmaciones de eliminación (lógica/persistencial)

---

##### **`/src/Css`** - Estilos Personalizados 🎨
```
Css/
└── login.css        # Estilos específicos para login
```

**📋 Propósito**: CSS personalizado que complementa Tailwind CSS:
- **Animaciones**: Transiciones específicas del SENA
- **Estilos corporativos**: Colores institucionales no incluidos en Tailwind
- **Override de componentes**: Personalización de librerías de terceros
- **Responsive custom**: Breakpoints específicos para la aplicación

**🎨 Ejemplos**:
- Gradientes institucionales
- Animaciones de loading personalizadas
- Estilos para formularios complejos

---

##### **`/src/hook`** - Custom Hooks ⚡
```
hook/                # Hooks personalizados de React
```

**📋 Propósito**: Lógica reutilizable encapsulada en hooks:

**🔐 Autenticación**:
```typescript
// useAuth.ts - Manejo del estado de autenticación
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = async (credentials) => { /* lógica de login */ };
  const logout = () => { /* lógica de logout */ };
  
  return { user, isAuthenticated, login, logout };
};
```

**🌐 API Calls**:
```typescript
// useApi.ts - Hook para llamadas a la API
export const useApi = (endpoint, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  return { data, loading, error, refetch };
};
```

**💾 Persistencia**:
```typescript
// useLocalStorage.ts - Manejo de localStorage
export const useLocalStorage = (key, defaultValue) => {
  // Lógica para persistir datos localmente
};
```

## 🎣 **¿Qué son los Hooks y por qué usarlos?**

Los **Hooks** son funciones especiales de React que te permiten "engancharte" al estado y características del ciclo de vida de React desde componentes funcionales. Son fundamentales para crear aplicaciones modernas y eficientes.

### 🔧 **Hooks Básicos de React**

#### **`useState`** - Manejo de Estado
```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
```

#### **`useEffect`** - Efectos Secundarios
```typescript
useEffect(() => {
  // Se ejecuta cuando el componente se monta
  fetchUserData();
}, []); // Array vacío = solo al montar

useEffect(() => {
  // Se ejecuta cuando 'user' cambia
  console.log('Usuario cambió:', user);
}, [user]); // Se ejecuta cuando 'user' cambia
```

### 🚀 **Custom Hooks para AutoGestión SENA**

#### **1. `useAuth` - Manejo de Autenticación**
```typescript
// /src/hook/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay token guardado al cargar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, loading, login, logout };
};
```

**📱 Uso en Login.tsx:**
```typescript
const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  
  const handleSubmit = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

#### **2. `useApi` - Llamadas a la API Django**
```typescript
// /src/hook/useApi.ts
export const useApi = <T>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
};
```

**📱 Uso para cargar formularios de seguridad:**
```typescript
const FormsList = () => {
  const { data: forms, loading, error, refetch } = useApi(
    () => securityService.getForms(),
    [] // Solo se ejecuta al montar
  );

  if (loading) return <div>Cargando formularios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Actualizar</button>
      {forms?.map(form => (
        <FormCard 
          key={form.id} 
          form={form} 
          onDelete={() => refetch()} 
        />
      ))}
    </div>
  );
};
```

#### **3. `useSecurityForms` - Gestión de Formularios SENA**
```typescript
// /src/hook/useSecurityForms.ts
export const useSecurityForms = () => {
  const [forms, setForms] = useState<SecurityForm[]>([]);
  const [loading, setLoading] = useState(false);

  const loadForms = async () => {
    setLoading(true);
    try {
      const response = await securityService.getForms();
      setForms(response.data);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: number, type: 'logical' | 'persistential') => {
    try {
      if (type === 'logical') {
        await securityService.logicalDelete(id);
      } else {
        await securityService.persistentialDelete(id);
      }
      await loadForms(); // Recargar la lista
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const createForm = async (formData: Partial<SecurityForm>) => {
    try {
      await securityService.createForm(formData);
      await loadForms(); // Recargar la lista
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  return { forms, loading, loadForms, deleteForm, createForm };
};
```

#### **4. `useForm` - Manejo de Formularios Reactivos**
```typescript
// /src/hook/useForm.ts
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (validationRules: Partial<Record<keyof T, (value: any) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationRules).forEach((key) => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(values[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, validate, reset };
};
```

**📱 Uso en Register.tsx:**
```typescript
const Register = () => {
  const { values, errors, handleChange, validate } = useForm({
    email: '',
    firstName: '',
    lastName: '',
    documentType: '',
    documentNumber: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validate({
      email: (value) => !value.includes('@soy.sena.edu.co') 
        ? 'Debe ser email institucional del SENA' : undefined,
      firstName: (value) => !value ? 'Nombre es requerido' : undefined,
      documentNumber: (value) => value.length < 8 
        ? 'Documento debe tener al menos 8 dígitos' : undefined,
    });

    if (isValid) {
      // Proceder con el registro
      registerUser(values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="ejemplo@soy.sena.edu.co"
      />
      {errors.email && <span className="text-red-500">{errors.email}</span>}
      {/* Más campos... */}
    </form>
  );
};
```

### 🎯 **Ventajas de los Custom Hooks**

#### ✅ **Reutilización de Lógica**
```typescript
// Usar el mismo hook en múltiples componentes
const Login = () => {
  const { login } = useAuth(); // ✅
};

const Header = () => {
  const { user, logout } = useAuth(); // ✅ Mismo estado compartido
};

const Dashboard = () => {
  const { isAuthenticated } = useAuth(); // ✅ Estado sincronizado
};
```

#### ✅ **Separación de Responsabilidades**
- **Componente**: Se enfoca solo en renderizar UI
- **Hook**: Maneja toda la lógica de negocio y estado

#### ✅ **Testing Más Fácil**
```typescript
// Puedes testear la lógica del hook por separado
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

test('should login user correctly', async () => {
  const { result } = renderHook(() => useAuth());
  // Test de la lógica de autenticación...
});
```

#### ✅ **Código Más Limpio y Mantenible**
```typescript
// ❌ Sin hooks (complejo y repetitivo)
const Login = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 20 líneas de lógica de autenticación...
  }, []);
  
  const login = async () => {
    // 30 líneas más de lógica...
  };
  
  // 50+ líneas de lógica + JSX
};

// ✅ Con hooks (limpio y enfocado)
const Login = () => {
  const { user, loading, error, login } = useAuth();
  
  // Solo 10-15 líneas de JSX, la lógica está en el hook
  return <LoginForm onSubmit={login} loading={loading} />;
};
```

### 🏢 **Hooks Específicos para SENA**

Para tu proyecto de AutoGestión SENA, los hooks te permitirán:

- **`useAuth`**: Manejar autenticación de aprendices/instructores
- **`useSecurityForms`**: Gestionar formularios de seguridad
- **`usePermissions`**: Manejar permisos por rol (aprendiz, instructor, coordinador)
- **`useNotifications`**: Sistema de notificaciones institucionales
- **`useApi`**: Llamadas consistentes a tu API Django
- **`useSenaValidation`**: Validaciones específicas del SENA (emails institucionales, documentos, etc.)

**🚀 Resultado**: Código más limpio, reutilizable y fácil de mantener para tu sistema de AutoGestión SENA.

---

##### **`/src/img`** - Imágenes del Proyecto 🖼️
```
img/                 # Imágenes importadas en componentes
```

**📋 Propósito**: Imágenes que se importan directamente en componentes:
- **Logos**: Logo del SENA en diferentes formatos y tamaños
- **Iconos**: Iconos personalizados para la aplicación
- **Backgrounds**: Fondos institucionales
- **Ilustraciones**: Gráficos para páginas de error o estados vacíos
- **Avatares**: Imágenes por defecto para usuarios

**📱 Optimización**:
- Formatos WebP para mejor rendimiento
- Diferentes resoluciones para dispositivos
- Compresión optimizada

---

##### **`/src/pages`** - Páginas/Vistas Principales 📄
```
pages/
├── login.tsx                    # 🔐 Pantalla de inicio de sesión
├── Register.tsx                 # 📝 Registro de aprendices
├── RestorePassword.tsx          # 🔑 Recuperar contraseña
├── ValidationCodeSecurity.tsx   # 🔒 Código de verificación
├── UpdatePassword.tsx           # 🔄 Actualizar contraseña
└── NotFound.tsx                # ❌ Página 404
```

**📋 Propósito**: Cada página representa una ruta completa de la aplicación:

- **`login.tsx`**: Autenticación principal para acceder al sistema
- **`Register.tsx`**: Registro exclusivo para aprendices del SENA
- **`RestorePassword.tsx`**: Recuperación de contraseña vía email
- **`ValidationCodeSecurity.tsx`**: Verificación de código de seguridad
- **`UpdatePassword.tsx`**: Actualización de contraseña después de recuperación
- **`NotFound.tsx`**: Página de error 404 con navegación de regreso

**🔄 Flujo de autenticación**:
```
Login → Register (si no tiene cuenta)
Login → RestorePassword → ValidationCode → UpdatePassword (recuperación)
```

---

##### **`/src/Testing`** - Pruebas y Testing 🧪
```
Testing/
└── scripts/         # Scripts de testing y automatización
```

**📋 Propósito**: Entorno de testing completo:
- **Unit Tests**: Pruebas unitarias de componentes
- **Integration Tests**: Pruebas de integración con la API
- **E2E Tests**: Pruebas end-to-end del flujo completo
- **API Mocks**: Simulación de respuestas de la API para testing
- **Test Scripts**: Scripts automatizados para CI/CD

**🔧 Herramientas sugeridas**:
- Jest para pruebas unitarias
- React Testing Library para testing de componentes
- MSW (Mock Service Worker) para mocks de API
- Cypress para pruebas E2E

---

##### **`/src/types`** - Definiciones de TypeScript 📝
```
types/
└── index.ts         # Tipos globales de TypeScript
```

**📋 Propósito**: Definiciones de tipos basadas en la API Django:

```typescript
// 👤 Tipos de Usuario y Autenticación
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  document_type: 'CC' | 'TI' | 'CE' | 'PP';
  document_number: string;
  phone: string;
  is_active: boolean;
  role: Role;
}

// 🔐 Tipos de Seguridad
export interface SecurityForm {
  id: number;
  name: string;
  description: string;
  active: boolean;
  delete_at?: string;
}

export interface Role {
  id: number;
  type_role: string;
  description: string;
  active: boolean;
}

// 🌐 Tipos de API Response
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 📝 Tipos de Formularios
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  phone: string;
}
```

---

### 🗂️ **Archivos de Configuración**

#### **`package.json`** - Dependencias y Scripts 📦
**📋 Propósito**: Define todas las librerías necesarias para consumir la API Django:
- React Router DOM para navegación
- Axios para llamadas HTTP
- Tailwind CSS para estilos
- TypeScript para tipado
- Vite para build y desarrollo

#### **`vite.config.ts`** - Configuración de Vite ⚡
**📋 Propósito**: 
- Configurar proxy para la API Django durante desarrollo
- Optimizaciones de build
- Configuración de entorno
- Aliases de paths

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
});
```

#### **`tailwind.config.ts`** - Configuración de Tailwind 🎨
**📋 Propósito**: Personalización con colores institucionales del SENA:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        'sena-green': {
          500: '#39A935',
          600: '#2D8B2A',
          700: '#1F5F1D'
        }
      }
    }
  }
}
```

---

## 🔧 **Flujo de Trabajo para Consumir la API Django**

### 1. **🔧 Configuración Initial**
```bash
# Instalar dependencias
npm install react-router-dom axios

# Configurar variables de entorno
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env
```

### 2. **🌐 Setup de la API** (`/src/Api/config/ConfigApi.ts`)
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. **📡 Servicios de API** (`/src/Api/Services/api.ts`)
```typescript
// Servicios que consumen tu API Django exacta
export const securityService = {
  // Autenticación
  login: (credentials: LoginCredentials) => 
    api.post('/security/auth/login/', credentials),
  
  register: (userData: RegisterData) => 
    api.post('/security/auth/register/', userData),
  
  // Formularios (basado en tu API actual)
  getForms: () => api.get('/security/forms/'),
  
  createForm: (data: Partial<SecurityForm>) => 
    api.post('/security/forms/', data),
  
  updateForm: (id: number, data: Partial<SecurityForm>) => 
    api.put(`/security/forms/${id}/`, data),
  
  // Eliminaciones (usando tus endpoints personalizados)
  logicalDelete: (id: number) => 
    api.delete(`/security/forms/${id}/logical-delete/`),
  
  persistentialDelete: (id: number) => 
    api.delete(`/security/forms/${id}/persistential-delete/`)
};
```

### 4. **⚡ Custom Hooks** (`/src/hook/`)
```typescript
// Hook para manejar formularios de seguridad
export const useSecurityForms = () => {
  const [forms, setForms] = useState<SecurityForm[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadForms = async () => {
    setLoading(true);
    try {
      const response = await securityService.getForms();
      setForms(response.data);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteForm = async (id: number, type: 'logical' | 'persistential') => {
    try {
      if (type === 'logical') {
        await securityService.logicalDelete(id);
      } else {
        await securityService.persistentialDelete(id);
      }
      await loadForms(); // Recargar la lista
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };
  
  return { forms, loading, loadForms, deleteForm };
};
```

---

## 🚀 **Comandos de Desarrollo**

```bash
# Instalar dependencias
npm install

# Desarrollo (con proxy a Django)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## 🔗 **Integración con la API Django**

### **Endpoints Principales Consumidos:**
- `POST /api/security/auth/login/` - Autenticación
- `POST /api/security/auth/register/` - Registro de aprendices
- `GET /api/security/forms/` - Listar formularios
- `DELETE /api/security/forms/{id}/logical-delete/` - Eliminación lógica
- `DELETE /api/security/forms/{id}/persistential-delete/` - Eliminación persistencial

### **Estados de Formularios:**
- **Activo**: `active: true` - Formulario disponible
- **Eliminación Lógica**: `active: false` - Oculto pero recuperable
- **Eliminación Persistencial**: `active: false, delete_at: fecha` - Marcado para eliminación

---

## 🎯 **Características Implementadas**

✅ **Autenticación completa** (Login, Register, Password Recovery)  
✅ **Navegación con React Router**  
✅ **Consumo de API Django** con Axios  
✅ **TypeScript** para tipado seguro  
✅ **Responsive Design** con Tailwind CSS  
✅ **Estados de loading y error**  
✅ **Persistencia de sesión**  
✅ **Validaciones de formularios**  

---

## 👥 **Roles y Permisos**

El sistema está diseñado para diferentes tipos de usuarios del SENA:
- **Aprendices**: Acceso básico al sistema
- **Instructores**: Gestión de formularios y reportes
- **Coordinadores**: Administración de roles y permisos
- **Administradores**: Control total del sistema

---

## 📱 **Compatibilidad**

- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ PWA Ready (Progressive Web App)
- ✅ Optimizado para dispositivos del SENA

---

## 🔧 **Próximas Características**

- [ ] Dashboard principal
- [ ] Módulo de reportes
- [ ] Notificaciones en tiempo real
- [ ] Exportación de datos

---

**🏢 Desarrollado para el Centro de Industria, Empresa y Servicios (CIES) - SENA**