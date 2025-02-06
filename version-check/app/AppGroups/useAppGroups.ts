import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AppGroup } from '../Types/AppGroup';
import { useRefreshToken } from '../Components/useRefreshToken';
import { useRouter } from 'next/navigation';

export const useGroupApps = () => {
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add App Group');

  const { refreshAccessToken } = useRefreshToken();
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppGroup>();

  // Function to fetch app groups
  const fetchAppGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let accessToken = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
      if (!accessToken) {
        accessToken = await refreshAccessToken();
      }
      const response = await fetch('http://localhost:8080/api/v1/get-all-appgroups', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.status === 401) {
        accessToken = await refreshAccessToken();
        const retryResponse = await fetch('http://localhost:8080/api/v1/get-all-appgroups', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!retryResponse.ok) throw new Error('Failed to fetch app groups after token refresh');
        const data = await retryResponse.json();
        setAppGroups(data);
      } else if (!response.ok) {
        throw new Error('Failed to fetch app groups');
      } else {
        const data = await response.json();
        setAppGroups(data);
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
  }, [refreshAccessToken, router]);

  useEffect(() => {
    fetchAppGroups();
  }, [fetchAppGroups]);

  // Handler for refreshing the app groups list
  const handleRefresh = () => fetchAppGroups();

  // Handler for selecting a group
  const handleSelectGroup = (id: string) => setSelectedGroupId(id);

  // Handler for adding a new app group
  const handleAdd = () => {
    setModalTitle('Add App Group');
    reset({ groupName: '', appDescription: '' });
    setSelectedGroupId(null);
    setIsModalOpen(true);
  };

  // Handler for updating an app group
  const handleUpdate = () => {
    if (!selectedGroupId) return alert('No group selected.');
    const selectedGroup = appGroups.find(group => group.id === selectedGroupId);
    if (selectedGroup) {
      setModalTitle('Update App Group');
      reset({
        groupName: selectedGroup.groupName,
        appDescription: selectedGroup.appDescription,
      });
      setIsModalOpen(true);
    }
  };

  // Handler for deleting an app group
  const handleDelete = () => {
    if (!selectedGroupId) return alert('No group selected.');
    console.log('Delete group:', selectedGroupId);
  };

  // Handler for form submission
  const onSubmit = (data: AppGroup) => {
    console.log('Form submitted:', data);
    setIsModalOpen(false);
  };

  // Handler for uploading an image
  const handleUploadImage = (groupId: string, file: File) => {
    console.log('Upload image for group:', groupId, file);
  };

  return {
    appGroups,
    selectedGroupId,
    isModalOpen,
    modalTitle,
    register,
    handleSubmit,
    errors,
    handleSelectGroup,
    handleRefresh,
    handleAdd,
    handleUpdate,
    handleDelete,
    onSubmit,
    setIsModalOpen,
    handleUploadImage,
    loading,
    error
  };
};
