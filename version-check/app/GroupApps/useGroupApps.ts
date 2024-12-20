import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Define the structure of an AppGroup
export interface AppGroup {
  id: string;
  groupName: string;
  appDescription: string; // Description of the app group
  thumbnail?: string; // Optional thumbnail field
}

// Define the structure of an App (used for form data)
export interface AppFormData {
  appName: string; // Name of the app group
  appDescription: string; // Description of the app group
}

export const useGroupApps = () => {
  // State management
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]); // State to hold app groups
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null); // State to hold selected group ID
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [modalTitle, setModalTitle] = useState('Add App Group'); // State for modal title

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
    const authToken = getAuthToken(); // Get the authentication token

    if (!authToken) {
      router.push('/'); // Redirect to home or login page if no token is found
      return Promise.reject('No auth token found');
    }

    return new Promise<void>((resolve, reject) => {
      fetch('http://localhost:8080/api/v1/get-all-appgroups', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON data from response
      })
      .then(data => {
        setAppGroups(data); // Update state with fetched data
        resolve(); // Resolve the promise after updating state
      })
      .catch(error => {
        console.error('Error fetching apps:', error);
        reject(error); // Reject the promise on error
      });
    });
  }, [router]); // Include router in dependency array

  // Function to handle group selection
  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id); // Set the selected group ID
  };

  // Function to refresh app groups
  const handleRefresh = () => fetchAppGroups();

  // Function to open modal for adding an app group
  const handleAdd = () => {
    setModalTitle('Add App Group'); // Set modal title for adding a new app group
    reset({
        appName: "",
        appDescription: "",
      }); // Reset form when opening for adding
    setSelectedGroupId(null); // Clear selected group ID for new creation
    setIsModalOpen(true); // Open modal
  };

  // Function to open modal for updating an app group
  const handleUpdate = () => {
    if (!selectedGroupId) return alert('No group selected.'); // Ensure a group is selected

    const selectedGroup = appGroups.find(group => group.id === selectedGroupId);
    if (selectedGroup) {
      setModalTitle('Update App Group'); // Set modal title for updating an existing app group
      reset({
        appName: selectedGroup.groupName,
        appDescription: selectedGroup.appDescription,
      }); // Pre-fill form with selected group's data
      setIsModalOpen(true); // Open modal for updating
    }
  };

  /**
   * Function to delete an app group.
   * - Prompts the user for confirmation before deleting.
   * - Sends a DELETE request to the backend API.
   * - Refreshes the list of app groups upon successful deletion.
   */
  const handleDelete = () => {
    if (!selectedGroupId) return alert('No group selected.'); // Ensure a group is selected

    if (confirm('Are you sure you want to delete this app group?')) { // Confirm deletion with user
      const authToken = getAuthToken();
      if (!authToken) return alert('Authentication required.');

      fetch(`http://localhost:8080/api/v1/delete-appgroup?APPID=${selectedGroupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then(response => {
          if (response.ok) {
            alert('App Group deleted successfully!'); // Notify user of success
            fetchAppGroups(); // Refresh list after deletion
          } else {
            throw new Error('Failed to delete App Group'); // Handle failure case
          }
        })
        .catch(error => console.error('Error deleting App Group:', error)); // Log errors if any occur during deletion
    }
  };

  /**
   * Form submission handler (for both add and update).
   * - Sends POST or PUT requests based on whether a new group is being created or an existing one is being updated.
   */
  const onSubmit: SubmitHandler<AppFormData> = (data) => {
    const authToken = getAuthToken();
    if (!authToken) return alert('Authentication required.');

    const method = selectedGroupId ? 'PUT' : 'POST'; // Determine HTTP method based on action (add or update)
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
          fetchAppGroups(); // Refresh list after submission
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => console.error('Error submitting form:', error));
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
  };
};
