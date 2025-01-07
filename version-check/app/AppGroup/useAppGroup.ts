import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRefreshToken } from '../Components/useRefreshToken';

// Define the structure of an App
interface App {
    id: string;
    appName: string;
    bundleId: string;
    minimumTargetVersion: string;
    recommendedTargetVersion: string;
    platformName: string;
    lastUpdateDate: string;
    images?: [ImageBlob];
}

export interface ImageBlob {
  blob: string
}

// Define the structure of form inputs for adding and updating an App
interface AppFormInputs {
    appName: string;
    bundleId: string;
    minTargetVersion: string;
    recTargetVersion: string;
    platformName: 'iOS' | 'Android' | 'Select Platform';
}

export const useAppGroup = (groupId: string) => {
    const [apps, setApps] = useState<App[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AppFormInputs>({
        defaultValues: {
          platformName: 'Select Platform',
        }
    });

    const { refreshAccessToken } = useRefreshToken();

    // Function to get the auth token from cookies
    const getAuthToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    };

    // Function to fetch all apps for the given group
    const fetchApps = useCallback(async () => {
        try {
            let authToken = getAuthToken();

            if (!authToken) {
                // Try to refresh the token if it's not available
                authToken = await refreshAccessToken();
            }

            const response = await fetch(`http://localhost:8080/api/v1/get-all-apps?appGroupID=${groupId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 401) {
                // If unauthorized, try refreshing the token
                authToken = await refreshAccessToken();
                // Retry the request with the new token
                const retryResponse = await fetch(`http://localhost:8080/api/v1/get-all-apps?appGroupID=${groupId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (!retryResponse.ok) throw new Error('Network response was not ok after token refresh');
                return retryResponse.json();
            }

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Process the fetched data
            const processedData = data.map((app: App) => ({
                ...app,
                thumbnail: app.images && app.images.length > 0
                    ? `data:image/png;base64,${app.images[0].blob}`
                    : null
            }));
            setApps(processedData);
            return processedData;
        } catch (error) {
            console.error('Error fetching apps:', error);
            throw error;
        }
    }, [groupId, refreshAccessToken]);

    // Fetch apps when the component mounts or groupId changes
    useEffect(() => {
        fetchApps().catch(error => console.error('Error fetching apps:', error));
    }, [fetchApps]);

    // Handler for opening the modal for adding or updating an app
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
            // Reset form for adding new app, but keep platformName as 'Select Platform'
            reset({ platformName: 'Select Platform' });
        }
    };

    // Handler for form submission
    const onSubmit: SubmitHandler<AppFormInputs> = async (data) => {
        // Validate that a platform has been selected
        if (data.platformName === 'Select Platform') {
            alert('Please select a platform');
            return;
        }

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
                body: JSON.stringify({
                    appName: data.appName,
                    bundleId: data.bundleId,
                    minimumTargetVersion: data.minTargetVersion,
                    recommendedTargetVersion: data.recTargetVersion,
                    platformName: data.platformName,
                    appGroupID: groupId,
                }),
            });

            if (response.ok) {
                alert(`${selectedAppId ? 'Updated' : 'Created'} App successfully!`);
                setModalOpen(false);
                fetchApps();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Handler for deleting an app
    const handleDelete = async () => {
        if (!selectedAppId) return;

        if (confirm('Are you sure you want to delete this app?')) {
            const authToken = getAuthToken();
            if (!authToken) return;
    
            try {
                const response = await fetch(`http://localhost:8080/api/v1/delete-app?APPID=${selectedAppId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
    
                if (response.ok) {
                    alert('App deleted successfully!');
                    fetchApps();
                } else {
                    throw new Error('Failed to delete app');
                }
            } catch (error) {
                console.error('Error deleting app:', error);
            }
        }
    };

    // Handler for uploading an image for an app
    const handleImageUpload = async (file: File) => {
        if (!selectedAppId) return;

        const authToken = getAuthToken();
        if (!authToken) return;

        const formData = new FormData();
        formData.append('vcImage', file);

        try {
            const response = await fetch(`http://localhost:8080/api/v1/app/${selectedAppId}/upload-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData,       
            });

            if (response.ok) {
                alert(`${selectedAppId ? 'Updated' : 'Created'} App successfully!`);
                fetchApps();
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('An error occurred while uploading the image.');
        }
    };

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
        handleImageUpload,
    };
};