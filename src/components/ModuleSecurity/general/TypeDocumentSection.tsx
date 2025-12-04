import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from "../ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import { getDocumentTypes, createDocumentType, updateDocumentType, softDeleteDocumentType, filterDocumentTypes } from "../../../Api/Services/TypeDocument";
import FilterBar from "../../FilterBar";
// El método softDelete no existe, así que usaremos deleteDocumentType para deshabilitar

const cardsPerPage = 9;

/**
 * Props interface for TypeDocumentSection component
 * @interface TypeDocumentSectionProps
 */
interface TypeDocumentSectionProps {
	open: boolean;
	onToggle: () => void;
}

/**
 * TypeDocumentSection component: Manages document types with CRUD operations
 * Displays document types in a collapsible section with add/edit/disable functionality
 * Supports pagination for large lists of document types
 * @param {TypeDocumentSectionProps} props - Component props
 * @param {boolean} props.open - Whether the section is expanded
 * @param {() => void} props.onToggle - Function to toggle section visibility
 */
const TypeDocumentSection = ({ open, onToggle }: TypeDocumentSectionProps) => {
	// State for document types list and loading states
	const [typeDocuments, setTypeDocuments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [typeDocumentsPage, setTypeDocumentsPage] = useState(1);

	// Modal state management for add/edit/disable operations
	const [showModal, setShowModal] = useState(false);
	const [pendingData, setPendingData] = useState<any>(null);
	const [showConfirm, setShowConfirm] = useState(false);
	const [editData, setEditData] = useState<any>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [pendingEditData, setPendingEditData] = useState<any>(null);
	const [showEditConfirm, setShowEditConfirm] = useState(false);
	const [showDisableConfirm, setShowDisableConfirm] = useState(false);
	const [pendingDisable, setPendingDisable] = useState<any>(null);

	// Filter UI state
	const [displayedTypeDocuments, setDisplayedTypeDocuments] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [activeFilter, setActiveFilter] = useState('');
	const [filtering, setFiltering] = useState(false);
	// Removed internal open state

	/**
	 * Fetch type documents from server
	 */
	const refreshTypeDocuments = async () => {
			setLoading(true);
			try {
				const data = await getDocumentTypes();
				setTypeDocuments(data);
				setError(null);
			} catch (e: any) {
				setError(e.message || "Error al cargar tipos de documento");
			}
			setLoading(false);
		};

	React.useEffect(() => {
		// Initial data loading: fetch all document types
		refreshTypeDocuments();
	}, []);

	useEffect(() => {
		if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
			setDisplayedTypeDocuments(typeDocuments || []);
		}
	}, [typeDocuments, filtering]);

	const handleFilter = async (params?: { search?: string; active?: string }) => {
		const s = params && params.search !== undefined ? params.search : (search || undefined);
		const a = params && params.active !== undefined ? params.active : activeFilter;
		setSearch(s ?? '');
		setActiveFilter(a ?? '');
		setFiltering(true);
		try {
			if ((!s || s === '') && (!a || a === '')) {
				setDisplayedTypeDocuments(typeDocuments || []);
				return;
			}
			const data = await filterDocumentTypes({ search: s, active: a });
			setDisplayedTypeDocuments(data || []);
			setTypeDocumentsPage(1);
		} catch (e) {
			// ignore for now
		} finally {
			setTimeout(() => setFiltering(false), 180);
		}
	};

	/**
	 * InfoCard component: Displays individual document type information
	 * Shows document type name, acronym, and active status with edit/disable options
	 * @param {any} props - Component props
	 * @param {string} props.name - Document type name
	 * @param {string} props.acronyms - Document type acronym
	 * @param {boolean} props.isActive - Whether the document type is active
	 * @param {() => void} props.onEdit - Function to handle edit action
	 * @param {() => void} props.onToggle - Function to handle enable/disable toggle
	 */
	const InfoCard = ({ name, acronyms, isActive, onEdit, onToggle }: any) => (
		<div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900">{name}</h3>
					{acronyms && <p className="text-sm text-gray-600 mt-1">Acrónimo: {acronyms}</p>}
				</div>
				{/* Status indicator: shows active/inactive state with color coding */}
				<div className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{isActive ? "Activo" : "Inactivo"}</div>
			</div>
			<div className="flex gap-2">
				{/* Edit button: opens edit modal with current document type data */}
				<button onClick={onEdit} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
				{/* Toggle active status button: shows confirmation modal for enable/disable */}
				<button onClick={onToggle} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${isActive ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{isActive ? "Deshabilitar" : "Habilitar"}</button>
			</div>
		</div>
	);

	/**
	 * Opens the add document type modal
	 */
	const handleAdd = () => setShowModal(true);

	/**
	 * Handles add form submission: stores form data and shows confirmation modal
	 * @param {any} values - Form values from add modal
	 */
	const handleSubmit = (values: any) => {
		setPendingData(values);
		setShowConfirm(true);
	};

	/**
	 * Confirms and executes document type creation
	 */
	const handleConfirm = async () => {
			try {
				await createDocumentType(pendingData);
				setShowModal(false);
				setShowConfirm(false);
				setPendingData(null);
				await refreshTypeDocuments();

			setNotifType('success');
			setNotifTitle('Éxito');
			setNotifMessage('Tipo de documento creado correctamente.');
			setNotifOpen(true);
			} catch (e: any) {
			setNotifType('warning');
			setNotifTitle('Error');
			setNotifMessage(e.message || 'Error al crear tipo de documento');
			setNotifOpen(true);
			}
	};

	/**
	 * Opens edit modal with selected document type data
	 * @param {any} doc - Document type object to edit
	 */
	const handleEdit = (doc: any) => {
		setEditData(doc);
		setShowEditModal(true);
	};

	/**
	 * Handles edit form submission: stores form data and shows confirmation modal
	 * @param {any} values - Form values from edit modal
	 */
	const handleSubmitEdit = (values: any) => {
		setPendingEditData(values);
		setShowEditConfirm(true);
	};

	/**
	 * Confirms and executes document type update
	 */
	const handleConfirmEdit = async () => {
			try {
				await updateDocumentType(editData.id, pendingEditData);
				setShowEditModal(false);
				setShowEditConfirm(false);
				setPendingEditData(null);
				setEditData(null);
				await refreshTypeDocuments();

			setNotifType('success');
			setNotifTitle('Éxito');
			setNotifMessage('Tipo de documento actualizado correctamente.');
			setNotifOpen(true);
			} catch (e: any) {
			setNotifType('warning');
			setNotifTitle('Error');
			setNotifMessage(e.message || 'Error al actualizar tipo de documento');
			setNotifOpen(true);
			}
	};

	/**
	 * Shows confirmation modal for document type enable/disable action
	 * @param {any} doc - Document type object to toggle
	 */
	const handleToggle = (doc: any) => {
		setPendingDisable(doc);
		setShowDisableConfirm(true);
	};

	/**
	 * Confirms and executes document type disable/enable action
	 */
	const handleConfirmDisable = async () => {
					try {
						await softDeleteDocumentType(pendingDisable.id);
						setShowDisableConfirm(false);
						setPendingDisable(null);
						await refreshTypeDocuments();

				setNotifType('success');
				setNotifTitle('Éxito');
				setNotifMessage('Tipo de documento deshabilitado correctamente.');
				setNotifOpen(true);
					} catch (e: any) {
				setNotifType('warning');
				setNotifTitle('Error');
				setNotifMessage(e.message || 'Error al deshabilitar tipo de documento');
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
					<h3 className="text-lg font-semibold text-gray-900">Tipos de Documento</h3>
					<span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
						{displayedTypeDocuments.length} registros
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
					{/* Filter bar and Add document type button */}
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
								<Plus className="w-4 h-4" /> Agregar Tipo de Documento
							</button>
						</div>
					</div>
					{/* Document types cards grid: displays document types with pagination */}
					<div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
						{displayedTypeDocuments.length === 0 ? (
							<div className="col-span-3 text-center text-gray-600 py-8">
								{(search || activeFilter) ? 'No se encontraron tipos de documento con esta búsqueda' : 'No hay tipos de documento disponibles'}
							</div>
						) : (
							displayedTypeDocuments.slice((typeDocumentsPage - 1) * cardsPerPage, typeDocumentsPage * cardsPerPage).map((doc) => (
								<InfoCard
									key={doc.id}
									name={doc.name}
									acronyms={doc.acronyms}
									isActive={doc.active}
									onEdit={() => handleEdit(doc)}
									onToggle={() => handleToggle(doc)}
								/>
							))
						)}
						{/* Edit modal: form for updating existing document types */}
						<ModalFormGeneric
							isOpen={showEditModal}
							title="Editar Tipo de Documento"
							fields={[
								{ label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
								{ label: "Acrónimo", name: "acronyms", type: "text", placeholder: "Ingrese el acrónimo", required: true },
							]}
							onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }}
							onSubmit={handleSubmitEdit}
							submitText="Actualizar"
							cancelText="Cancelar"
							initialValues={editData || {}}
							customRender={undefined}
							onProgramChange={undefined}
						/>
						{/* Edit confirmation modal: confirms document type update action */}
						<ConfirmModal
							isOpen={showEditConfirm}
							title="¿Confirmar actualización?"
							message="¿Estás seguro de que deseas actualizar este tipo de documento?"
							confirmText="Sí, actualizar"
							cancelText="Cancelar"
							onConfirm={handleConfirmEdit}
							onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); }}
						/>
						{/* Disable confirmation modal: confirms enable/disable document type action */}
						<ConfirmModal
							isOpen={showDisableConfirm}
							title="¿Confirmar acción?"
							message="¿Estás seguro de que deseas deshabilitar este tipo de documento?"
							confirmText="Sí, continuar"
							cancelText="Cancelar"
							onConfirm={handleConfirmDisable}
							onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); }}
						/>
					</div>
					{/* Pagination component: shows page navigation when multiple pages exist */}
					{Math.ceil(typeDocuments.length / cardsPerPage) > 1 && (
						<Paginator
							page={typeDocumentsPage}
							totalPages={Math.ceil(typeDocuments.length / cardsPerPage)}
							onPageChange={setTypeDocumentsPage}
							className="mt-4 px-6"
						/>
					)}

					{/* Add modal: form for creating new document types */}
					<ModalFormGeneric
						isOpen={showModal}
						title="Agregar Tipo de Documento"
						fields={[
							{ label: "Nombre", name: "name", type: "text", placeholder: "Ingrese el nombre", required: true },
							{ label: "Acrónimo", name: "acronyms", type: "text", placeholder: "Ingrese el acrónimo", required: true },
						]}
						onClose={() => setShowModal(false)}
						onSubmit={handleSubmit}
						submitText="Registrar"
						cancelText="Cancelar"
						customRender={undefined}
						onProgramChange={undefined}
					/>
					{/* Add confirmation modal: confirms document type creation action */}
					<ConfirmModal
						isOpen={showConfirm}
						title="¿Confirmar registro?"
						message="¿Estás seguro de que deseas crear este tipo de documento?"
						confirmText="Sí, crear"
						cancelText="Cancelar"
						onConfirm={handleConfirm}
						onCancel={() => {
							setShowConfirm(false);
							setPendingData(null);
						}}
					/>
					{/* Notification modal: displays success/error messages */}
					<NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
				</>
			)}
		</div>
		
	);
};

export default TypeDocumentSection;
