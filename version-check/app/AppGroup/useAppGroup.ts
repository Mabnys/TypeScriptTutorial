import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

// Define the structure of an App object
interface App {
    id: string;
    appName: string;
    bundleId: string;
    minimumTargetVersion: string;
    recommendedTargetVersion: string;
    platformName: string;
    lastUpdateDate: string;
    thumbnail?: string;
}

// Define the structure of form inputs for adding and updating an App
interface AppFormInputs {
    appName: string;
    bundleId: string;
    minTargetVersion: string;
    recTargetVersion: string;
    platformName: 'iOS' | 'Android' | '';
}

export const useAppGroup = (groupId: string) => {
    // State for storing apps
    const [apps, setApps] = useState<App[]>([]);
    // State for storing the selected app ID
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    // State for controlling the modal
    const [modalOpen, setModalOpen] = useState(false);
    // State for storing the modal title
    const [modalTitle, setModalTitle] = useState('');
    // State for image upload
    const [imageUploadAppId, setImageUploadAppId] = useState<string | null>(null);

    const router = useRouter();

    // Initialize react-hook-form
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AppFormInputs>();

    // Fetch the authentication token from cookies
    const getAuthToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    };

    // Fetch all apps from the API
    const fetchApps = useCallback(() => {
        // Get the authentication token
        const authToken = getAuthToken();
        
        // If no auth token is found, redirect to login page
        if (!authToken) {
          router.push('/');
          return Promise.reject('No auth token found');
        }
      
        // Return a new Promise
        return new Promise((resolve, reject) => {
          // Make the API call using fetch
          fetch(`http://localhost:8080/api/v1/get-all-apps?appGroupID=${groupId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
          .then(response => {
            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            // Update the apps state with the fetched data
            setApps(data);
            resolve(data);
          })
          .catch(error => {
            console.error('Error fetching apps:', error);
            reject(error);
          });
        });
      }, [router, groupId]);
      

    // Handle opening the modal for adding or updating an app
    const handleOpenModal = (title: string, appData?: App) => {
        setModalTitle(title);
        setModalOpen(true);
        if (appData) {
            // Pre-fill form with existing app data for updates
            setValue('appName', appData.appName);
            setValue('bundleId', appData.bundleId);
            setValue('minTargetVersion', appData.minimumTargetVersion);
            setValue('recTargetVersion', appData.recommendedTargetVersion);
            setValue('platformName', appData.platformName as 'iOS' | 'Android');
        } else {
            // Reset form for adding new app
            reset();
        }
    };

    // Handle form submission for adding or updating an app
    const onSubmit: SubmitHandler<AppFormInputs> = async (data) => {
        const authToken = getAuthToken();
        if (!authToken) return;

        const method = selectedAppId ? 'PUT' : 'POST';
        const url = selectedAppId
            ? `http://localhost:8080/api/v1/update-app?APPID=${selectedAppId}`
            : 'http://localhost:8080/api/v1/create-app';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...data, appGroupID: groupId }),
            });

            if (response.ok) {
                setModalOpen(false);
                fetchApps(); // Refresh the app list after successful submission
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Handle deleting an app
    const handleDelete = async () => {
        if (!selectedAppId) return;
        const authToken = getAuthToken();
        if (!authToken) return;

        try {
            const response = await fetch(`http://localhost:8080/api/v1/delete-app?APPID=${selectedAppId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (response.ok) {
                fetchApps(); // Refresh the app list after successful deletion
            } else {
                throw new Error('Failed to delete app');
            }
        } catch (error) {
            console.error('Error deleting app:', error);
        }
    };

    // Handle image upload
    const handleImageUpload = async (file: File) => {
        if (!imageUploadAppId) return;

        const authToken = getAuthToken();
        if (!authToken) return;

        const formData = new FormData();
        formData.append('vcImage', file);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/app/${imageUploadAppId}/upload-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData,
            });

            if (response.ok) {
                fetchApps(); // Refresh the app list after successful upload
                setImageUploadAppId(null);
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    // Fetch apps when the component mounts
    useEffect(() => {
        fetchApps().catch(error => console.error('Error in useEffect:', error));
    }, [fetchApps]);

    // Return necessary functions and state for the app group page
    return {
        apps,
        selectedAppId,
        setSelectedAppId,
        modalOpen,
        setModalOpen,
        modalTitle,
        register,
        handleSubmit,
        errors,
        handleOpenModal,
        onSubmit,
        handleDelete,
        fetchApps,
        imageUploadAppId,
        setImageUploadAppId,
        handleImageUpload
    };
};
