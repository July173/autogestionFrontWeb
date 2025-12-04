
import React from 'react';
import { Person } from '../../Api/types/entities/person.types';
import { Camera } from 'lucide-react';

/**
 * Props interface for the ProfileImageUploader component.
 * Allows displaying and updating a person's profile image.
 */
interface ProfileImageUploaderProps {
  /** Current person's data */
  person: Person;
  /** Callback when a new image file is selected */
  onImageChange: (file: File) => void;
  /** Loading state when updating the image */
  editImgLoading: boolean;
  /** Error message when updating the image */
  editImgError: string;
  /** Whether to show the image change confirmation modal */
  showImgConfirm: boolean;
  /** Pending image file waiting for confirmation */
  pendingImgFile: File | null;
  /** Function to change confirmation modal visibility */
  setShowImgConfirm: (show: boolean) => void;
  /** Function to change the pending image file */
  setPendingImgFile: (file: File | null) => void;
  /** Function to update image in the backend */
  patchPersonImage: (id: string, file: File) => Promise<Person>;
  /** Function to update the person state */
  setPerson: (person: Person) => void;
}

/**
 * ProfileImageUploader component - Component for displaying and updating a person's profile image.
 *
 * This component provides a complete profile image management interface including:
 * - Circular image display with fallback to initials
 * - Hidden file input for image selection
 * - Edit button with camera icon
 * - Confirmation modal for image changes
 * - Loading states and error handling
 * - Custom event dispatching for UI updates
 *
 * Features:
 * - Circular profile image display
 * - Fallback to user initials when no image is available
 * - File input with image-only acceptance
 * - Confirmation dialog before applying changes
 * - Loading states during upload
 * - Error message display
 * - Custom event emission for menu updates
 * - Responsive design with proper spacing
 *
 * The component handles the complete image update flow:
 * 1. User clicks edit button
 * 2. File selection dialog opens
 * 3. Confirmation modal appears
 * 4. Image uploads to backend on confirmation
 * 5. UI updates with new image
 * 6. Custom event notifies other components
 *
 * @param props - The component props
 * @returns A profile image uploader component with confirmation modal
 *
 * @example
 * ```tsx
 * <ProfileImageUploader
 *   person={currentUser}
 *   onImageChange={(file) => handleImageSelection(file)}
 *   editImgLoading={false}
 *   editImgError=""
 *   showImgConfirm={false}
 *   pendingImgFile={null}
 *   setShowImgConfirm={setConfirmVisible}
 *   setPendingImgFile={setPendingFile}
 *   patchPersonImage={updateProfileImage}
 *   setPerson={updateUserData}
 * />
 * ```
 */
const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  person,
  onImageChange,
  editImgLoading,
  editImgError,
  showImgConfirm,
  pendingImgFile,
  setShowImgConfirm,
  setPendingImgFile,
  patchPersonImage,
  setPerson,
}) => {
  // Reference to the hidden file input element
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-end ">
      {/* Profile image container with circular styling */}
      <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden relative">
        {person.image ? (
          // Display profile image if available
          <img src={`http://localhost:8000${person.image}`} alt="Foto de perfil" className="object-cover w-full h-full" />
        ) : (
          // Fallback to first letter of first name
          <span className="text-4xl font-bold text-gray-600">
            {person.first_name.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Hidden file input for image selection */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onImageChange(file);
          }}
        />
      </div>

      {/* Edit button with camera icon */}
      <button
        className="bg-green-600 rounded-full p-2 shadow hover:bg-green-700 flex items-center justify-center mb-2"
        title="Editar imagen"
        onClick={() => fileInputRef.current?.click()}
        disabled={editImgLoading}
        style={{ width: '32px', height: '32px' }}
      >
        <Camera className="text-white" />
      </button>

      {/* Confirmation modal for image change */}
      {showImgConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            {/* Close button for modal */}
            <button className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowImgConfirm(false)}>&times;</button>

            <h2 className="text-xl font-bold mb-2 text-[#263238]">¿Cambiar imagen de perfil?</h2>
            <p className="mb-4 text-gray-700">¿Estás seguro que deseas cambiar tu imagen de perfil?</p>

            <div className="flex gap-4 mt-4">
              {/* Confirm button - uploads image and updates UI */}
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow w-full"
                onClick={async () => {
                  if (!pendingImgFile) return;
                  try {
                    const updated = await patchPersonImage(String(person.id), pendingImgFile);
                    setPerson(updated);
                    // Emit custom event to update image in menu/navbar
                    const event = new CustomEvent('profileImageUpdated', {
                      detail: { image: updated.image }
                    });
                    window.dispatchEvent(event);
                  } catch (err) {
                    // Error handling is done in parent component
                  } finally {
                    setShowImgConfirm(false);
                    setPendingImgFile(null);
                  }
                }}
                disabled={editImgLoading}
              >Sí, cambiar</button>

              {/* Cancel button - closes modal without changes */}
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded shadow w-full"
                onClick={() => {
                  setShowImgConfirm(false);
                  setPendingImgFile(null);
                }}
                disabled={editImgLoading}
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Error message display */}
      {editImgError && <div className="text-red-500 text-xs mt-2">{editImgError}</div>}

      {/* Loading message during upload */}
      {editImgLoading && <div className="text-gray-500 text-xs mt-2">Actualizando imagen...</div>}
    </div>
  );
};

export default ProfileImageUploader;
