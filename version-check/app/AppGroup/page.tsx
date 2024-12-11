'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';

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

// Define the structure of the form inputs
type FormInputs = {
    appName: string;
    bundleId: string;
    minTargetVersion: string;
    recTargetVersion: string;
    platformName: string;
    appGroupId: string;
};

export default function AppGroupPage() {
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

    // Fetch all apps from the API
    const fetchApps = async () => {
        const authToken = getAuthToken();
        if (!authToken) {
            router.push('/');
            return;
        }

        try {
            const response = await fetch('/api/v1/get-all-apps', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApps(data);
            } else {
                console.error('Failed to fetch apps');
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
        }
    };

    // Handle opening the modal for adding or updating an app
    const handleOpenModal = (title: string, appData?: App) => {
        setModalTitle(title);
        setModalOpen(true);
        if (appData) {
            // Pre-fill form with existing app data
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

    // Handle form submission
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        const authToken = getAuthToken();
        if (!authToken) return;

        const method = selectedAppId ? 'PUT' : 'POST';
        const url = selectedAppId
            ? `/api/v1/update-app?APPID=${selectedAppId}`
            : '/api/v1/create-app';

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
                fetchApps();
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
            const response = await fetch(`/api/v1/delete-app?APPID=${selectedAppId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (response.ok) {
                fetchApps();
            } else {
                throw new Error('Failed to delete app');
            }
        } catch (error) {
            console.error('Error deleting app:', error);
        }
    };

    // Fetch apps when the component mounts
    useEffect(() => {
        fetchApps();
    });

    return (
        <div className="content">
            <h2>App Table</h2>
            
            <div className="action-buttons">
                <button onClick={fetchApps} className="action-button">Refresh</button>
                <button onClick={() => handleOpenModal('Add App')} className="action-button">Add App</button>
                <button onClick={() => handleOpenModal('Update App', apps.find(app => app.id === selectedAppId))} className="action-button" disabled={!selectedAppId}>Update Selected</button>
                <button onClick={handleDelete} className="action-button" disabled={!selectedAppId}>Delete Selected</button>
                <button className="action-button">Upload Image</button>
            </div>
            
            <table id="appTable" border={1} cellPadding={10} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>ID</th>
                        <th>App Name</th>
                        <th>Bundle ID</th>
                        <th>Minimum Target Version</th>
                        <th>Recommended Target Version</th>
                        <th>Platform Name</th>
                        <th>Last Update Date</th>
                        <th>Thumbnail</th>
                        <th>App Group ID</th>
                    </tr>
                </thead>
                <tbody>
                    {apps.map(app => (
                        <tr key={app.id}>
                            <td>
                                <input
                                    type="radio"
                                    name="appSelect"
                                    value={app.id}
                                    onChange={() => setSelectedAppId(app.id)}
                                    checked={selectedAppId === app.id}
                                />
                            </td>
                            <td>{app.id}</td>
                            <td>{app.appName}</td>
                            <td>{app.bundleId}</td>
                            <td>{app.minimumTargetVersion}</td>
                            <td>{app.recommendedTargetVersion}</td>
                            <td>{app.platformName}</td>
                            <td>{new Date(app.lastUpdateDate).toLocaleDateString()}</td>
                            <td>{app.thumbnail && <Image src={app.thumbnail} alt="App Thumbnail" width={50} height={50} />}</td>
                            <td>{app.appGroup?.id || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
                        <h2>{modalTitle}</h2>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input {...register('appName', { required: 'App Name is required' })} placeholder="App Name" />
                            {errors.appName && <span>{errors.appName.message}</span>}
                            
                            <input {...register('bundleId', { required: 'Bundle ID is required' })} placeholder="Bundle ID" />
                            {errors.bundleId && <span>{errors.bundleId.message}</span>}
                            
                            <input {...register('minTargetVersion', { required: 'Minimum Target Version is required' })} placeholder="Minimum Target Version" />
                            {errors.minTargetVersion && <span>{errors.minTargetVersion.message}</span>}
                            
                            <input {...register('recTargetVersion', { required: 'Recommended Target Version is required' })} placeholder="Recommended Target Version" />
                            {errors.recTargetVersion && <span>{errors.recTargetVersion.message}</span>}
                            
                            <select {...register('platformName', { required: 'Platform Name is required' })}>
                                <option value="" disabled>Select Platform</option>
                                <option value="iOS">iOS</option>
                                <option value="Android">Android</option>
                            </select>
                            {errors.platformName && <span>{errors.platformName.message}</span>}
                            
                            <input {...register('appGroupId', { required: 'App Group ID is required' })} placeholder="App Group ID" />
                            {errors.appGroupId && <span>{errors.appGroupId.message}</span>}
                            
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
