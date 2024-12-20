import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Define the structure of an AppGroup
export interface AppGroup {
  id: string;
  groupName: string; // Name of the app group
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

  // Function to fetch app groups from the API using a Promise-based approach
  const fetchAppGroups = useCallback(() => {
    const authToken = getAuthToken(); // Get the authentication token

    if (!authToken) {
      router.push('/'); // Redirect to home or login page if no token is found
      return Promise.reject('No auth token found');
    }

    return new Promise<void>((resolve, reject) => {
      fetch('http://localhost:8080/api/v1/get-all-appgroups', {
        headers: { 'Authorization': `Bearer ${authToken}` },
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
        .catch(reject); // Reject the promise on error
    });
  }, [router]); // Include router in dependency array

   // Fetch app groups on component mount
   useEffect(() => {
    fetchAppGroups().catch(error => console.error('Error in useEffect:', error));
  }, [fetchAppGroups]);

  // Function to handle group selection
  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id); // Set the selected group ID
  };

  // Function to refresh app groups
  const handleRefresh = () => fetchAppGroups();

  // Function to open modal for adding an app group
  const handleAdd = () => {
    setModalTitle('Add App Group'); // Set modal title for adding a new app group
    reset({ appName: '', appDescription: '' }); // Reset form when opening for adding
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


  /**
 * Function to handle image upload for an app group.
 * - Creates a modal for selecting an image.
 * - Sends a POST request to upload the selected image.
 */
const handleUploadImage = (appId: string) => {
  const authToken = getAuthToken(); // Get the authentication token
  if (!authToken) return alert('Authentication required.'); // Ensure authentication

  // Create the upload modal element
  const uploadModal = document.createElement('div');
  uploadModal.className = 'modal';
  uploadModal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Upload/Change Image for App Group</h2>
      <form id="uploadImageForm">
        <label for="uploadImageInput">Select an image:</label>
        <input type="file" id="uploadImageInput" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
    </div>
  `;

  // Append the modal to the document body
  document.body.appendChild(uploadModal);

  // Close modal functionality
  const closeUploadModal = uploadModal.querySelector('.close') as HTMLElement;
  closeUploadModal.onclick = () => {
    document.body.removeChild(uploadModal); // Remove the modal from DOM
  };

  // Handle form submission for image upload
  const uploadImageForm = uploadModal.querySelector('#uploadImageForm') as HTMLFormElement;
  const uploadImageInput = uploadModal.querySelector('#uploadImageInput') as HTMLInputElement;

  uploadImageForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!uploadImageInput.files || !uploadImageInput.files[0]) {
      alert('Please select an image.'); // Alert if no file is selected
      return;
    }

    const formData = new FormData(); // Create FormData object to hold file data
    formData.append('vcImage', uploadImageInput.files[0]); // Append selected file to FormData

    // Send POST request to upload the image
    fetch(`http://localhost:8080/api/v1/app/${appId}/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          alert('Image uploaded/updated successfully!'); // Notify user of success
          document.body.removeChild(uploadModal); // Close modal after successful upload
          fetchAppGroups(); // Refresh the list of app groups
        } else {
          throw new Error('Failed to upload image.'); // Handle failure case
        }
      })
      .catch(error => {
        console.error('Error uploading image:', error); // Log any errors that occur during upload
        alert('An error occurred while uploading the image.'); // Alert user of error
      });
  });

  // Display the modal
  uploadModal.style.display = 'block';
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
