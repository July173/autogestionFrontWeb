import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Paginator from "../../Paginator";
import ModalFormGeneric from ".././ModalFormGeneric";
import ConfirmModal from "../../ConfirmModal";
import NotificationModal from "../../NotificationModal";
import FilterBar from "../../FilterBar";
import { getAllSupportSchedules, createSupportSchedule, updateSupportSchedule, softDeleteSupportSchedule, filterSupportSchedules } from "../../../Api/Services/SupportSchedule";
import parseErrorMessage from '../../../utils/parseError';
import { SupportSchedule } from "../../../Api/types/entities/support.types";

const cardsPerPage = 9;

/**
 * Props interface for SupportScheduleSection component
 * @interface SupportScheduleSectionProps
 */
interface SupportScheduleSectionProps {
  open: boolean;
  onToggle: () => void;
}

/**
 * SupportScheduleSection component for managing support schedule information.
 * Provides comprehensive CRUD operations for support schedules including creation,
 * editing, enable/disable functionality, and schedule information display with
 * day ranges, hours, and notes.
 * Features collapsible section, pagination, confirmation modals, and notifications.
 *
 * @param {SupportScheduleSectionProps} props - Component props
 * @param {boolean} props.open - Whether the section is expanded
 * @param {() => void} props.onToggle - Function to toggle section visibility
 * @returns {JSX.Element} Rendered component
 */
