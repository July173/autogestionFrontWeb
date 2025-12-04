# 📚 AutoGestión SENA - Frontend

## 🚀 Project Description

Frontend developed in **React + TypeScript + Vite + Tailwind CSS** for the Self-Management System of the Centro de Industria, Empresa y Servicios (CIES) at SENA. This project consumes a REST API built with Python/Django.

---

## 📁 Detailed Project Structure

### 🗂️ **Main Folders**

#### **`/public`** - Static Assets
```
public/
├── favicon.ico      # Browser tab icon
├── placeholder.svg  # Placeholder image for missing images
```
**📋 Purpose**: Files served directly without processing. Here you place:
- Institutional SENA logo
- Corporate images
- Static icons
- Metadata documents

---

#### **`/src`** - Main Source Code

##### **`/src/Api`** - API Configuration and Services 🌐
```
Api/
├── config/
│   └── ConfigApi.ts    # Base API configuration (URL, headers, interceptors)
└── Services/
		└── api.ts         # Specific services for each endpoint, can be split into multiple files for better organization
```

**📋 Purpose**:
- **`ConfigApi.ts`**: Configure connection to Django API
	- Base URL: `http://127.0.0.1:8000/api/`
	- Authentication headers
	- Error handling interceptors
	- Timeouts and retry logic

- **`api.ts`**: Functions to consume each endpoint:
	```typescript
	// Example services
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

##### **`/src/components`** - Reusable Components 🧩
```
components/
└── ui/               # Reusable UI components
```

**📋 Purpose**: Components used in multiple places:
- **Buttons**: SENA corporate styled buttons
- **Cards**: Information display cards
- **Modals**: Pop-up windows for confirmations
- **Forms**: Base form components
- **Headers/Footers**: Navigation components
- **Loading**: Spinners and loading states
- **Alerts**: Notifications and messages

**🎯 Use Cases**:
- Authentication forms
- API data tables
- Delete confirmations (logical/persistential)

---

##### **`/src/Css`** - Custom Styles 🎨
```
Css/
└── login.css        # Login-specific styles
```

**📋 Purpose**: Custom CSS complementing Tailwind CSS:
- **Animations**: SENA-specific transitions
- **Corporate styles**: Institutional colors not included in Tailwind
- **Component overrides**: Third-party library customization
- **Custom responsive**: App-specific breakpoints

**🎨 Examples**:
- Institutional gradients
- Custom loading animations
- Styles for complex forms

---

##### **`/src/hook`** - Custom Hooks ⚡
```
hook/                # Custom React hooks
```

**📋 Purpose**: Reusable logic encapsulated in hooks:

**🔐 Authentication**:
```typescript
// useAuth.ts - Authentication state management
export const useAuth = () => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
  
	const login = async (credentials) => { /* login logic */ };
	const logout = () => { /* logout logic */ };
  
	return { user, isAuthenticated, login, logout };
};
```

**🌐 API Calls**:
```typescript
// useApi.ts - API call hook
export const useApi = (endpoint, options) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
  
	return { data, loading, error, refetch };
};
```

**💾 Persistence**:
```typescript
// useLocalStorage.ts - localStorage management
export const useLocalStorage = (key, defaultValue) => {
	// Logic to persist data locally
};
```

## 🎣 **What are Hooks and Why Use Them?**

**Hooks** are special React functions that let you "hook into" state and lifecycle features from functional components. They are fundamental for building modern, efficient apps.

### 🔧 **Basic React Hooks**

#### **`useState`** - State Management
```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
```

#### **`useEffect`** - Side Effects
```typescript
useEffect(() => {
	// Runs when the component mounts
	fetchUserData();
}, []); // Empty array = only on mount

useEffect(() => {
	// Runs when 'user' changes
	console.log('User changed:', user);
}, [user]); // Runs when 'user' changes
```

### 🚀 **Custom Hooks for AutoGestión SENA**

#### **1. `useAuth` - Authentication Management**
```typescript
// /src/hook/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	// Check for saved token on load
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

