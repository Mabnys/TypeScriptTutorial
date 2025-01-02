// useAppGroups.ts
import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

// Define the structure of an AppGroup
export interface AppGroup {
  id: string;
  groupName: string;
  appDescription: string;
  thumbnail?: string;
}

// Define the structure of form data for AppGroup
export interface AppGroupFormData {
  appName: string;
  appDescription: string;
}

export const useGroupApps = () => {
  // State management
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add App Group');

  // Initialize react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppGroupFormData>();

  const router = useRouter();

  // Fetch the authentication token from cookies
  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
  };

  // Function to fetch app groups from the API
  const fetchAppGroups = useCallback(() => {
    const authToken = getAuthToken();

    if (!authToken) {
      router.push('/');
      return Promise.reject('No auth token found');
    }

    return fetch('http://localhost:8080/api/v1/get-all-appgroups', {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setAppGroups(data);
        return data;
      });
  }, [router]);

  // Fetch app groups on component mount
  useEffect(() => {
    fetchAppGroups().catch(error => console.error('Error in useEffect:', error));
  }, [fetchAppGroups]);

  // Function to handle group selection
  const handleSelectGroup = (id: string) => setSelectedGroupId(id);

  // Function to refresh app groups
  const handleRefresh = () => fetchAppGroups();

  // Function to open modal for adding an app group
  const handleAdd = () => {
    setModalTitle('Add App Group');
    reset({ appName: '', appDescription: '' });
    setSelectedGroupId(null);
    setIsModalOpen(true);
  };

  // Function to open modal for updating an app group
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

  // Function to delete an app group
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
          if (response.ok) {
            alert('App Group deleted successfully!');
            fetchAppGroups();
          } else {
            throw new Error('Failed to delete App Group');
          }
        })
        .catch(error => console.error('Error deleting App Group:', error));
    }
  };

  // Form submission handler (for both add and update)
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

  // Function to handle image upload for an app group
  const handleUploadImage = (groupId: string, file: File) => {
    const authToken = getAuthToken();
    if (!authToken) return alert('Authentication required.');

    const formData = new FormData();
    formData.append('vcImage', file);

    fetch(`http://localhost:8080/api/v1/app-group/${groupId}/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          alert('Image uploaded/updated successfully!');
          console.log("Image uploaded")
          fetchAppGroups();
        } else {
          console.error("Failed to upload!")
          throw new Error('Failed to upload image.');
        }
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        alert('An error occurred while uploading the image.');
      });
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
