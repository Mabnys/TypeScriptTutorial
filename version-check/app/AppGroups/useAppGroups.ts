import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
// import { useRouter } from 'next/navigation';
import { useRefreshToken } from '../Components/useRefreshToken';

// Define the structure of an AppGroup
export interface AppGroup {
  id: string;
  groupName: string;
  appDescription: string;
  image?: ImageBlob;
}

export interface ImageBlob {
  blob: string
}

// Define the structure of form data for AppGroup
export interface AppGroupFormData {
  appName: string;
  appDescription: string;
}

export const useGroupApps = () => {
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add App Group');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppGroupFormData>();

  // const router = useRouter();
  const { refreshAccessToken } = useRefreshToken();

  // Function to get the auth token from cookies
  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
  };

  // Function to fetch all app groups
  const fetchAppGroups = useCallback(async () => {
    try {
      let authToken = getAuthToken();

      if (!authToken) {
        // Try to refresh the token if it's not available
        authToken = await refreshAccessToken();
      }

      const response = await fetch('http://localhost:8080/api/v1/get-all-appgroups', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (response.status === 401) {
        // If unauthorized, try refreshing the token
        authToken = await refreshAccessToken();
        // Retry the request with the new token
        const retryResponse = await fetch('http://localhost:8080/api/v1/get-all-appgroups', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (!retryResponse.ok) throw new Error('Network response was not ok after token refresh');
        return retryResponse.json();
      }

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Process the fetched data
      const processedData = data.map((group: AppGroup) => ({
        ...group,
        thumbnail: group.image && group.image.blob
          ? `data:image/png;base64,${group.image.blob}`
          : null
      }));
      setAppGroups(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching app groups:', error);
      throw error;
    }
  }, [refreshAccessToken]);

  // Fetch app groups when the component mounts
  useEffect(() => {
    fetchAppGroups().catch(error => console.error('Error in useEffect:', error));
  }, [fetchAppGroups]);

  // Handler for selecting a group
  const handleSelectGroup = (id: string) => setSelectedGroupId(id);

  // Handler for refreshing the app group list
  const handleRefresh = () => fetchAppGroups();

  // Handler for opening the add modal
  const handleAdd = () => {
    setModalTitle('Add App Group');
    reset({ appName: '', appDescription: '' });
    setSelectedGroupId(null);
    setIsModalOpen(true);
  };

  // Handler for opening the update modal
  const handleUpdate = () => {
    if (!selectedGroupId) return alert('No group selected.');

    const selectedGroup = appGroups.find(group => group.id === selectedGroupId);
    if (selectedGroup) {
      setModalTitle('Update App Group');
      reset({
        appName: selectedGroup.groupName,
        appDescription: selectedGroup.appDescription,
      });
      setIsModalOpen(true);
    }
  };

  // Handler for deleting an app group
  const handleDelete = () => {
    if (!selectedGroupId) return alert('No group selected.');

    if (confirm('Are you sure you want to delete this app group?')) {
      const authToken = getAuthToken();
      if (!authToken) return alert('Authentication required.');

      fetch(`http://localhost:8080/api/v1/delete-appgroup?APPID=${selectedGroupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then(response => {
          if (response.ok) fetchAppGroups();
          else throw new Error('Failed to delete app group');
        })
        .catch(error => console.error('Error deleting app group:', error));
    }
  };

  // Handler for form submission
  const onSubmit: SubmitHandler<AppGroupFormData> = (data) => {
    const authToken = getAuthToken();
    if (!authToken) return alert('Authentication required.');

    const method = selectedGroupId ? 'PUT' : 'POST';
    const url = selectedGroupId
      ? `http://localhost:8080/api/v1/update-appgroup?APPID=${selectedGroupId}`
      : 'http://localhost:8080/api/v1/create-appgroup';

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupName: data.appName,
        appDescription: data.appDescription,
      }),
    })
      .then(response => {
        if (response.ok) {
          alert(`${selectedGroupId ? 'Updated' : 'Created'} App Group successfully!`);
          setIsModalOpen(false);
          fetchAppGroups();
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => console.error('Error submitting form:', error));
  };

  // Handler for uploading an image
  const handleUploadImage = async (groupId: string, file: File) => {
    const authToken = getAuthToken();
    if (!authToken) return alert('Authentication required.');

    const formData = new FormData();
    formData.append('vcImage', file);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/app-group/${groupId}/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (response.ok) {
        alert(`${groupId ? 'Uploaded' : 'Updated'} image successfully!`);
        fetchAppGroups();
      } else {
        throw new Error('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred while uploading the image.');
    }
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
  };
};
