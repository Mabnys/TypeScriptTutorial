import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { App } from '../../Types/App';
import { useRefreshToken } from '../../Components/useRefreshToken';
import { useRouter } from 'next/navigation';

export const useAppGroup = (groupId: string) => {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const { refreshAccessToken } = useRefreshToken();
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<App>();

  // Function to fetch apps for a specific group
  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let accessToken = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
      if (!accessToken) {
        accessToken = await refreshAccessToken();
      }
      const response = await fetch(`http://localhost:8080/api/v1/get-all-apps?appGroupID=${groupId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.status === 401) {
        accessToken = await refreshAccessToken();
        const retryResponse = await fetch(`http://localhost:8080/api/v1/get-all-apps?appGroupID=${groupId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!retryResponse.ok) throw new Error('Failed to fetch apps after token refresh');
        const data = await retryResponse.json();
        setApps(data);
      } else if (!response.ok) {
        throw new Error('Failed to fetch apps');
      } else {
        const data = await response.json();
        setApps(data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      if (err instanceof Error && err.message.includes('authentication')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, refreshAccessToken, router]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  // Handler for opening the modal
  const handleOpenModal = (title: string, app?: App) => {
    setModalTitle(title);
    if (app) {
      reset(app);
    } else {
      reset({});
    }
    setModalOpen(true);
  };

  // Handler for form submission
  const onSubmit = (data: App) => {
    console.log('Form submitted:', data);
    setModalOpen(false);
  };

  // Handler for deleting an app
  const handleDelete = () => {
    if (!selectedAppId) return alert('No app selected.');
    console.log('Delete app:', selectedAppId);
  };

  // Handler for uploading an image
  const handleImageUpload = (file: File) => {
    console.log('Upload image for app:', selectedAppId, file);
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
    loading,
    error
  };
};
