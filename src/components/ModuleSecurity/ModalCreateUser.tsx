import React, { useState, useEffect } from 'react';
import { postApprentice } from '../../Api/Services/Apprentice';
import { postInstructor } from '../../Api/Services/Instructor';
import { getRegionales } from '../../Api/Services/Regional';
import { getSedes } from '../../Api/Services/Sede';
import { getCenters } from '../../Api/Services/Center';
import { getPrograms } from '../../Api/Services/Program';
import { getRoles } from '../../Api/Services/Rol';
import { getKnowledgeAreas } from '../../Api/Services/KnowledgeArea';
import ConfirmModal from '../ConfirmModal';
import { useDocumentTypes } from '../../hook/useDocumentTypes';
import { useContractTypes } from '../../hook/useContractTypes';
import LoadingOverlay from '../LoadingOverlay';
import ApprenticeForm from './ApprenticeForm';
import useApprenticeForm from '../../hook/useApprenticeForm';
import InstructorForm from './InstructorForm';
import useInstructorForm from '../../hook/useInstructorForm';
import type {
  Regional,
  Sede,
  Center,
  Program,
  KnowledgeArea,
} from '../../Api/types/Modules/general.types';
import type { Role } from '../../Api/types/entities/role.types';
import type { CreateApprentice } from '../../Api/types/entities/apprentice.types';
import type { CreateInstructor } from '../../Api/types/entities/instructor.types';
import CustomSelect from '../CustomSelect';

