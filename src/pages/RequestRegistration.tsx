import ApprenticeSection from '../components/RequestForm/ApprenticeSection';
import CustomSelect from '../components/CustomSelect';
import EmpresaSection from '../components/RequestForm/EnterpriseSection';
import JefeSection from '../components/RequestForm/BossSection';
import TalentoHumanoSection from '../components/RequestForm/HumanTalentSection';
import PdfUploadSection from '../components/RequestForm/PdfUploadSection';
import { 
  JournalText,          
  Person,
  Buildings,
  FileEarmarkPdf,
  BoxArrowUp,
  Send
} from 'react-bootstrap-icons';
import { useApprenticeData } from '../hook/useApprenticeData';
import { useRequestAssignation } from '../hook/useRequestAssignation';
import { useFormValidations } from '../hook/useFormValidations';
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { getDocumentTypesWithEmpty } from '../Api/Services/TypeDocument';
import { getAllEnterprises } from '../Api/Services/Enterprise';
import { getAllBosses, filterBosses } from '../Api/Services/Boss';
import { getAllHumanTalents, filterHumanTalents } from '../Api/Services/HumanTalent';
import { requestAsignation } from '../Api/types/Modules/assign.types';
import { postRequestAssignation } from '../Api/Services/RequestAssignaton';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import TermsModal from '../components/Login/TermsModal';
import LoadingOverlay from '../components/LoadingOverlay';

// Colors used
const COLORS = {
  green: "#0C672D",
  green2: "#2D7430",
  green3: "#7BCC7C",
  green4: "#E7FFE8",
  white: "#FFFFFF",
  grey: "#686868",
  black: "#000000",
  error: "#DC395F",
};

