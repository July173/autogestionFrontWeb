import React, { useEffect, useState } from 'react';
import type { User } from '../Api/types/entities/user.types';
import { requestPasswordResetCode, verifyResetCode } from '../Api/Services/User';
import { patchPersonImage } from '../Api/Services/Person';
import { getUserById } from '../Api/Services/User';
import { useUserData } from '../hook/useUserData';
import ProfileImageUploader from '../components/Perfil/ProfileImageUploader';
import PersonalInfoDisplay from '../components/Perfil/PersonalInfoDisplay';
import PasswordResetModal from '../components/Perfil/PasswordResetModal';

/**
 * User profile page.
 * Shows personal information, allows changing profile image and password recovery.
 * Uses subcomponents for image, personal data and recovery modal.
 */
export const Perfil = () => {
  const { userData } = useUserData();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Editable image
  const [editImgLoading, setEditImgLoading] = useState(false);
  const [editImgError, setEditImgError] = useState('');
  const [showImgConfirm, setShowImgConfirm] = useState(false);
  const [pendingImgFile, setPendingImgFile] = useState<File | null>(null);
  // Recovery modal
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'send' | 'verify' | 'reset'>('send');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [modalError, setModalError] = useState('');

  /**
   * Gets the complete data of the current user by their id.
   */
  useEffect(() => {
    setError(null);
    setLoading(true);
    if (userData && userData.id) {
      getUserById(userData.id)
        .then(setUser)
        .catch(() => setError('No se pudo cargar la información'))
        .finally(() => setLoading(false));
    } else if (userData && !userData.id) {
      setError('No se encontró el id de usuario en la sesión');
      setLoading(false);
    } else {
      setLoading(true); // await userdata availability
    }
  }, [userData]);


  // Modal logic: send email on open
  /**
   * Logic to show the recovery modal and send the recovery email.
   * Only activates if the modal is open and the step is 'send'.
   */
  useEffect(() => {
    if (showModal && modalStep === 'send' && userData?.email) {
      setModalLoading(true);
      setModalMsg(' enviando correo de recuperación...');
      requestPasswordResetCode(userData.email)
        .then(res => {
          if (res.success) {
            setModalStep('verify');
            setModalMsg('Se ha enviado un código de verificación a tu correo institucional.');
          } else {
            setModalError(res.message || 'No se pudo enviar el correo.');
          }
        })
        .catch(() => setModalError('No se pudo enviar el correo.'))
        .finally(() => setModalLoading(false));
    }
    // eslint-disable-next-line
  }, [showModal, modalStep, userData]);


  // DEBUG: Show userData content and user value
  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return (
    <div className="p-8 text-red-500">
      {error}
      <pre className="text-xs text-black bg-gray-100 mt-4 p-2 rounded">userData: {JSON.stringify(userData, null, 2)}{"\n"}user: {userData?.id ? userData.id : 'NO DEFINIDO'}</pre>
    </div>
  );
  if (!user) return (
    <div className="p-8 text-orange-500">
      No se encontró el usuario.<br />
      <pre className="text-xs text-black bg-gray-100 mt-4 p-2 rounded">userData: {JSON.stringify(userData, null, 2)}{"\n"}user: {userData?.id ? userData.id : 'NO DEFINIDO'}</pre>
    </div>
  );


  /**
   * Renders the main profile UI.
   * Shows image, name, email, personal data and button to change password.
   * The recovery modal is shown according to the state.
   */
  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow">
      <div className="bg-black/50 rounded-lg shadow p-8 flex flex-col items-center relative mb-8">
        <ProfileImageUploader
          person={user.person}
          onImageChange={file => {
            setPendingImgFile(file);
            setShowImgConfirm(true);
          }}
          editImgLoading={editImgLoading}
          editImgError={editImgError}
          showImgConfirm={showImgConfirm}
          pendingImgFile={pendingImgFile}
          setShowImgConfirm={setShowImgConfirm}
          setPendingImgFile={setPendingImgFile}
          patchPersonImage={async (id, file) => {
            setEditImgLoading(true);
            setEditImgError('');
            try {
              const updated = await patchPersonImage(id, file);
              // Update user state with new image
              setUser(prev => prev ? { ...prev, person: { ...prev.person, image: updated.image } } : prev);
              return updated;
            } catch (err) {
              setEditImgError('No se pudo actualizar la imagen');
              throw err;
            } finally {
              setEditImgLoading(false);
              setPendingImgFile(null);
            }
          }}
          setPerson={person => setUser(prev => prev ? { ...prev, person: { ...person, image: person.image ?? prev.person.image } } : prev)}
        />
        <div className="mt-4" />
        <h1 className="text-3xl font-bold text-white text-center">
          {user.person.first_name} {user.person.second_name || ''} {user.person.first_last_name} {user.person.second_last_name || ''}
        </h1>
        <p className="text-gray-100 text-center">{user.email}</p>
      </div>
      <PersonalInfoDisplay person={user.person} email={user.email} />
      <button
        className="bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-lg shadow mx-auto block mt-6"
        onClick={() => {
          setShowModal(true);
          setModalStep('send');
          setModalMsg('');
          setModalError('');
          setCode('');
          setCodeError('');
        }}
      >
        Cambiar Contraseña
      </button>
      <PasswordResetModal
        showModal={showModal}
        modalStep={modalStep}
        modalMsg={modalMsg}
        modalError={modalError}
        modalLoading={modalLoading}
        code={code}
        codeError={codeError}
        userEmail={user.email}
        setShowModal={setShowModal}
        setModalStep={setModalStep}
        setModalMsg={setModalMsg}
        setModalError={setModalError}
        setCode={setCode}
        setCodeError={setCodeError}
        verifyResetCode={verifyResetCode}
      />
    </div>
  );
}

