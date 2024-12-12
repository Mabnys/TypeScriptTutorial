import { useState, useEffect } from 'react';
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
    appGroup?: { id: string };
}

// Define the structure of form inputs for adding/updating an app
type FormInputs = {
    appName: string;
    bundleId: string;
    minTargetVersion: string;
    recTargetVersion: string;
    platformName: string;
    appGroupId: string;
};

export const useAppGroup = () => {
    // State management
    const [apps, setApps] = useState<App[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const router = useRouter();

    // Initialize react-hook-form
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormInputs>();

    // Fetch the authentication token from cookies
    const getAuthToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    };

    // Fetch all apps from the API using Promise-based approach
    const fetchApps = () => {
        // Get the authentication token
        const authToken = getAuthToken();
        
        // If no auth token is found, redirect to login page
        if (!authToken) {
            router.push('/');
            return Promise.reject('No auth token found');
        }

        // Return a new Promise
        return new Promise((resolve, reject) => {
            // Make the API call
            fetch('http://localhost:8080/api/v1/get-all-apps', {
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
    };

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
            setValue('platformName', appData.platformName);
            setValue('appGroupId', appData.appGroup?.id || '');
        } else {
            // Reset form for adding new app
            reset();
        }
    };

    // Handle form submission for adding or updating an app
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
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
                body: JSON.stringify(data),
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

    // Fetch apps when the component mounts
    useEffect(() => {
        fetchApps().catch(error => console.error('Error in useEffect:', error));
    }, []);

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
        fetchApps
    };
};