**📱 Usage in Login.tsx:**
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
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>
	);
};
```

#### **2. `useApi` - Django API Calls**
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
			setError(err.message || 'Unknown error');
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

**📱 Usage to load security forms:**
```typescript
const FormsList = () => {
	const { data: forms, loading, error, refetch } = useApi(
		() => securityService.getForms(),
		[] // Only runs on mount
	);

	if (loading) return <div>Loading forms...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			<button onClick={refetch}>Refresh</button>
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

#### **3. `useSecurityForms` - SENA Forms Management**
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
			await loadForms(); // Reload list
		} catch (error) {
			console.error('Error deleting form:', error);
		}
	};

	const createForm = async (formData: Partial<SecurityForm>) => {
		try {
			await securityService.createForm(formData);
			await loadForms(); // Reload list
		} catch (error) {
			console.error('Error creating form:', error);
		}
	};

	return { forms, loading, loadForms, deleteForm, createForm };
};
```

#### **4. `useForm` - Reactive Form Handling**
```typescript
// /src/hook/useForm.ts
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

	const handleChange = (name: keyof T, value: any) => {
		setValues(prev => ({ ...prev, [name]: value }));
		// Clear error on input
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

**📱 Usage in Register.tsx:**
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
			email: (value) => !value.includes('@.sena.edu.co') 
				? 'Must be a SENA institutional email' : undefined,
			firstName: (value) => !value ? 'First name is required' : undefined,
			documentNumber: (value) => value.length < 8 
				? 'Document must have at least 8 digits' : undefined,
		});

		if (isValid) {
			// Proceed with registration
			registerUser(values);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				value={values.email}
				onChange={(e) => handleChange('email', e.target.value)}
				placeholder="example@soy.sena.edu.co"
			/>
			{errors.email && <span className="text-red-500">{errors.email}</span>}
			{/* More fields... */}
		</form>
	);
};
```

### 🎯 **Advantages of Custom Hooks**

#### ✅ **Logic Reuse**
```typescript
// Use the same hook in multiple components
const Login = () => {
	const { login } = useAuth(); // ✅
};

const Header = () => {
	const { user, logout } = useAuth(); // ✅ Shared state
};

const Dashboard = () => {
	const { isAuthenticated } = useAuth(); // ✅ Synced state
};
```

#### ✅ **Separation of Concerns**
- **Component**: Focuses only on rendering UI
- **Hook**: Handles all business logic and state

#### ✅ **Easier Testing**
```typescript
// You can test hook logic separately
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

test('should login user correctly', async () => {
	const { result } = renderHook(() => useAuth());
	// Test authentication logic...
});
```

#### ✅ **Cleaner, More Maintainable Code**
```typescript
// ❌ Without hooks (complex and repetitive)
const Login = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
  
	useEffect(() => {
		// 20 lines of authentication logic...
	}, []);
  
	const login = async () => {
		// 30 more lines of logic...
	};
  
	// 50+ lines of logic + JSX
};

// ✅ With hooks (clean and focused)
const Login = () => {
	const { user, loading, error, login } = useAuth();
  
	// Only 10-15 lines of JSX, logic is in the hook
	return <LoginForm onSubmit={login} loading={loading} />;
};
```

### 🏢 **SENA-Specific Hooks**

For your AutoGestión SENA project, hooks will allow you to:

- **`useAuth`**: Manage authentication for students/instructors
- **`useSecurityForms`**: Manage security forms
- **`usePermissions`**: Handle role-based permissions (student, instructor, coordinator)
- **`useNotifications`**: Institutional notification system
- **`useApi`**: Consistent calls to your Django API
- **`useSenaValidation`**: SENA-specific validations (institutional emails, documents, etc.)

**🚀 Result**: Cleaner, reusable, and easier-to-maintain code for your AutoGestión SENA system.

---

##### **`/src/img`** - Project Images 🖼️
```
img/                 # Images imported in components
```

**📋 Purpose**: Images imported directly in components:
- **Logos**: SENA logo in different formats and sizes
- **Icons**: Custom icons for the app
- **Backgrounds**: Institutional backgrounds
- **Illustrations**: Graphics for error pages or empty states
- **Avatars**: Default user images

**📱 Optimization**:
- WebP formats for better performance
- Different resolutions for devices
- Optimized compression

---

##### **`/src/pages`** - Main Pages/Views 📄
```
pages/
├── login.tsx                    # 🔐 Login screen
├── Register.tsx                 # 📝 Student registration
├── RestorePassword.tsx          # 🔑 Password recovery
├── ValidationCodeSecurity.tsx   # 🔒 Verification code
├── UpdatePassword.tsx           # 🔄 Password update
└── NotFound.tsx                # ❌ 404 page
```

**📋 Purpose**: Each page represents a full app route:

- **`login.tsx`**: Main authentication to access the system
- **`Register.tsx`**: Registration exclusive for SENA students
- **`RestorePassword.tsx`**: Password recovery via email
- **`ValidationCodeSecurity.tsx`**: Security code verification
- **`UpdatePassword.tsx`**: Password update after recovery
- **`NotFound.tsx`**: 404 error page with navigation back

**🔄 Authentication flow**:
```
Login → Register (if no account)
Login → RestorePassword → ValidationCode → UpdatePassword (recovery)
```

---

##### **`/src/Testing`** - Testing 🧪
```
Testing/
└── scripts/         # Testing and automation scripts
```

**📋 Purpose**: Complete testing environment:
- **Unit Tests**: Component unit tests
- **Integration Tests**: API integration tests
- **E2E Tests**: End-to-end tests for full flow
- **API Mocks**: Simulated API responses for testing
- **Test Scripts**: Automated scripts for CI/CD

**🔧 Suggested tools**:
- Jest for unit tests
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocks
- Cypress for E2E tests

---

##### **`/src/types`** - TypeScript Definitions 📝
```
types/
└── index.ts         # Global TypeScript types
```

**📋 Purpose**: Type definitions based on Django API:

```typescript
// 👤 User and Authentication Types
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

