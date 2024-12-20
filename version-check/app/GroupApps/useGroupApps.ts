// useGroupApps.ts

import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Define the structure of an AppGroup
export interface AppGroup {
  id: string;
  groupName: string;
  appDescription: string;
  thumbnail?: string;
}

// Define the structure of an App (used for form data)
export interface AppFormData {
  appName: string;
  appDescription: string; // Added description field
  bundleId: string;
  minTargetVersion: string;
  recTargetVersion: string;
  platformName: 'iOS' | 'Android' | '';
}

export const useGroupApps = () => {
  // State management
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add App');

  // Initialize react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppFormData>();
  
   // Fetch the authentication token from cookies
   const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    };
  const router = useRouter(); // Initialize the router for navigation

  // Fetch app groups on component mount
  useEffect(() => {
    fetchAppGroups();
  });

  // Function to fetch app groups from the API using a Promise-based approach
  const fetchAppGroups = useCallback(() => {
    // Get the authentication token (assumed to be a function you have)
    const authToken = getAuthToken();

    // If no auth token is found, redirect to login page
    if (!authToken) {
      router.push('/'); // Redirect to home or login page
      return Promise.reject('No auth token found');
    }

    // Return a new Promise to handle the API call
    return new Promise((resolve, reject) => {
      fetch('http://localhost:8080/api/v1/get-all-appgroups', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(response => {
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON data from response
      })
      .then(data => {
        // Update the app groups state with the fetched data
        setAppGroups(data);
        resolve(data); // Resolve the promise after updating state
      })
      .catch(error => {
        console.error('Error fetching apps:', error);
        reject(error); // Reject the promise on error
      });
    });
  }, [router]); // Include router in dependency array

  // Function to handle group selection
  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  // Function to refresh app groups
  const handleRefresh = () => fetchAppGroups();

  // Function to open modal for adding an app group
  const handleAdd = () => {
    setModalTitle('Add App');
    reset(); // Reset form when opening for adding
    setIsModalOpen(true);
  };

  // Function to open modal for updating an app group
  const handleUpdate = () => {
    setModalTitle('Update App');
    // TODO: Fetch current app data and set it using reset()
    setIsModalOpen(true);
  };

  // Function to delete an app group
  const handleDelete = () => {
    // TODO: Implement delete functionality
  };

  // Form submission handler
  const onSubmit: SubmitHandler<AppFormData> = (data) => {
    console.log('Form submitted:', data);
    // TODO: Implement API call to add/update app
    setIsModalOpen(false);
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
    setIsModalOpen
  };
};
