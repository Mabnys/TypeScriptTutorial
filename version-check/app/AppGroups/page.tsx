'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useGroupApps } from './useAppGroups';
import Header from '../Components/header';
import Footer from '../Components/footer';
import Button from '../Components/button';
import Link from 'next/link';
import ImageUploadModal from '../Components/imageUploadModal';

const AppGroups: React.FC = () => {
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
  } = useGroupApps();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedGroupIdForImage, setSelectedGroupIdForImage] = useState<string | null>(null);

  // Function to open the image upload modal
  const openImageUploadModal = (groupId: string) => {
    setSelectedGroupIdForImage(groupId);
    setIsImageModalOpen(true);
  };

  // Function to handle image upload
  const handleImageUpload = (file: File) => {
    if (selectedGroupIdForImage) {
      handleUploadImage(selectedGroupIdForImage, file);
      setIsImageModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 text-center mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">App Group Table</h2>
        
        <div className="flex space-x-2 mb-4">
          <Button onClick={handleRefresh}>Refresh App Group List</Button>
          <Button onClick={handleAdd}>Add App Group</Button>
          <Button onClick={handleUpdate} disabled={!selectedGroupId} variant='secondary'>Update App Group</Button>
          <Button onClick={handleDelete} disabled={!selectedGroupId} variant='danger'>Delete App Group</Button>
        </div>
        
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Select</th>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Group Name</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Thumbnail</th>
            </tr>
          </thead>
          <tbody>
            {appGroups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">
                  <input
                    type="radio"
                    name="groupSelect"
                    checked={selectedGroupId === group.id}
                    onChange={() => handleSelectGroup(group.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="border border-gray-300 p-2">{group.id}</td>
                <td className="border border-gray-300 p-2">
                  <Link href={`/AppGroup?groupId=${group.id}`} className="text-blue-500 underline cursor-pointer hover:text-blue-700">
                    {group.groupName}
                  </Link>
                </td>
                <td className="border border-gray-300 p-2">{group.appDescription}</td>
                <td className="border border-gray-300 p-2">
                  {group.image ? (
                      <Image 
                          src={`data:image/png;base64,${group.image.blob}`}
                          alt={`Thumbnail for ${group.groupName}`}
                          width={50} 
                          height={50} 
                          className="cursor-pointer"
                          onClick={() => openImageUploadModal(group.id)}
                      />
                  ) : (
                      <Button onClick={() => openImageUploadModal(group.id)} variant='upload'>
                          Upload Thumbnail
                      </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div id="modalForm" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="modal-content bg-white p-6 rounded-lg w-full max-w-md">
              <span className="close text-gray-500 hover:text-gray-700 cursor-pointer float-right" onClick={() => setIsModalOpen(false)}>&times;</span>
              <h2 id="modalTitle" className="text-xl font-bold mb-4">{modalTitle}</h2>

              <form id="groupForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input 
                  {...register("appName", { required: "App Name is required" })} 
                  placeholder="Group Name" 
                  className={`w-full p-2 border rounded ${errors.appName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.appName && <span className="text-red-500 text-sm">{errors.appName.message}</span>}

                <textarea 
                  {...register("appDescription", { required: "Description is required" })} 
                  placeholder="Description" 
                  rows={4}
                  required 
                  className={`w-full p-2 border rounded ${errors.appDescription ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.appDescription && <span className="text-red-500 text-sm">{errors.appDescription.message}</span>}

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">Submit</button>
              </form>
            </div>
          </div>
        )}
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onUpload={handleImageUpload}
          headerText="Upload/Change Thumbnail for App Group"
        />
      </main>
      <Footer />
    </div>
  );
};

export default AppGroups;
