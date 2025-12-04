import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import { getAllTypeOfQueries, createTypeOfQueries, updateTypeOfQueries, softDeleteTypeOfQueries, filterTypeOfQueries } from "../../../Api/Services/TypeOfQueries";
import FilterBar from "../../FilterBar";
import { TypeOfQueries } from "../../../Api/types/Modules/general.types";

const cardsPerPage = 9;

/**
 * Props interface for TypeOfQuerySection component
 * @interface TypeOfQuerySectionProps
 */
interface TypeOfQuerySectionProps {
	open: boolean;
	onToggle: () => void;
}

/**
 * TypeOfQuerySection component: Manages query types with CRUD operations
 * Displays query types in a collapsible section with add/edit/disable functionality
 * Supports pagination for large lists of query types
 * @param {TypeOfQuerySectionProps} props - Component props
 * @param {boolean} props.open - Whether the section is expanded
 * @param {() => void} props.onToggle - Function to toggle section visibility
 */
const TypeOfQuerySection = ({ open, onToggle }: TypeOfQuerySectionProps) => {
	// State for query types list and loading states
	 const [typeOfQueries, setTypeOfQueries] = useState<TypeOfQueries[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [typeOfQueriesPage, setTypeOfQueriesPage] = useState(1);

	// Modal state management for add/edit/disable operations
	const [showModal, setShowModal] = useState(false);
	 const [pendingData, setPendingData] = useState<TypeOfQueries | null>(null);
	const [showConfirm, setShowConfirm] = useState(false);
	 const [editData, setEditData] = useState<TypeOfQueries | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	 const [pendingEditData, setPendingEditData] = useState<TypeOfQueries | null>(null);
	const [showEditConfirm, setShowEditConfirm] = useState(false);
	const [showDisableConfirm, setShowDisableConfirm] = useState(false);
	 const [pendingDisable, setPendingDisable] = useState<TypeOfQueries | null>(null);

	// Filter UI state
	const [displayedTypeOfQueries, setDisplayedTypeOfQueries] = useState<TypeOfQueries[]>([]);
	const [search, setSearch] = useState('');
	const [activeFilter, setActiveFilter] = useState('');
	const [filtering, setFiltering] = useState(false);
	// Removed internal open state

	/**
	 * Fetch type of queries from server
	 */
	const refreshTypeOfQueries = async () => {
		setLoading(true);
		try {
			const data = await getAllTypeOfQueries();
			setTypeOfQueries(data);
			setError(null);
			} catch (e: unknown) {
				setError(e instanceof Error ? e.message : "Error al cargar tipos de preguntas");
		}
		setLoading(false);
	};

	React.useEffect(() => {
		// Initial data loading: fetch all query types
		refreshTypeOfQueries();
	}, []);

	useEffect(() => {
		if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
			setDisplayedTypeOfQueries(typeOfQueries || []);
		}
	}, [typeOfQueries, filtering]);

	const handleFilter = async (params?: { search?: string; active?: string }) => {
		const s = params && params.search !== undefined ? params.search : (search || undefined);
		const a = params && params.active !== undefined ? params.active : activeFilter;
		setSearch(s ?? '');
		setActiveFilter(a ?? '');
		setFiltering(true);
		try {
			if ((!s || s === '') && (!a || a === '')) {
				setDisplayedTypeOfQueries(typeOfQueries || []);
				return;
			}
			const data = await filterTypeOfQueries({ search: s, active: a });
			setDisplayedTypeOfQueries(data || []);
			setTypeOfQueriesPage(1);
		} catch (e) {
			// ignore
		} finally {
			setTimeout(() => setFiltering(false), 180);
		}
	};

	/**
	 * InfoCard component: Displays individual query type information
	 * Shows query type name, description, and active status with edit/disable options
	 * @param {any} props - Component props
	 * @param {string} props.name - Query type name
	 * @param {string} props.description - Query type description
	 * @param {boolean} props.isActive - Whether the query type is active
	 * @param {() => void} props.onEdit - Function to handle edit action
	 * @param {() => void} props.onToggle - Function to handle enable/disable toggle
	 */
	 const InfoCard = ({ query, onEdit, onToggle }: { query: TypeOfQueries; onEdit: () => void; onToggle: () => void }) => (
		 <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative">
			 <div className="flex justify-between items-start mb-3">
				 <div className="flex-1">
					 <h3 className="font-semibold text-gray-900">{query.name}</h3>
					 {query.description && (
						 <p className="text-sm text-gray-600 mt-1 break-words">{query.description}</p>
					 )}
				 </div>
				 {/* Status indicator: shows active/inactive state with color coding */}
				 <div className={`px-2 py-1 rounded-full text-xs font-medium ${query.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{query.active ? "Activo" : "Inactivo"}</div>
			 </div>
			 <div className="flex gap-2">
				 {/* Edit button: opens edit modal with current query type data */}
				 <button onClick={onEdit} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
				 {/* Toggle active status button: shows confirmation modal for enable/disable */}
				 <button onClick={onToggle} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${query.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{query.active ? "Deshabilitar" : "Habilitar"}</button>
			 </div>
		 </div>
	 );

	/**
	 * Opens the add query type modal
	 */
	const handleAdd = () => setShowModal(true);

	/**
	 * Handles add form submission: stores form data and shows confirmation modal
	 * @param {any} values - Form values from add modal
	 */
	 const handleSubmit = (values: TypeOfQueries) => {
		 setPendingData(values);
		 setShowConfirm(true);
	 };

	/**
	 * Confirms and executes query type creation
	 */
	const handleConfirm = async () => {
		try {
			await createTypeOfQueries(pendingData);
			setShowModal(false);
			setShowConfirm(false);
			setPendingData(null);
			await refreshTypeOfQueries();

			setNotifType('success');
			setNotifTitle('Éxito');
			setNotifMessage('Tipo de pregunta creado correctamente.');
			setNotifOpen(true);
			} catch (e: unknown) {
				setNotifType('warning');
				setNotifTitle('Error');
				setNotifMessage(e instanceof Error ? e.message : 'Error al crear tipo de pregunta');
				setNotifOpen(true);
		}
	};

	/**
	 * Opens edit modal with selected query type data
	 * @param {any} type - Query type object to edit
	 */
	 const handleEdit = (type: TypeOfQueries) => {
		 setEditData(type);
		 setShowEditModal(true);
	 };

	/**
	 * Handles edit form submission: stores form data and shows confirmation modal
	 * @param {any} values - Form values from edit modal
	 */
	 const handleSubmitEdit = (values: TypeOfQueries) => {
		 setPendingEditData(values);
		 setShowEditConfirm(true);
	 };

	/**
	 * Confirms and executes query type update
	 */
	const handleConfirmEdit = async () => {
		try {
			await updateTypeOfQueries(editData.id, pendingEditData);
			setShowEditModal(false);
			setShowEditConfirm(false);
			setPendingEditData(null);
			setEditData(null);
			await refreshTypeOfQueries();

			setNotifType('success');
			setNotifTitle('Éxito');
			setNotifMessage('Tipo de pregunta actualizado correctamente.');
			setNotifOpen(true);
			} catch (e: unknown) {
				setNotifType('warning');
				setNotifTitle('Error');
				setNotifMessage(e instanceof Error ? e.message : 'Error al actualizar tipo de pregunta');
				setNotifOpen(true);
		}
	};

	/**
	 * Shows confirmation modal for query type enable/disable action
	 * @param {any} type - Query type object to toggle
	 */
	 const handleToggle = (type: TypeOfQueries) => {
		 setPendingDisable(type);
		 setShowDisableConfirm(true);
	 };

	/**
	 * Confirms and executes query type disable/enable action
	 */
	const handleConfirmDisable = async () => {
		try {
			await softDeleteTypeOfQueries(pendingDisable.id);
			setShowDisableConfirm(false);
			setPendingDisable(null);
			await refreshTypeOfQueries();

			setNotifType('success');
			setNotifTitle('Éxito');
			setNotifMessage('Tipo de pregunta deshabilitado correctamente.');
			setNotifOpen(true);
			} catch (e: unknown) {
				setNotifType('warning');
				setNotifTitle('Error');
				setNotifMessage(e instanceof Error ? e.message : 'Error al deshabilitar tipo de pregunta');
				setNotifOpen(true);
		}
	};

	// Notification state management
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifType, setNotifType] = useState<'success'|'info'|'warning'|'password-changed'|'email-sent'|'pending'|'completed'>('success');
	const [notifTitle, setNotifTitle] = useState('');
	const [notifMessage, setNotifMessage] = useState('');

	if (loading) return <div className="p-8">Cargando...</div>;
	if (error) return <div className="p-8 text-red-500">{error}</div>;

	return (
		<div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
			{/* Collapsible section header: shows title, record count, and toggle chevron */}
			<button
				onClick={onToggle}
				className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
			>
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold text-gray-900">Tipos de Pregunta</h3>
					<span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
						{typeOfQueries.length} registros
					</span>
				</div>
				{open ? (
					<ChevronUp className="w-5 h-5 text-gray-500" />
				) : (
					<ChevronDown className="w-5 h-5 text-gray-500" />
				)}
			</button>
			{open && (
				<>
								{/* Filter bar and Add query type button */}
								<div className="flex flex-col gap-4 mb-6 px-6 pt-6">
									<div>
										<FilterBar
											onFilter={(params) => { setSearch(params.search ?? ''); setActiveFilter(params.active ?? ''); handleFilter(params); }}
											inputWidth="520px"
											searchPlaceholder="Buscar por nombre"
											selects={[{
												name: 'active',
												value: activeFilter,
												options: [
													{ value: 'true', label: 'Activos' },
													{ value: 'false', label: 'Inactivos' }
												],
												placeholder: 'Todos',
											}]}
										/>
									</div>
									<div className="flex items-center gap-4 justify-between">
										<button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg">
											<Plus className="w-4 h-4" /> Agregar Tipo de Pregunta
										</button>
									</div>
								</div>
					{/* Query types cards grid: displays query types with pagination */}
								<div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
									{displayedTypeOfQueries.length === 0 ? (
										<div className="col-span-3 text-center text-gray-600 py-8">{(search || activeFilter) ? 'No se encontraron tipos de pregunta con esta búsqueda' : 'No hay tipos de pregunta disponibles'}</div>
									) : (
										displayedTypeOfQueries.slice((typeOfQueriesPage - 1) * cardsPerPage, typeOfQueriesPage * cardsPerPage).map((type) => (
											<InfoCard
												key={type.id}
												query={type}
												onEdit={() => handleEdit(type)}
												onToggle={() => handleToggle(type)}
											/>
										))
									)}
						{/* Edit modal: form for updating existing query types */}
						<ModalFormGeneric
							isOpen={showEditModal}
							title="Editar Tipo de Pregunta"
							fields={[
								{ label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
								{ label: "Descripción", name: "description", type: "text", placeholder: "Ingrese la descripción", required: true, maxLength: 100 },
							]}
							onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }}
							onSubmit={handleSubmitEdit}
							submitText="Actualizar"
							cancelText="Cancelar"
							initialValues={editData || {}}
							customRender={undefined}
							onProgramChange={undefined}
						/>
						{/* Edit confirmation modal: confirms query type update action */}
						<ConfirmModal
							isOpen={showEditConfirm}
							title="¿Confirmar actualización?"
							message="¿Estás seguro de que deseas actualizar este tipo de pregunta?"
							confirmText="Sí, actualizar"
							cancelText="Cancelar"
							onConfirm={handleConfirmEdit}
							onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); }}
						/>
						{/* Disable confirmation modal: confirms enable/disable query type action */}
						<ConfirmModal
							isOpen={showDisableConfirm}
							title="¿Confirmar acción?"
							message="¿Estás seguro de que deseas deshabilitar este tipo de pregunta?"
							confirmText="Sí, continuar"
							cancelText="Cancelar"
							onConfirm={handleConfirmDisable}
							onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }}
						/>
					</div>
					{/* Pagination component: shows page navigation when multiple pages exist */}
					{Math.ceil(typeOfQueries.length / cardsPerPage) > 1 && (
						<Paginator
							page={typeOfQueriesPage}
							totalPages={Math.ceil(typeOfQueries.length / cardsPerPage)}
							onPageChange={setTypeOfQueriesPage}
							className="mt-4 px-6"
						/>
					)}

					{/* Add modal: form for creating new query types */}
					<ModalFormGeneric
						isOpen={showModal}
						title="Agregar Tipo de Pregunta"
						fields={[
							{ label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
							{ label: "Descripción", name: "description", type: "text", placeholder: "Ingrese la descripción", required: true, maxLength: 100 },
						]}
						onClose={() => setShowModal(false)}
						onSubmit={handleSubmit}
						submitText="Registrar"
						cancelText="Cancelar"
						customRender={undefined}
						onProgramChange={undefined}
					/>
					{/* Add confirmation modal: confirms query type creation action */}
					<ConfirmModal
						isOpen={showConfirm}
						title="¿Confirmar registro?"
						message="¿Estás seguro de que deseas registrar este tipo de pregunta?"
						confirmText="Sí, registrar"
						cancelText="Cancelar"
						onConfirm={handleConfirm}
						onCancel={() => { setShowConfirm(false); setPendingData(null); }}
					/>
					{/* Notification modal: displays success/error messages */}
					<NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
				</>
			)}
		</div>
	);
};

export default TypeOfQuerySection;