const SupportScheduleSection = ({ open, onToggle }: SupportScheduleSectionProps) => {
  /**
   * Day options for schedule day selection dropdowns
   */
  const dayOptions = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miércoles', label: 'Miércoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' },
  ];

  // Main data states for schedules list
  type SupportScheduleForm = SupportSchedule & {
    active?: boolean;
    day_start?: string;
    day_end?: string;
  };
  const [schedules, setSchedules] = useState<SupportScheduleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modal states for adding new schedule
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingData, setPendingData] = useState<SupportScheduleForm | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [addConfirmError, setAddConfirmError] = useState<string | null>(null);

  // Modal states for editing existing schedule
  const [editData, setEditData] = useState<SupportScheduleForm | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<SupportScheduleForm | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editConfirmError, setEditConfirmError] = useState<string | null>(null);

  // Modal states for disable/enable confirmation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<SupportScheduleForm | null>(null);
  const [disableConfirmError, setDisableConfirmError] = useState<string | null>(null);

  // Notification modal states
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifType, setNotifType] = useState<'success' | 'info' | 'warning' | 'password-changed' | 'email-sent' | 'pending' | 'completed'>('success');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  /**
   * Refresh support schedules list from server
   */
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAllSupportSchedules();
      setSchedules(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar horarios");
    }
    setLoading(false);
  };

  // Filter UI state (server-side)
  const [displayedSchedules, setDisplayedSchedules] = useState<SupportScheduleForm[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filtering, setFiltering] = useState(false);

  React.useEffect(() => {
    // Initial data loading: fetch all support schedules
    (async () => {
      await refresh();
    })();
  }, []);

  React.useEffect(() => {
    if (!filtering && (!search || search === '') && (!activeFilter || activeFilter === '')) {
      setDisplayedSchedules(schedules || []);
    }
  }, [schedules, filtering, search, activeFilter]);

  const handleFilter = async (params?: { search?: string; active?: string }) => {
    const s = params && params.search !== undefined ? params.search : (search || undefined);
    const a = params && params.active !== undefined ? params.active : activeFilter;
    setSearch(s ?? '');
    setActiveFilter(a ?? '');
    setFiltering(true);
    try {
      if ((!s || s === '') && (!a || a === '')) {
        setDisplayedSchedules(schedules || []);
        setPage(1);
        return;
      }
      const data = await filterSupportSchedules({ search: s, active: a });
      setDisplayedSchedules(data || []);
      setPage(1);
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setFiltering(false), 180);
    }
  };

  /**
   * InfoCard component: Displays individual support schedule information
   * Shows schedule details in a card format with edit and disable options
   * @param {any} schedule - Support schedule object with day range, hours, notes, and active status
   */
  const InfoCard = ({ schedule }: { schedule: SupportScheduleForm }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 break-words">{schedule.day_range || `Horario ${schedule.id}`}</h3>
          <p className="text-sm text-gray-600 mt-1 break-all whitespace-normal max-w-full">{schedule.hours}</p>
          {schedule.notes && <p className="text-xs text-gray-500 mt-1 break-all whitespace-normal max-w-full max-h-20 overflow-hidden">{schedule.notes}</p>}
        </div>
        {/* Status indicator: shows active/inactive state with color coding */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.active ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {schedule.active ? "Activo" : "Inactivo"}
        </div>
      </div>
        <div className="flex gap-2">
        {/* Edit button: prepares edit data by splitting day_range into start/end components */}
        <button onClick={() => {
          // prepare initial edit values
          const prepared: SupportScheduleForm = { ...schedule };
          if (schedule.day_range && typeof schedule.day_range === 'string') {
            const parts = schedule.day_range.split(' - ').map((p: string) => p.trim());
            prepared.day_start = parts[0];
            prepared.day_end = parts[1] || '';
          }
          setEditData(prepared);
          setShowEditModal(true);
        }} className="px-5 py-1 text-base rounded-3xl border border-gray-400 bg-gray-100 text-gray-800 font-semibold transition-colors hover:bg-gray-200">Editar</button>
        {/* Toggle active status button: shows confirmation modal for enable/disable */}
  <button onClick={() => { setPendingDisable(schedule); setShowDisableConfirm(true); }} className={`px-5 py-1 text-base rounded-3xl border font-semibold transition-colors ${schedule.active ? "bg-red-100 text-red-900 border-red-700 hover:bg-red-200" : "bg-green-100 text-green-900 border-green-700 hover:bg-green-200"}`}>{schedule.active ? "Deshabilitar" : "Habilitar"}</button>
      </div>
    </div>
  );

  /**
   * Opens the add schedule modal
   */
  const handleAdd = () => setShowAddModal(true);

  /**
   * Handles add form submission: stores form data and shows confirmation modal
   * @param {any} values - Form values from add modal
   */
  const handleSubmitAdd = (values: SupportSchedule) => { setPendingData(values); setShowAddConfirm(true); };

  /**
   * Confirms and executes schedule creation
   * Transforms day_start/day_end into day_range format for API
   */
  const handleConfirmAdd = async () => {
    try {
      // map day_start/day_end -> day_range
      const pd = { ...(pendingData || {}) };
      if (pd.day_start) {
        pd.day_range = pd.day_start + (pd.day_end ? ` - ${pd.day_end}` : '');
        delete pd.day_start; delete pd.day_end;
      }
      await createSupportSchedule(pd);
      setShowAddModal(false);
      setShowAddConfirm(false);
      setPendingData(null);
      setAddConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Horario registrado correctamente.'); setNotifOpen(true);
    } catch (e: unknown) {
      const msg = parseErrorMessage(e);
      setAddConfirmError(msg || 'Error al crear horario');
      setShowAddConfirm(true);
    }
  };

  /**
   * Handles edit form submission: stores form data and shows confirmation modal
   * @param {any} values - Form values from edit modal
   */
  const handleSubmitEdit = (values: SupportSchedule) => { setPendingEditData(values); setShowEditConfirm(true); };

  /**
   * Confirms and executes schedule update
   * Merges form data with existing schedule data and transforms day range
   */
  const handleConfirmEdit = async () => {
    try {
      const pd = { ...(pendingEditData || {}) };
      if (pd.day_start) {
        pd.day_range = pd.day_start + (pd.day_end ? ` - ${pd.day_end}` : '');
        delete pd.day_start; delete pd.day_end;
      }
      // merge with existing
      const payload = { ...(editData || {}), ...(pd || {}) };
      await updateSupportSchedule(editData.id, payload);
      setShowEditModal(false);
      setShowEditConfirm(false);
      setPendingEditData(null);
      setEditData(null);
      setEditConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Horario actualizado correctamente.'); setNotifOpen(true);
    } catch (e: unknown) {
      const msg = parseErrorMessage(e);
      setEditConfirmError(msg || 'Error al actualizar horario');
      setShowEditConfirm(true);
    }
  };

  /**
   * Confirms and executes schedule disable/enable action
   * Uses soft-delete for active schedules, update for inactive ones
   */
  const handleConfirmDisable = async () => {
    try {
      // Use soft-delete to disable an active schedule. If the schedule is inactive (we're enabling),
      // perform an update sending the full object (merged) to satisfy backend expectations.
      if (!pendingDisable) throw new Error('No hay horario seleccionado');
      if (pendingDisable.active) {
        await softDeleteSupportSchedule(pendingDisable.id);
      } else {
        const payload = { ...(pendingDisable || {}), active: true };
        await softDeleteSupportSchedule(pendingDisable.id);
      }
      setShowDisableConfirm(false);
      setPendingDisable(null);
      setDisableConfirmError(null);
      await refresh();
      setNotifType('success'); setNotifTitle('Éxito'); setNotifMessage('Acción realizada correctamente.'); setNotifOpen(true);
    } catch (e: unknown) {
      const msg = parseErrorMessage(e);
      setDisableConfirmError(msg || 'Error al deshabilitar horario');
      setShowDisableConfirm(true);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
      {/* Collapsible section header: shows title, record count, and toggle chevron */}
      <button onClick={onToggle} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Horarios de Soporte</h3>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{displayedSchedules.length} registros</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {open && (
        <>
          {/* Filter + Add schedule button section */}
          <div className="flex flex-col gap-4 mb-6 px-6 pt-6">
            <div>
              <FilterBar
                onFilter={(params) => { setSearch(params.search ?? ''); setActiveFilter(params.active ?? ''); handleFilter(params); }}
                inputWidth="520px"
                searchPlaceholder="Buscar por día"
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
              <button onClick={handleAdd} className="flex items-center gap-2 text-white px-4 py-2 rounded font-semibold shadow transition-all duration-300 bg-[linear-gradient(to_bottom_right,_#43A047,_#2E7D32)] hover:bg-green-700 hover:shadow-lg"><Plus className="w-4 h-4" /> Agregar Horario</button>
            </div>
          </div>

          {/* Schedule cards grid: displays schedules with pagination */}
          <div className={`p-6 transition-opacity duration-300 ${filtering ? 'opacity-60' : 'opacity-100'}`}>
            {displayedSchedules.length === 0 ? (
              <div className="w-full text-center text-gray-500 py-12">
                {search || activeFilter ? 'No se encontraron horarios con esta búsqueda' : 'No hay horarios disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSchedules.slice((page - 1) * cardsPerPage, page * cardsPerPage).map((s) => (
                  <InfoCard key={s.id} schedule={s} />
                ))}
              </div>
            )}

            {/* Edit modal: form for updating existing schedules */}
            <ModalFormGeneric isOpen={showEditModal} title="Editar Horario" fields={[
              { label: "Día inicio", name: "day_start", type: "select", placeholder: "Selecciona día", required: true, customSelect: true, options: dayOptions },
              { label: "Día fin (opcional)", name: "day_end", type: "select", placeholder: "Selecciona día (opcional)", required: false, customSelect: true, options: dayOptions },
              { label: "Horario (horas)", name: "hours", type: "text", placeholder: "08:00-12:00", required: true },
              { label: "¿Cerrado?", name: "is_closed", type: "checkbox", placeholder: "", required: false },
              { label: "Notas", name: "notes", type: "text", placeholder: "Observaciones", required: true },
            ]} onClose={() => { setShowEditModal(false); setEditData(null); setPendingEditData(null); }} onSubmit={handleSubmitEdit} submitText="Actualizar" cancelText="Cancelar" initialValues={editData || {}} customRender={undefined} onProgramChange={undefined} />

            {/* Edit confirmation modal: confirms schedule update action */}
            <ConfirmModal
              isOpen={showEditConfirm}
              title="¿Confirmar actualización?"
              message="¿Estás seguro de que deseas actualizar este horario?"
              confirmText="Sí, actualizar"
              cancelText="Cancelar"
              onConfirm={handleConfirmEdit}
              onCancel={() => { setShowEditConfirm(false); setPendingEditData(null); setEditConfirmError(null); }}
              errorMessage={editConfirmError}
            />

            {/* Disable confirmation modal: confirms enable/disable schedule action */}
            <ConfirmModal
              isOpen={showDisableConfirm}
              title="¿Confirmar acción?"
              message="¿Estás seguro de que deseas deshabilitar este horario?"
              confirmText="Sí, continuar"
              cancelText="Cancelar"
              onConfirm={handleConfirmDisable}
              onCancel={() => { setShowDisableConfirm(false); setPendingDisable(null); setDisableConfirmError(null); }}
              errorMessage={disableConfirmError}
            />
          </div>

          {/* Pagination component: shows page navigation when multiple pages exist */}
          {Math.ceil(displayedSchedules.length / cardsPerPage) > 1 && (
            <Paginator page={page} totalPages={Math.ceil(displayedSchedules.length / cardsPerPage)} onPageChange={setPage} className="mt-4 px-6" />
          )}

            {/* Add modal: form for creating new schedules */}
            <ModalFormGeneric isOpen={showAddModal} title="Agregar Horario" fields={[
            { label: "Día inicio", name: "day_start", type: "select", placeholder: "Selecciona día", required: true, customSelect: true, options: dayOptions },
            { label: "Día fin (opcional)", name: "day_end", type: "select", placeholder: "Selecciona día (opcional)", required: false, customSelect: true, options: dayOptions },
            { label: "Horario (horas)", name: "hours", type: "text", placeholder: "08:00-12:00", required: true },
            { label: "¿Cerrado?", name: "is_closed", type: "checkbox", placeholder: "", required: false },
            { label: "Notas", name: "notes", type: "text", placeholder: "Observaciones", required: true },
          ]} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} submitText="Registrar" cancelText="Cancelar" customRender={undefined} onProgramChange={undefined} />

          {/* Add confirmation modal: confirms schedule creation action */}
          <ConfirmModal
            isOpen={showAddConfirm}
            title="¿Confirmar registro?"
            message="¿Estás seguro de que deseas registrar este horario?"
            confirmText="Sí, registrar"
            cancelText="Cancelar"
            onConfirm={handleConfirmAdd}
            onCancel={() => { setShowAddConfirm(false); setPendingData(null); setAddConfirmError(null); }}
            errorMessage={addConfirmError}
          />

          {/* Notification modal: displays success/error messages */}
          <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} type={notifType} title={notifTitle} message={notifMessage} />
        </>
      )}
    </div>
  );
};

export default SupportScheduleSection;