// 🔐 Security Types
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

// 🌐 API Response Types
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

// 📝 Form Types
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

### 🗂️ **Configuration Files**

#### **`package.json`** - Dependencies and Scripts 📦
**📋 Purpose**: Defines all libraries needed to consume the Django API:
- React Router DOM for navigation
- Axios for HTTP calls
- Tailwind CSS for styles
- TypeScript for typing
- Vite for build and development

#### **`vite.config.ts`** - Vite Configuration ⚡
**📋 Purpose**: 
- Configure proxy for Django API during development
- Build optimizations
- Environment configuration
- Path aliases

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

#### **`tailwind.config.ts`** - Tailwind Configuration 🎨
**📋 Purpose**: Customization with SENA institutional colors:
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

## 🔧 **Workflow to Consume Django API**

### 1. **🔧 Initial Setup**
```bash
# Install dependencies
npm install react-router-dom axios

# Set environment variables
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env
```

### 2. **🌐 API Setup** (`/src/Api/config/ConfigApi.ts`)
```typescript
import axios from 'axios';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	}
});

// Interceptor to add authentication token
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('auth_token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
```

### 3. **📡 API Services** (`/src/Api/Services/api.ts`)
```typescript
// Services consuming your exact Django API
export const securityService = {
	// Authentication
	login: (credentials: LoginCredentials) => 
		api.post('/security/auth/login/', credentials),
  
	register: (userData: RegisterData) => 
		api.post('/security/auth/register/', userData),
  
	// Forms (based on your current API)
	getForms: () => api.get('/security/forms/'),
  
	createForm: (data: Partial<SecurityForm>) => 
		api.post('/security/forms/', data),
  
	updateForm: (id: number, data: Partial<SecurityForm>) => 
		api.put(`/security/forms/${id}/`, data),
  
	// Deletions (using your custom endpoints)
	logicalDelete: (id: number) => 
		api.delete(`/security/forms/${id}/logical-delete/`),
  
	persistentialDelete: (id: number) => 
		api.delete(`/security/forms/${id}/persistential-delete/`)
};
```

### 4. **⚡ Custom Hooks** (`/src/hook/`)
```typescript
// Hook to manage security forms
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
			await loadForms(); // Reload list
		} catch (error) {
			console.error('Error deleting form:', error);
		}
	};
  
	return { forms, loading, loadForms, deleteForm };
};
```

---

## 🚀 **Development Commands**

```bash
# Install dependencies
npm install

# Development (with proxy to Django)
npm run dev

# Production build
npm run build

# Build preview
npm run preview

# Linting
npm run lint
```

---

## 🔗 **Integration with Django API**

### **Main Endpoints Consumed:**
- `POST /api/security/auth/login/` - Authentication
- `POST /api/security/auth/register/` - Student registration
- `GET /api/security/forms/` - List forms
- `DELETE /api/security/forms/{id}/logical-delete/` - Logical deletion
- `DELETE /api/security/forms/{id}/persistential-delete/` - Persistential deletion

### **Form States:**
- **Active**: `active: true` - Form available
- **Logical Deletion**: `active: false` - Hidden but recoverable
- **Persistential Deletion**: `active: false, delete_at: date` - Marked for deletion

---

## 🎯 **Implemented Features**

✅ **Full authentication** (Login, Register, Password Recovery)  
✅ **Navigation with React Router**  
✅ **Django API consumption** with Axios  
✅ **TypeScript** for safe typing  
✅ **Responsive Design** with Tailwind CSS  
✅ **Loading and error states**  
✅ **Session persistence**  
✅ **Form validations**  

---

## 👥 **Roles and Permissions**

The system is designed for different SENA user types:
- **Students**: Basic system access
- **Instructors**: Form and report management
- **Coordinators**: Role and permission administration
- **Administrators**: Full system control

---

## 📱 **Compatibility**

- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ PWA Ready (Progressive Web App)
- ✅ Optimized for SENA devices

---

## 🔧 **Upcoming Features**

- [ ] Main dashboard
- [ ] Reports module
- [ ] Real-time notifications
- [ ] Data export

---

**🏢 Developed for Centro de Industria, Empresa y Servicios (CIES) - SENA**
