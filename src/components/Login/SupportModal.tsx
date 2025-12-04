import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Mail, Phone, Clock, Send, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import useSupportForm from '../../hook/useSupportForm';
import CustomSelect from '../CustomSelect'; 

import { getAllTypeOfQueries } from '../../Api/Services/TypeOfQueries';
import { getAllSupportContacts } from '../../Api/Services/Support';
import type { TypeOfQueries } from '../../Api/types/Modules/general.types';
import type { SupportContact } from '../../Api/types/entities/support.types';

const SupportModal = ({ isOpen, onClose }) => {
    const {
        formData,
        isLoading,
        error,
        success,
        handleInputChange,
        submitForm,
        setSuccess,
    } = useSupportForm();

    const [localError, setLocalError] = React.useState('');
    const [categories, setCategories] = React.useState<TypeOfQueries[]>([]);
    const [loadingCategories, setLoadingCategories] = React.useState(false);
    const [contacts, setContacts] = React.useState<SupportContact[]>([]);
    const [loadingContacts, setLoadingContacts] = React.useState(false);
    const [schedules, setSchedules] = React.useState([]);
    const [loadingSchedules, setLoadingSchedules] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;
        setLoadingCategories(true);
        setLoadingContacts(true);
        setLoadingSchedules(true);
        getAllTypeOfQueries()
            .then((data) => {
                setCategories(Array.isArray(data) ? data.filter(c => c.active) : []);
            })
            .finally(() => setLoadingCategories(false));
        getAllSupportContacts()
            .then((data) => {
                setContacts(data);
            })
            .finally(() => setLoadingContacts(false));
        import('../../Api/Services/Support').then(mod => {
            mod.getAllSupportSchedules()
                .then((data) => {
                    setSchedules(Array.isArray(data) ? data : []);
                })
                .finally(() => setLoadingSchedules(false));
        });
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validar correo
        const email = formData.email || '';
        const validEmail = /^[\w.-]+@(sena\.edu\.co|soy\.sena\.edu\.co)$/i.test(email);
        if (!validEmail) {
            setSuccess(false);
            setLocalError('El correo debe terminar en @sena.edu.co o @soy.sena.edu.co');
            return;
        }
        setLocalError('');
        const wasSuccessful = await submitForm();
        if (wasSuccessful) {
            // Show success message for 2 seconds and then close
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        }
    };

    const handleMailtoFallback = (e) => {
        e.preventDefault();
        setTimeout(() => {
            setSuccess(false);
            onClose();
        }, 1000);
    };

    // Resetear estado cuando se cierra el modal
    React.useEffect(() => {
        if (!isOpen) {
            setSuccess(false);
        }
    }, [isOpen, setSuccess]);

    if (!isOpen) return null;

    // Usa portal aquí
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col items-center p-6 border-b border-gray-200  fixed bg-white max-w-3xl w-full">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors "
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#43A047] rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">?</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 text-center">Centro de soporte</h2>
                    </div>
                    <p className="text-gray-600 text-center mt-2">Estamos aquí para ayudarte. Encuentra respuestas rápidas o contáctanos directamente.</p>
                </div>

                <h3 className="font-semibold text-gray-900 mb-4 text-center mt-40 text-2xl ">Formas de contactarnos</h3>
                {/* Content */}
                <div className="p-6 space-y-6 pt-1">

                    <div className="grid md:grid-cols-2 gap-6">
                        {loadingContacts ? (
                            <div className="col-span-2 text-center text-gray-500">Cargando contactos...</div>
                        ) : (
                            contacts
                                .filter(c => c.extra_info !== "enlace")
                                .map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="bg-white shadow rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                        onClick={() => {
                                            if (contact.type.toLowerCase() === "email") {
                                                const subject = encodeURIComponent('Solicitud de Soporte - Sistema de Gestión');
                                                const body = encodeURIComponent('Hola,\n\nPor favor, describe tu consulta o problema:\n\n');
                                                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.value}&su=${subject}&body=${body}`;
                                                window.open(gmailUrl, '_blank');
                                            }
                                        }}
                                    >
                                        {contact.type.toLowerCase() === "email" ? (
                                            <Mail className="w-8 h-8 mx-auto text-orange-600 mb-3" />
                                        ) : (
                                            <Phone className="w-8 h-8 mx-auto text-green-600 mb-3" />
                                        )}
                                        <h3 className="font-semibold text-lg">{contact.type}</h3>
                                        <p className="text-gray-600 text-sm">{contact.label}</p>
                                        <p className={`font-semibold text-lg mt-2 ${contact.type.toLowerCase() === "email" ? "text-orange-600 hover:text-orange-700" : ""}`}>{contact.value}</p>
                                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-3">
                                            <Clock className="w-4 h-4" />
                                            <span>{contact.extra_info}</span>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>


                    {/* Schedule */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-xl">
                            <Clock className="w-5 h-5 text-[#43A047]" />
                            Horarios de atención
                        </h3>
                        <div className="space-y-2 text-sm">
                            {loadingSchedules ? (
                                <div className="text-center text-gray-500">Cargando horarios...</div>
                            ) : (
                                schedules.map(sch => (
                                    <div key={sch.id} className="flex justify-between border-b border-gray-300 py-2">
                                        <span className="text-black font-semibold">{sch.day_range}</span>
                                        <span className={sch.is_closed ? "text-gray-400" : "text-[#43A047]"}>
                                            {sch.is_closed ? "Cerrado" : sch.hours}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <p className="text-sm text-orange-800">
                                <strong>Nota:</strong> Los tiempos de respuesta pueden variar durante períodos de alta demanda como matrículas masivas.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900  text-xl">Envíanos un mensaje</h3>
                        <h4 className='mb-6 text-gray-500'>Complete el formulario y nos pondremos en contacto con usted dentro de 24 horas.</h4>

                        {/* Estados de éxito y error */}
                        {success && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-green-800 font-medium">¡Mensaje enviado correctamente!</p>
                                    <p className="text-green-700 text-sm">Te contactaremos pronto a tu email.</p>
                                </div>
                            </div>
                        )}

                        {(error || localError) && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-red-800 font-medium">Error al enviar</p>
                                        <p className="text-red-700 text-sm">{error || localError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43A047] focus:border-transparent transition-all"
                                    placeholder="Ingresa tu nombre completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo electrónico *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43A047] focus:border-transparent transition-all"
                                    placeholder="correo@soy.sena.edu.co"
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    value={formData.category}
                                    onChange={(val) => handleInputChange({ target: { name: "category", value: val } })}
                                    options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                                    label="Categoría de Consulta *"
                                    placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría"}
                                    disabled={loadingCategories}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#43A047] focus:border-transparent transition-all resize-none"
                                    placeholder="Describe detalladamente tu consulta o problema..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading || success}
                                    className="flex-1 bg-[#43A047] hover:bg-[#388E3C] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#43A047] focus:ring-offset-2 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : success ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Enviado
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Enviar Mensaje
                                        </>
                                    )}
                                </button>


                            </div>
                        </form>
                    </div>

                    {/* Useful Links */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 text-xl">Enlaces útiles</h3>
                        <div className="space-y-3">
                            {loadingContacts ? (
                                <div className="text-center text-gray-500">Cargando enlaces...</div>
                            ) : (
                                contacts
                                    .filter(c => c.extra_info === "enlace")
                                    .map(link => (
                                        <a
                                            key={link.id}
                                            href={link.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                        >
                                            <span className="text-gray-700 group-hover:text-gray-900">
                                                {link.label}
                                            </span>
                                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                        </a>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SupportModal;