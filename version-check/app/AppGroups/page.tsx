'use client'

import React, { useState } from 'react';
import { useGroupApps } from './useAppGroups';
import Header from '../Components/header';
import Footer from '../Components/footer';
import Button from '../Components/button';
import AppGroupList from '../Components/AppGroups/AppGroupList';
import ImageUploadModal from '../Components/imageUploadModal';

// This is the main component for the AppGroups page
const AppGroups: React.FC = () => {
  // Use the custom hook to manage app groups state and actions
  const {
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
  } = useGroupApps();

  // State for image upload modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedGroupIdForImage, setSelectedGroupIdForImage] = useState<string | null>(null);

  // Function to open the image upload modal
  const openImageUploadModal = (groupId: string) => {
    setSelectedGroupIdForImage(groupId);
    setIsImageModalOpen(true);
  };

  // Function to handle image upload
  const handleImageUploadWrapper = (file: File) => {
    if (selectedGroupIdForImage) {
      handleUploadImage(selectedGroupIdForImage, file);
      setIsImageModalOpen(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 text-center mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">App Group Table</h2>
        
        {/* Action buttons */}
        <div className="flex space-x-2 mb-4">
          <Button onClick={handleRefresh}>Refresh App Group List</Button>
          <Button onClick={handleAdd}>Add App Group</Button>
          <Button onClick={handleUpdate} disabled={!selectedGroupId} variant='secondary'>Update App Group</Button>
          <Button onClick={handleDelete} disabled={!selectedGroupId} variant='danger'>Delete App Group</Button>
        </div>
        
        {/* App group list component */}
        <AppGroupList 
          appGroups={appGroups} 
          selectedGroupId={selectedGroupId}
          onSelectGroup={handleSelectGroup}
          onImageUpload={openImageUploadModal}
        />

        {/* Modal for adding/updating app groups */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input {...register("groupName", { required: "Group Name is required" })} placeholder="Group Name" className="w-full p-2 border rounded" />
                {errors.groupName && <span className="text-red-500">{errors.groupName.message}</span>}
                
                <textarea {...register("appDescription", { required: "Description is required" })} placeholder="Description" rows={4} className="w-full p-2 border rounded" />
                {errors.appDescription && <span className="text-red-500">{errors.appDescription.message}</span>}
                
                <Button type="submit">Submit</Button>
              </form>
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" className="mt-4">Close</Button>
            </div>
          </div>
        )}
        
        {/* Image upload modal */}
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onUpload={handleImageUploadWrapper}
          headerText="Upload/Change Thumbnail for App Group"
        />
      </main>
      <Footer />
    </div>
  );
};

export default AppGroups;