export default function RequestRegistration() {
  const { validatePhone, validateEndDate } = useFormValidations();
  const [phoneError, setPhoneError] = useState('');
  const [humanTalentPhoneError, setHumanTalentPhoneError] = useState('');
  const [dateError, setDateError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { person, userData, apprenticeId, loading: userLoading, error: userError } = useApprenticeData();
  const {
    loading,
    error,
    formData,
    regionales,
    centrosFiltrados,
    sedesFiltradas,
    programas,
    fichas,
    modalidades, // Add modalities
    selectedRegional,
    selectedCenter,
    selectedProgram,
    updateFormData,
    updateSelectedRegional,
    updateSelectedCenter,
    updateSelectedProgram,
    submitRequest,
    uploadPdf,
    clearError
  } = useRequestAssignation();

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'success' | 'password-changed' | 'email-sent' | 'pending' | 'completed';
    title: string;
    message: string;
    key?: number;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    key: 0
  });

  const [showConfirm, setShowConfirm] = useState(false);
  // Modes and selections for create vs select flows
  const [enterpriseMode, setEnterpriseMode] = useState<'select' | 'create'>('create');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<number | null>(null);

  const [bossMode, setBossMode] = useState<'select' | 'create'>('create');
  const [selectedBossId, setSelectedBossId] = useState<number | null>(null);

  const [humanTalentMode, setHumanTalentMode] = useState<'select' | 'create'>('create');
  const [selectedHumanTalentId, setSelectedHumanTalentId] = useState<number | null>(null);

  // Options populated from API
  const [enterpriseOptions, setEnterpriseOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [bossOptions, setBossOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [humanTalentOptions, setHumanTalentOptions] = useState<Array<{ value: string; label: string }>>([]);
  // Maps to keep full records (used to prefill form when selecting existing entities)
  const [enterpriseMap, setEnterpriseMap] = useState<Record<string, any>>({});
  const [bossMap, setBossMap] = useState<Record<string, any>>({});
  const [humanTalentMap, setHumanTalentMap] = useState<Record<string, any>>({});
  // Loading states for selects
  const [loadingEnterprises, setLoadingEnterprises] = useState(false);
  const [loadingBosses, setLoadingBosses] = useState(false);
  const [loadingHumanTalents, setLoadingHumanTalents] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [redirectAfterSuccess, setRedirectAfterSuccess] = useState(false);
  const navigate = useNavigate();

  // Calculate allowed range for end date (after declaring formData)
  let minEndDate = '';
  let maxEndDate = '';
  if (formData.date_start_contract) {
    const startDate = new Date(formData.date_start_contract);
    const endMonthDate = new Date(startDate);
    endMonthDate.setMonth(endMonthDate.getMonth() + 6);
    // First day of the month
    minEndDate = new Date(endMonthDate.getFullYear(), endMonthDate.getMonth(), 1).toISOString().split('T')[0];
    // Last day of the month
    maxEndDate = new Date(endMonthDate.getFullYear(), endMonthDate.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Archivo inválido',
          message: 'Solo se permiten archivos PDF.'
        });
        return;
      }
      const maxSizeInBytes = 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Archivo demasiado grande',
          message: 'El archivo no puede ser mayor a 1MB.'
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('pdf-upload').click();
  };

  // State for dynamic document types
  const [documentTypes, setDocumentTypes] = useState<{ id: number | ""; name: string }[]>([]);
  useEffect(() => {
    getDocumentTypesWithEmpty().then(setDocumentTypes);
  }, []);

  // Helper mapper for API entities -> select option
  const mapToOption = (it: Record<string, unknown>) => {
    const rec = it || {} as Record<string, unknown>;
    const possibleId = rec['id'] ?? rec['pk'] ?? rec['enterprise_id'] ?? rec['id_enterprise'] ?? '';
    const label = (
      rec['name_boss'] || rec['name'] || rec['nombre'] || rec['name_enterprise'] || rec['empresa_nombre'] || rec['nombre_jefe'] ||
      ((rec['first_name'] || rec['name']) ? `${rec['first_name'] ?? rec['name']}${rec['first_last_name'] ? ' ' + rec['first_last_name'] : ''}` : undefined)
    ) ?? possibleId;
    const labelStr = typeof label === 'string' ? label : String(label ?? possibleId ?? '');
    const value = possibleId ? String(possibleId) : `__noid_${encodeURIComponent(labelStr).slice(0,20)}`;
    return { value, label: labelStr };
  };

  // Load enterprises on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingEnterprises(true);
      try {
        const data = await getAllEnterprises();
        if (!mounted) return;
        setEnterpriseOptions((data || []).map(mapToOption));
        // store raw records by id to prefill fields when the user selects an existing enterprise
        const map = Object.fromEntries((data || []).map((it: Record<string, unknown>) => {
          const id = String(it['id'] ?? it['pk'] ?? it['enterprise_id'] ?? it['id_enterprise'] ?? '');
          return [id, it];
        }));
        if (mounted) setEnterpriseMap(map);
      } catch (err) {
        console.error('Error loading enterprises:', err);
        setEnterpriseOptions([]);
        if (mounted) setEnterpriseMap({});
      } finally {
        if (mounted) setLoadingEnterprises(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // When selecting an enterprise, load bosses and human talents filtered by enterprise
  useEffect(() => {
    let mounted = true;
    const loadContacts = async () => {
      if (enterpriseMode === 'select' && selectedEnterpriseId) {
        setLoadingBosses(true);
        setLoadingHumanTalents(true);
        try {
          // backend expects `enterprise_id` as the query parameter for the by-enterprise endpoints
          const bosses = await filterBosses({ enterprise_id: String(selectedEnterpriseId) });
          if (mounted) {
            setBossOptions((bosses || []).map(mapToOption));
            const bmap = Object.fromEntries((bosses || []).map((it: Record<string, unknown>) => [String(it['id'] ?? it['pk'] ?? it['id_boss'] ?? ''), it]));
            setBossMap(bmap);
          }
        } catch (err) {
          console.error('Error loading bosses for enterprise:', err);
          if (mounted) {
            setBossOptions([]);
            setBossMap({});
          }
        } finally {
          if (mounted) setLoadingBosses(false);
        }

        try {
          const hts = await filterHumanTalents({ enterprise_id: String(selectedEnterpriseId) });
          if (mounted) {
            setHumanTalentOptions((hts || []).map(mapToOption));
            const hmap = Object.fromEntries((hts || []).map((it: Record<string, unknown>) => [String(it['id'] ?? it['pk'] ?? it['id_human_talent'] ?? ''), it]));
            setHumanTalentMap(hmap);
          }
        } catch (err) {
          console.error('Error loading human talents for enterprise:', err);
          if (mounted) {
            setHumanTalentOptions([]);
            setHumanTalentMap({});
          }
        } finally {
          if (mounted) setLoadingHumanTalents(false);
        }
      } else {
        // Clear dependent selects when not selecting an enterprise
        setBossOptions([]);
        setHumanTalentOptions([]);
        setLoadingBosses(false);
        setLoadingHumanTalents(false);
        setBossMap({});
        setHumanTalentMap({});
      }
    };
    loadContacts();
    return () => { mounted = false; };
  }, [enterpriseMode, selectedEnterpriseId]);

  // When the user selects an existing enterprise, prefill the enterprise fields and lock inputs (UI already disables when mode==='select')
  useEffect(() => {
    if (enterpriseMode === 'select' && selectedEnterpriseId) {
      const rec = enterpriseMap[String(selectedEnterpriseId)];
      if (rec) {
        const name = (rec['name_enterprise'] || rec['name'] || rec['empresa_nombre'] || '') as any;
        const nit = (rec['nit_enterprise'] ?? rec['empresa_nit'] ?? rec['enterprise_nit'] ?? 0) as any;
        const locate = (rec['locate'] || rec['empresa_ubicacion'] || rec['enterprise_location'] || '') as any;
        const email = (rec['email_enterprise'] || rec['empresa_correo'] || rec['enterprise_email'] || '') as any;
        // only update if differs to avoid triggering re-renders in a loop
        if (formData.enterprise_name !== name) updateFormData('enterprise_name', name);
        if (String(formData.enterprise_nit) !== String(nit)) updateFormData('enterprise_nit', nit);
        if (formData.enterprise_location !== locate) updateFormData('enterprise_location', locate);
        if (formData.enterprise_email !== email) updateFormData('enterprise_email', email);
      }
    } else if (enterpriseMode === 'create') {
      if (formData.enterprise_name) updateFormData('enterprise_name', '' as any);
      if (formData.enterprise_nit) updateFormData('enterprise_nit', 0 as any);
      if (formData.enterprise_location) updateFormData('enterprise_location', '' as any);
      if (formData.enterprise_email) updateFormData('enterprise_email', '' as any);
    }
  // Intentionally exclude updateFormData and formData from deps to avoid effect firing on every update; effect depends on selection/mode/map
  }, [enterpriseMode, selectedEnterpriseId, enterpriseMap]);

  // When the user selects an existing boss, prefill boss fields
  useEffect(() => {
    if (bossMode === 'select' && selectedBossId) {
      const rec = bossMap[String(selectedBossId)];
      if (rec) {
        const name = (rec['name_boss'] || rec['name'] || rec['first_name'] || '') as any;
        const email = (rec['email'] || rec['email_boss'] || rec['boss_email'] || '') as any;
        const phone = (rec['phone'] ?? rec['phone_number'] ?? '') as any;
        const pos = (rec['position'] || rec['cargo'] || '') as any;
        if (formData.boss_name !== name) updateFormData('boss_name', name);
        if (formData.boss_email !== email) updateFormData('boss_email', email);
        if (String(formData.boss_phone) !== String(phone)) updateFormData('boss_phone', phone);
        if (formData.boss_position !== pos) updateFormData('boss_position', pos);
      }
    } else if (bossMode === 'create') {
      if (formData.boss_name) updateFormData('boss_name', '' as any);
      if (formData.boss_email) updateFormData('boss_email', '' as any);
      if (formData.boss_phone) updateFormData('boss_phone', '' as any);
      if (formData.boss_position) updateFormData('boss_position', '' as any);
    }
  }, [bossMode, selectedBossId, bossMap]);

  // When the user selects an existing human talent, prefill human talent fields
  useEffect(() => {
    if (humanTalentMode === 'select' && selectedHumanTalentId) {
      const rec = humanTalentMap[String(selectedHumanTalentId)];
      if (rec) {
        const name = (rec['name'] || rec['name_human_talent'] || rec['first_name'] || '') as any;
        const email = (rec['email'] || rec['email_human_talent'] || '') as any;
        const phone = (rec['phone'] ?? rec['phone_number'] ?? '') as any;
        if (formData.human_talent_name !== name) updateFormData('human_talent_name', name);
        if (formData.human_talent_email !== email) updateFormData('human_talent_email', email);
        if (String(formData.human_talent_phone) !== String(phone)) updateFormData('human_talent_phone', phone);
      }
    } else if (humanTalentMode === 'create') {
      if (formData.human_talent_name) updateFormData('human_talent_name', '' as any);
      if (formData.human_talent_email) updateFormData('human_talent_email', '' as any);
      if (formData.human_talent_phone) updateFormData('human_talent_phone', '' as any);
    }
  }, [humanTalentMode, selectedHumanTalentId, humanTalentMap]);

  // Function to get the document type name using dynamic data
  const getDocumentTypeName = (typeValue: string | number) => {
    const documentType = documentTypes.find(type => String(type.id) === String(typeValue));
    return documentType ? documentType.name : 'No especificado';
  };

  // Real-time validation for phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    updateFormData('boss_phone', value);
    setPhoneError(validatePhone(value));
  };

  const handleHumanTalentPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    updateFormData('human_talent_phone', value);
    setHumanTalentPhoneError(validatePhone(value));
  };

  // Real-time validation for dates
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startValue = new Date(e.target.value).getTime();
    updateFormData('date_start_contract', startValue);
    
    // Clear previous error
    setDateError('');
    
    // If end date already exists, validate
    if (formData.date_end_contract) {
      setDateError(validateEndDate(startValue, formData.date_end_contract));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endValue = new Date(e.target.value).getTime();
    updateFormData('date_end_contract', endValue);
    
    // Validate immediately with start date
    if (formData.date_start_contract) {
      setDateError(validateEndDate(formData.date_start_contract, endValue));
    } else {
      setDateError('Debe seleccionar primero la fecha de inicio');
    }
  };

  // New handle for form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // Real sending logic, only if user confirms
  const handleConfirmSend = async () => {
    setShowConfirm(false);
    clearError();
    // Helper to show notification after confirm closes
    const showNotification = (notif: typeof notification) => {
      setTimeout(() => setNotification({ ...notif, key: Date.now() }), 200); // force remount with unique key
    };
    if (!person) {
      showNotification({
        isOpen: true,
        type: 'warning',
        title: 'Datos de aprendiz no encontrados',
        message: 'No se encontraron los datos del aprendiz. Por favor, verifica tu sesión o comunícate con soporte.'
      });
      return;
    }
    if (!selectedFile) {
      showNotification({
        isOpen: true,
        type: 'warning',
        title: 'Archivo PDF requerido',
        message: 'Debes seleccionar un archivo PDF para continuar con la solicitud.'
      });
      return;
    }
    // Update formData with apprentice ID (from apprentice table)
    const updatedFormData: Partial<requestAsignation> = {
      ...formData,
      apprentice: Number(apprenticeId) || 0,
    };
    // Verify required fields
    // Determine if modality is 'Contrato de Aprendizaje' so dates are conditionally required
    const isContratoSelected = (() => {
      try {
        const m = modalidades.find(mod => Number(mod.id) === Number(updatedFormData.modality_productive_stage));
        return !!m && typeof m.name_modality === 'string' && m.name_modality.toLowerCase().includes('contrato');
      } catch {
        return false;
      }
    })();

    // Validate required fields depending on create/select modes
    const missingFields: string[] = [];

    // Basic required ids
    if (!updatedFormData.apprentice) missingFields.push('apprenticeId');
    if (!updatedFormData.ficha) missingFields.push('fichaId');
    if (!updatedFormData.sede) missingFields.push('sede');
    if (!updatedFormData.modality_productive_stage) missingFields.push('modalityProductiveStage');

    // If the selected modality is 'Contrato', require start/end dates
    if (isContratoSelected) {
      if (!updatedFormData.date_start_contract) missingFields.push('dateStartContract');
      if (!updatedFormData.date_end_contract) missingFields.push('dateEndContract');
    }

    // Enterprise: either select existing or create new (name, nit, location, email)
    if (enterpriseMode === 'select') {
      if (!selectedEnterpriseId) missingFields.push('enterprise (select)');
    } else {
      if (!updatedFormData.enterprise_name) missingFields.push('enterpriseName');
      if (!updatedFormData.enterprise_nit) missingFields.push('enterpriseNit');
      if (!updatedFormData.enterprise_location) missingFields.push('enterpriseLocation');
      if (!updatedFormData.enterprise_email) missingFields.push('enterpriseEmail');
    }

    // Boss: either select existing or create new
    if (bossMode === 'select') {
      if (!selectedBossId) missingFields.push('boss (select)');
    } else {
      if (!updatedFormData.boss_name) missingFields.push('bossName');
      if (!updatedFormData.boss_phone) missingFields.push('bossPhone');
      if (!updatedFormData.boss_email) missingFields.push('bossEmail');
      if (!updatedFormData.boss_position) missingFields.push('bossPosition');
    }

    // Human talent: either select existing or create new
    if (humanTalentMode === 'select') {
      if (!selectedHumanTalentId) missingFields.push('human_talent (select)');
    } else {
      if (!updatedFormData.human_talent_name) missingFields.push('humanTalentName');
      if (!updatedFormData.human_talent_email) missingFields.push('humanTalentEmail');
      if (!updatedFormData.human_talent_phone) missingFields.push('humanTalentPhone');
    }

    // Extra validations
    const bossPhoneValidation = validatePhone(updatedFormData.boss_phone ?? '');
    const humanTalentPhoneValidation = validatePhone(updatedFormData.human_talent_phone ?? '');
    const dateValidation = isContratoSelected
      ? validateEndDate(updatedFormData.date_start_contract ?? null, updatedFormData.date_end_contract ?? null)
      : '';

    // Filter only non-empty errors
  const validationErrors = [bossPhoneValidation, humanTalentPhoneValidation];
    if (dateValidation) validationErrors.push(dateValidation);
    const nonEmptyValidationErrors = validationErrors.filter(error => error !== '');
    
    if (nonEmptyValidationErrors.length > 0) {
      showNotification({
        isOpen: true,
        type: 'warning',
        title: 'Errores de validación',
        message: `Errores encontrados:\n${nonEmptyValidationErrors.join('\n')}`
      });
      return;
    }

    if (missingFields.length > 0) {
      showNotification({
        isOpen: true,
        type: 'warning',
        title: 'Campos faltantes',
        message: `Faltan los siguientes campos: ${missingFields.join(', ')}`
      });
      return;
    }

    // PASS THE TRANSFORMED DATA TO SUBMIT
    try {
      console.log('Enviando datos principales:', updatedFormData);

      // Prepare date formatting helper
      const toDateStringLocal = (value: string | number | undefined) => {
        if (!value && value !== 0) return undefined;
        if (typeof value === 'number') {
          const d = new Date(value);
          if (isNaN(d.getTime())) return undefined;
          return d.toISOString().split('T')[0];
        }
        if (typeof value === 'string') {
          const d = new Date(value);
          if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
          return value;
        }
        return undefined;
      };

      const fechaInicio = updatedFormData.date_start_contract ? toDateStringLocal(updatedFormData.date_start_contract) : undefined;
      const fechaFin = updatedFormData.date_end_contract ? toDateStringLocal(updatedFormData.date_end_contract) : undefined;

      // Build nested payload matching Swagger expectation
      const enterprisePayload = enterpriseMode === 'select' && selectedEnterpriseId
        ? { id: selectedEnterpriseId }
        : {
          id: null,
          name: updatedFormData.enterprise_name ?? '',
          tax_id: updatedFormData.enterprise_nit ?? '',
          address: updatedFormData.enterprise_location ?? '',
          email: updatedFormData.enterprise_email ?? '',
          phone: ''
        };

      const bossPayload = bossMode === 'select' && selectedBossId
        ? { id: selectedBossId }
        : {
          id: null,
          name: updatedFormData.boss_name ?? '',
          email: updatedFormData.boss_email ?? '',
          phone: String(updatedFormData.boss_phone ?? ''),
          position: updatedFormData.boss_position ?? ''
        };

      const humanTalentPayload = humanTalentMode === 'select' && selectedHumanTalentId
        ? { id: selectedHumanTalentId }
        : {
          id: null,
          name: updatedFormData.human_talent_name ?? '',
          email: updatedFormData.human_talent_email ?? '',
          phone: String(updatedFormData.human_talent_phone ?? '')
        };

      const requestPayload: Record<string, string | number> = {
        apprentice: Number(updatedFormData.apprentice),
        ficha: Number(updatedFormData.ficha),
        sede: Number(updatedFormData.sede),
        modality_productive_stage: Number(updatedFormData.modality_productive_stage),
      };
      if (fechaInicio) requestPayload.contract_start_date = fechaInicio;
      if (fechaFin) requestPayload.contract_end_date = fechaFin;

      const nestedPayload = {
        enterprise: enterprisePayload,
        boss: bossPayload,
        human_talent: humanTalentPayload,
        request: requestPayload,
      };

      console.log('nestedPayload a enviar:', nestedPayload);

      // Send to backend using existing service (it accepts any JSON body)
      const submitResponse = await postRequestAssignation(nestedPayload as unknown as requestAsignation);
      console.log('Respuesta de envío (postRequestAssignation):', submitResponse);
      const requestId = submitResponse?.data?.id ?? submitResponse?.id ?? null;
      const backendMessage = submitResponse?.data?.message ?? submitResponse?.message ?? 'La solicitud fue enviada exitosamente.';

      // Subir PDF con request_id cuando esté disponible
      if (selectedFile) {
        let pdfUploadResult = null;
        setPdfUploading(true);
        try {
          console.log('Enviando PDF:', selectedFile, 'con request_id:', requestId);
          // ensure requestId is a number when passing to uploadPdf
          const numericRequestId = requestId ? Number(requestId) : undefined;
          if (!numericRequestId) {
            // backend requires request_id; do not attempt upload without it
            console.error('No requestId available, skipping PDF upload. Backend requires request_id');
            showNotification({ isOpen: true, type: 'warning', title: 'PDF no subido', message: 'ID de solicitud no disponible para subir el PDF.' });
            return;
          }
          pdfUploadResult = await uploadPdf(selectedFile, numericRequestId);
          console.log('Respuesta de uploadPdf:', pdfUploadResult);
        } catch (pdfErr) {
          console.error('Error al subir PDF:', pdfErr);
          showNotification({
            isOpen: true,
            type: 'warning',
            title: 'Error al subir PDF',
            message: pdfErr?.message || 'La solicitud fue enviada pero hubo un error al subir el archivo PDF.'
          });
          return;
        } finally {
          setPdfUploading(false);
        }

        if (pdfUploadResult) {
          showNotification({
            isOpen: true,
            type: 'success',
            title: 'Solicitud enviada',
            message: backendMessage
          });
          setRedirectAfterSuccess(true);
        } else {
          showNotification({
            isOpen: true,
            type: 'warning',
            title: 'Error al subir PDF',
            message: 'La solicitud fue enviada pero hubo un error al subir el archivo PDF.'
          });
        }
      } else {
        showNotification({
          isOpen: true,
          type: 'success',
          title: 'Solicitud enviada',
          message: backendMessage
        });
        setRedirectAfterSuccess(true);
      }
    } catch (err) {
      console.error('Error al enviar solicitud principal:', err);
      showNotification({
        isOpen: true,
        type: 'warning',
        title: 'Error al enviar solicitud',
        message: err?.message || 'Ocurrió un error inesperado al enviar la solicitud.'
      });
    }
  };

  // Compute whether the currently selected modality is 'Contrato de Aprendizaje'
  const modalityIsContrato = useMemo(() => {
    try {
      const m = modalidades.find(mod => Number(mod.id) === Number(formData.modality_productive_stage));
      return !!m && typeof m.name_modality === 'string' && m.name_modality.toLowerCase().includes('contrato');
    } catch {
      return false;
    }
  }, [modalidades, formData.modality_productive_stage]);

  if (userLoading) return <div className="p-8">Cargando información del aprendiz...</div>;
  if (userError) return <div className="p-8 text-red-500">{userError}</div>;
  if (!person) return <div className="p-8 text-orange-500">No se encontró la información del aprendiz.</div>;

  return (
    <>
      <NotificationModal
        key={notification.key}
        isOpen={notification.isOpen}
        onClose={() => {
          setNotification({ ...notification, isOpen: false, key: Date.now() });
          if (redirectAfterSuccess) {
            setRedirectAfterSuccess(false);
            navigate('/home');
          }
        }}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
      <ConfirmModal
        isOpen={showConfirm}
        title="¿Confirmar envío de solicitud?"
        message="¿Estás seguro de que deseas enviar el formulario?"
        confirmText="Sí, enviar"
        cancelText="Cancelar"
        onConfirm={handleConfirmSend}
        onCancel={() => setShowConfirm(false)}
      />
  <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
  <LoadingOverlay isOpen={loading || pdfUploading} message={pdfUploading ? 'Subiendo PDF...' : 'Enviando solicitud...'} />
      <div className="min-h-screen py-8 rounded-md" style={{ background: '#f8f9fa' }}>
        <div className="w-full max-w-4xl mx-auto px-4">
          <form onSubmit={handleFormSubmit}>
            <div className="flex items-center gap-3 mb-6 justify-center ">
              <div 
                className="flex items-center justify-center rounded-full" 
                style={{ width: 48, height: 48, backgroundColor: COLORS.green2 }}
              >
                <JournalText size={28} color={COLORS.white} />
              </div>
              <h1 className="font-bold text-3xl" style={{ color: COLORS.green2 }}>
                Formulario de Asignación
              </h1>
            </div>
            {/* Encabezado centrado */}
            <div className="w-full flex flex-col items-center justify-center mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
              
              <h2 className="font-semibold text-xl mb-4 text-center" style={{ color: COLORS.green2 }}>
                Asignación instructor acompañamiento etapa práctica
              </h2>
              <p className="text-sm text-gray-700 text-center max-w-2xl leading-relaxed">
                Únicamente para la alternativa de Contrato de Aprendizaje. Acepto el tratamiento de mis datos personales conforme a lo consagrado en el artículo 15 Constitución Política y en la Resolución No. 0924 del MINTIC.
              </p>
            </div>

            {/* Términos y condiciones */}
            <div className="w-full mb-6 bg-white rounded-lg   shadow-md p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1 accent-green-600" 
                  style={{ accentColor: COLORS.green }}
                  required 
                />
                <span className="text-sm text-gray-700">
                  Acepto los <button type="button" className="underline text-green-700 hover:text-green-900" onClick={() => setIsTermsModalOpen(true)}>Términos y Condiciones</button> del SENA.
                </span>
              </div>
            </div>

            {/* Selects de Regional, Centro, Sede (solo estos por fuera) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <CustomSelect
                  value={selectedRegional ? String(selectedRegional) : ""}
                  onChange={val => updateSelectedRegional(Number(val))}
                  options={regionales.map(r => ({ value: String(r.id), label: r.name }))}
                  label={`Regional *`}
                  placeholder="Seleccione..."
                  classNames={{
                    trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
                    label: "block text-sm font-medium mb-2",
                  }}
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <CustomSelect
                  value={selectedCenter ? String(selectedCenter) : ""}
                  onChange={val => updateSelectedCenter(Number(val))}
                  options={centrosFiltrados.map(c => ({ value: String(c.id), label: c.name }))}
                  label={`Centro de formación *`}
                  placeholder="Seleccione..."
                  classNames={{
                    trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
                    label: "block text-sm font-medium mb-2",
                  }}
                  disabled={!selectedRegional}
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <CustomSelect
                  value={formData.sede ? String(formData.sede) : ""}
                  onChange={val => updateFormData('sede', Number(val))}
                  options={sedesFiltradas.map(s => ({ value: String(s.id), label: s.name }))}
                  label={`Sede centro de formación *`}
                  placeholder="Seleccione..."
                  classNames={{
                    trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
                    label: "block text-sm font-medium mb-2",
                  }}
                  disabled={!selectedCenter}
                />
              </div>
            </div>


            <ApprenticeSection
              person={{
                name: `${person?.first_name ?? ''} ${person?.second_name ?? ''} ${person?.first_last_name ?? ''} ${person?.second_last_name ?? ''}`.trim(),
                type_identification: person?.type_identification ?? 0,
                number_identificacion: person?.number_identification ? String(person.number_identification) : '',
                request_date: '', // No matching field in Person, leave blank or map from elsewhere if available
                id: person?.id ?? 0,
                request_state: '', // No matching field in Person, leave blank or map from elsewhere if available
              }}
              userData={userData}
              programas={programas}
              selectedProgram={selectedProgram}
              updateSelectedProgram={updateSelectedProgram}
              fichas={fichas.map(f => ({ id: f.id, file_number: String(f.file_number) }))}
              formData={{
                apprentice: formData.apprentice ?? 0,
                ficha: formData.ficha ?? 0,
                date_start_contract: formData.date_start_contract ?? 0,
                date_end_contract: formData.date_end_contract ?? 0,
                enterprise_name: formData.enterprise_name ?? '',
                enterprise_nit: formData.enterprise_nit ?? 0,
                enterprise_location: formData.enterprise_location ?? '',
                enterprise_email: formData.enterprise_email ?? '',
                boss_name: formData.boss_name ?? '',
                boss_phone: formData.boss_phone ?? 0,
                boss_email: formData.boss_email ?? '',
                boss_position: formData.boss_position ?? '',
                human_talent_name: formData.human_talent_name ?? '',
                human_talent_email: formData.human_talent_email ?? '',
                human_talent_phone: typeof formData.human_talent_phone === 'string' ? formData.human_talent_phone : String(formData.human_talent_phone ?? ''),
                sede: formData.sede ?? 0,
                modality_productive_stage: formData.modality_productive_stage ?? 0,
              }}
              updateFormData={updateFormData}
              modalidades={modalidades}
              dateError={dateError}
              minEndDate={minEndDate}
              maxEndDate={maxEndDate}
              handleStartDateChange={handleStartDateChange}
              handleEndDateChange={handleEndDateChange}
              getDocumentTypeName={getDocumentTypeName}
              documentTypes={documentTypes}
            />

            {/* Datos de la Empresa */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Empresa</div>
                <div className="flex items-center gap-2">
                  <button type="button" className={`px-3 py-1 rounded ${enterpriseMode === 'select' ? 'bg-gray-200' : 'bg-white'}`} onClick={() => setEnterpriseMode('select')}>Seleccionar existente</button>
                  <button type="button" className={`px-3 py-1 rounded ${enterpriseMode === 'create' ? 'bg-gray-200' : 'bg-white'}`} onClick={() => { setEnterpriseMode('create'); setSelectedEnterpriseId(null); }}>Crear nueva</button>
                </div>
              </div>
              {enterpriseMode === 'select' && (
                <div className="mb-3">
                  <CustomSelect
                    value={selectedEnterpriseId ? String(selectedEnterpriseId) : ''}
                    onChange={(val) => setSelectedEnterpriseId(val ? Number(val) : null)}
                    options={loadingEnterprises ? [{ value: '__loading__', label: 'Cargando...' }] : enterpriseOptions}
                    label="Empresa existente"
                    placeholder={loadingEnterprises ? 'Cargando...' : 'Seleccione empresa...'}
                    classNames={{
                      trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
                      label: "block text-sm font-medium mb-2",
                    }}
                    disabled={loadingEnterprises}
                  />
                </div>
              )}

              <EmpresaSection
              formData={{
                name_enterprise: formData.enterprise_name ?? '',
                nit_enterprise: formData.enterprise_nit ?? 0,
                locate: formData.enterprise_location ?? '',
                email_enterprise: formData.enterprise_email ?? '',
              }}
              updateFormData={(field, value) => {
                if (field === 'name_enterprise') updateFormData('enterprise_name', value);
                else if (field === 'nit_enterprise') updateFormData('enterprise_nit', value);
                else if (field === 'locate') updateFormData('enterprise_location', value);
                else if (field === 'email_enterprise') updateFormData('enterprise_email', value);
              }}
              disabled={enterpriseMode === 'select'}
            />
            </div>

            {/* Datos del Jefe Inmediato */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Jefe Inmediato</div>
                <div className="flex items-center gap-2">
                  <button type="button" className={`px-3 py-1 rounded ${bossMode === 'select' ? 'bg-gray-200' : 'bg-white'}`} onClick={() => setBossMode('select')}>Seleccionar existente</button>
                  <button type="button" className={`px-3 py-1 rounded ${bossMode === 'create' ? 'bg-gray-200' : 'bg-white'}`} onClick={() => { setBossMode('create'); setSelectedBossId(null); }}>Crear nuevo</button>
                </div>
              </div>
              {bossMode === 'select' && (
                <div className="mb-3">
                  <CustomSelect
                    value={selectedBossId ? String(selectedBossId) : ''}
                    onChange={(val) => setSelectedBossId(val ? Number(val) : null)}
                    options={loadingBosses ? [{ value: '__loading__', label: 'Cargando...' }] : bossOptions}
                    label="Jefe existente"
                    placeholder={loadingBosses ? 'Cargando...' : 'Seleccione jefe...'}
                    classNames={{
                      trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
                      label: "block text-sm font-medium mb-2",
                    }}
                    disabled={loadingBosses || (!selectedEnterpriseId && enterpriseMode === 'select')}
                  />
                </div>
              )}

            <JefeSection
              formData={{
                name_boss: formData.boss_name ?? '',
                email_boss: formData.boss_email ?? '',
                phone_number: typeof formData.boss_phone === 'string' ? Number(formData.boss_phone) : formData.boss_phone ?? 0,
                position: formData.boss_position ?? '',
              }}
              updateFormData={(field, value) => {
                if (field === 'name_boss') updateFormData('boss_name', value);
                else if (field === 'email_boss') updateFormData('boss_email', value);
                else if (field === 'phone_number') updateFormData('boss_phone', value);
                else if (field === 'position') updateFormData('boss_position', value);
              }}
              phoneError={phoneError}
              handlePhoneChange={handlePhoneChange}
              disabled={bossMode === 'select'}
            />
            </div>

            {/* Datos del Encargado de contratación */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Encargado de contratación / Talento Humano</div>
                <div className="flex items-center gap-2">
                  <button type="button" className={`px-3 py-1 rounded ${humanTalentMode === 'select' ? 'bg-gray-200' : 'bg-white'}`} onClick={() => setHumanTalentMode('select')}>Seleccionar existente</button>
                  <button type="button" className={`px-3 py-1 rounded ${humanTalentMode === 'create' ? 'bg-gray-200' : 'bg-white'}`} onClick={() => { setHumanTalentMode('create'); setSelectedHumanTalentId(null); }}>Crear nuevo</button>
                </div>
              </div>
              {humanTalentMode === 'select' && (
                <div className="mb-3">
                  <CustomSelect
                    value={selectedHumanTalentId ? String(selectedHumanTalentId) : ''}
                    onChange={(val) => setSelectedHumanTalentId(val ? Number(val) : null)}
                    options={loadingHumanTalents ? [{ value: '__loading__', label: 'Cargando...' }] : humanTalentOptions}
                    label="Talento humano existente"
                    placeholder={loadingHumanTalents ? 'Cargando...' : 'Seleccione...'}
                    classNames={{
                      trigger: "w-full border-2 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white",
                      label: "block text-sm font-medium mb-2",
                    }}
                    disabled={loadingHumanTalents || (!selectedEnterpriseId && enterpriseMode === 'select')}
                  />
                </div>
              )}

            <TalentoHumanoSection
              formData={{
                name: formData.human_talent_name ?? '',
                email: formData.human_talent_email ?? '',
                phone_number: typeof formData.human_talent_phone === 'string' ? Number(formData.human_talent_phone) : formData.human_talent_phone ?? 0,
              }}
              updateFormData={(field, value) => {
                if (field === 'name') updateFormData('human_talent_name', value);
                else if (field === 'email') updateFormData('human_talent_email', value);
                else if (field === 'phone_number') updateFormData('human_talent_phone', value);
              }}
              humanTalentPhoneError={humanTalentPhoneError}
              handleHumanTalentPhoneChange={handleHumanTalentPhoneChange}
              disabled={humanTalentMode === 'select'}
            />
            </div>

            {/* Archivo PDF */}
            <div >
              
              <PdfUploadSection
                  selectedFile={selectedFile}
                  handleFileSelect={handleFileSelect}
                  triggerFileInput={triggerFileInput}
                  modalityIsContrato={modalityIsContrato}
                />
              
            </div>
            
            {/* Error handling */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700">{error}</div>
              </div>
            )}

            {/* Botón enviar */}
            <div className="flex flex-col items-center">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full max-w-md font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-3 transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-1'}`}
                style={{ 
                  backgroundColor: loading ? '#999' : COLORS.green,
                  color: COLORS.white 
                }}
              >
                <Send size={24} /> 
                {loading ? 'Enviando...' : 'Enviar Formulario'}
              </button>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Asegúrate de completar todos los campos obligatorios (<span style={{ color: COLORS.error }}>*</span>)
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}