const ModalCreateUser = ({ onClose, onSuccess }: { onClose?: () => void; onSuccess?: () => void }) => {
  const [tab, setTab] = useState<'aprendiz' | 'instructor'>('aprendiz');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { documentTypes } = useDocumentTypes();
  const { contractTypes } = useContractTypes();
  const documentTypesOptions = documentTypes.filter(opt => opt.id !== '').map(opt => ({ value: String(opt.id), label: String(opt.name) }));
  const contractTypesOptions = contractTypes.filter(opt => opt.id !== '').map(opt => ({ value: String(opt.id), label: String(opt.name) }));

  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [centros, setCentros] = useState<Center[]>([]);
  const [programas, setProgramas] = useState<Program[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [areas, setAreas] = useState<KnowledgeArea[]>([]);

  const { apprentice, setApprentice, fichas: fichasFromHook, handleChange: handleAprChange, validate: validateApr, buildPayload } = useApprenticeForm();
  const { instructor, setInstructor, handleChange: handleInsChange, validate: validateIns } = useInstructorForm();

  const centrosFiltrados = centros.filter(c => c.regional === instructor.regional);
  const sedesFiltradas = sedes.filter(s => s.center === instructor.center);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<'aprendiz' | 'instructor' | null>(null);

  useEffect(() => {
    getRegionales().then(setRegionales).catch(() => setRegionales([]));
    getSedes().then(setSedes).catch(() => setSedes([]));
    getCenters().then(setCentros).catch(() => setCentros([]));
    getPrograms().then(setProgramas).catch(() => setProgramas([]));
    getRoles().then(setRoles).catch(() => setRoles([]));
    getKnowledgeAreas().then(setAreas).catch(() => setAreas([]));
  }, []);

  const getBackendErrorMsg = (err: unknown) => {
    // Narrow err to an object that may contain a response.data or message
    const anyErr = err as { response?: { data?: unknown }; message?: string } & Record<string, unknown>;
    const responseData = anyErr?.response?.data;
    if (responseData) {
      if (typeof responseData === 'string') return responseData;
      const rd = responseData as Record<string, unknown>;
  if ('detalle' in rd && rd['detalle']) return String(rd['detalle']);
  if ('error' in rd && rd['error']) return String(rd['error']);
  if ('message' in rd && rd['message']) return String(rd['message']);
      try {
        return Object.values(rd).join(' ');
      } catch {
        return JSON.stringify(rd);
      }
    }
    return anyErr?.message || 'Error al registrar usuario';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingSubmit(tab);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');

    try {
      if (pendingSubmit === 'aprendiz') {
        const errMsg = validateApr();
        if (errMsg) throw new Error(errMsg);
        const payload = buildPayload();
  // debug
  console.debug('Creating apprentice payload', payload);
        await postApprentice(payload as CreateApprentice);
      } else if (pendingSubmit === 'instructor') {
        const errMsg = validateIns();
        if (errMsg) throw new Error(errMsg);
        const nombres = instructor.first_name.trim().split(' ');
        const apellidos = instructor.first_last_name.trim().split(' ');
        const payload: CreateInstructor = {
          first_name: nombres[0] || '',
          second_name: nombres.slice(1).join(' '),
          first_last_name: apellidos[0] || '',
          second_last_name: apellidos.slice(1).join(' '),
          phone_number: instructor.phone_number,
          type_identification: instructor.type_identification,
          number_identification: instructor.number_identification,
          email: instructor.email,
          role: instructor.role,
          contract_type: instructor.contract_type,
          contract_start_date: instructor.contract_start_date,
          contract_end_date: instructor.contract_end_date,
          knowledge_area: instructor.knowledge_area,
          sede: instructor.sede,
          is_followup_instructor: instructor.is_followup_instructor,
        } as CreateInstructor;
        await postInstructor(payload);
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(getBackendErrorMsg(err));
    } finally {
      setLoading(false);
      setPendingSubmit(null);
    }
  };

  return (
    <>
      <LoadingOverlay isOpen={loading} message={loading ? 'Registrando...' : 'Cargando...'} />
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className={`bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative ${tab === 'instructor' ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        <h2 className="text-xl font-bold mb-4">Registrar Nuevo Usuario-Sena</h2>
        <div className="flex mb-4 bg-gray-300 rounded-lg overflow-hidden p-2">
          <button className={`flex-1 py-2 font-semibold ${tab === 'aprendiz' ? 'bg-white rounded-xl shadow text-black' : 'text-gray-500'}`} onClick={() => setTab('aprendiz')}>Aprendiz</button>
          <button className={`flex-1 py-2 font-semibold ${tab === 'instructor' ? 'bg-white  rounded-xl shadow text-black' : 'text-gray-500'}`} onClick={() => setTab('instructor')}>Otro usuario</button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'aprendiz' ? (
            <ApprenticeForm apprentice={apprentice} handleChange={handleAprChange} programas={programas} fichas={fichasFromHook} documentTypesOptions={documentTypesOptions} />
          ) : (
            <>
              <InstructorForm
                instructor={instructor}
                handleChange={handleInsChange}
                documentTypesOptions={documentTypesOptions}
                roles={roles}
                regiones={regionales.map(opt => ({ value: String(opt.id), label: String(opt.name) }))}
                centrosFiltrados={centrosFiltrados.map(opt => ({ value: String(opt.id), label: String(opt.name) }))}
                sedesFiltradas={sedesFiltradas.map(opt => ({ value: String(opt.id), label: String(opt.name) }))}
                areas={areas.filter(opt => opt.active).map(opt => ({ value: String(opt.id), label: String(opt.name) }))}
                contractTypesOptions={contractTypesOptions}
              />
              {/* Mostrar solo si el rol seleccionado es 'Instructor' */}
              {(() => {
                const selectedRoleObj = roles.find(opt => String(opt.id) === String(instructor.role));
                const isInstructorRole = selectedRoleObj && selectedRoleObj.type_role?.toLowerCase() === 'instructor';
                if (!isInstructorRole) return null;
                return (
                  <div className="mt-3">
                    <label className="block text-sm">¿Instructor de seguimiento? <span className="text-red-600">*</span></label>
                    <CustomSelect
                      value={instructor.is_followup_instructor ? "true" : "false"}
                      onChange={value => handleInsChange('is_followup_instructor', value === 'true')}
                      options={[{ value: "true", label: "Sí" }, { value: "false", label: "No" }]}
                      placeholder="Seleccionar ..."
                      classNames={{
                        trigger: "w-full border rounded-lg px-2 py-2 text-xs flex items-center justify-between bg-white",
                        label: "hidden",
                      }}
                    />
                  </div>
                );
              })()}
            </>
          )}

          {error && <div className="text-red-500 mt-2">{error}</div>}

          <div className="flex gap-4 mt-6">
            <button type="button" className="flex-1 bg-red-600 text-black py-2 rounded font-bold" onClick={onClose}>Cancelar</button>
            <button type="submit" className={`flex-1 ${tab === 'aprendiz' ? 'bg-green-600' : 'bg-green-700'} text-black py-2 rounded font-bold`} disabled={loading}>
              {loading ? 'Registrando...' : tab === 'aprendiz' ? 'Registrar aprendiz' : 'Registrar instructor'}
            </button>
          </div>
        </form>

        <ConfirmModal
          isOpen={showConfirm}
          title="¿Confirmar registro?"
          message={`¿Estás seguro de que deseas registrar este ${pendingSubmit === 'aprendiz' ? 'aprendiz' : 'instructor'}?`}
          confirmText="Sí, registrar"
          cancelText="Cancelar"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
        </div>
      </div>
      </>
    );
};

export default ModalCreateUser;
