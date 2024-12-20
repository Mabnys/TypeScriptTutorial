'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import Header from '../Header/header';
import Footer from '../Footer/footer';

// Define the structure of an AppGroup
interface AppGroup {
  id: string;
  groupName: string;
  description: string;
  thumbnail?: string;
}

// Define the structure of an App (used for form data)
interface AppFormData {
  appName: string;
  bundleId: string;
  minTargetVersion: string;
  recTargetVersion: string;
  platformName: 'iOS' | 'Android' | '';
}

const GroupApps: React.FC = () => {
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add App');

  // Initialize react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppFormData>();

  useEffect(() => {
    fetchAppGroups();
  }, []);

  const fetchAppGroups = async () => {
    // TODO: Implement API call
    const dummyData: AppGroup[] = [
      { id: '1', groupName: 'Group 1', description: 'Description 1' },
      { id: '2', groupName: 'Group 2', description: 'Description 2' },
    ];
    setAppGroups(dummyData);
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  const handleRefresh = () => fetchAppGroups();

  const handleAdd = () => {
    setModalTitle('Add App');
    reset(); // Reset form when opening for adding
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    setModalTitle('Update App');
    // TODO: Fetch current app data and set it using reset()
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
  };

  // Form submission handler
  const onSubmit: SubmitHandler<AppFormData> = (data) => {
    console.log('Form submitted:', data);
    // TODO: Implement API call to add/update app
    setIsModalOpen(false);
  };

  return (
    <>
      <Header />
      <div className="content">
        <h2>App Group Table</h2>
        
        <div className="action-buttons">
          <button id="refreshButton" className="action-button" onClick={handleRefresh}>Refresh App Group List</button>
          <button id="addButton" className="action-button" onClick={handleAdd}>Add App Group</button>
          <button id="updateButton" className="action-button" onClick={handleUpdate} disabled={!selectedGroupId}>Update App Group</button>
          <button id="deleteButton" className="action-button" onClick={handleDelete} disabled={!selectedGroupId}>Delete App Group</button>
        </div>
        
        <table id="appgroupTable" border={1} cellPadding={10} cellSpacing={0}>
          <thead>
            <tr>
              <th>Select</th>
              <th>ID</th>
              <th>Group Name</th>
              <th>Description</th>
              <th>Thumbnail</th>
            </tr>
          </thead>
          <tbody>
            {appGroups.map((group) => (
              <tr key={group.id}>
                <td>
                  <input
                    type="radio"
                    name="groupSelect"
                    checked={selectedGroupId === group.id}
                    onChange={() => handleSelectGroup(group.id)}
                  />
                </td>
                <td>{group.id}</td>
                <td>{group.groupName}</td>
                <td>{group.description}</td>
                <td>
                  {group.thumbnail && (
                    <Image src={group.thumbnail} alt="Thumbnail" width={50} height={50} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal Structure */}
        {isModalOpen && (
          <div id="modalForm" className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
              <h2 id="modalTitle">{modalTitle}</h2>
              <form id="appForm" onSubmit={handleSubmit(onSubmit)}>
                <input {...register("appName", { required: "App Name is required" })} placeholder="App Name" />
                {errors.appName && <span>{errors.appName.message}</span>}

                <input {...register("bundleId", { required: "Bundle ID is required" })} placeholder="Bundle ID" />
                {errors.bundleId && <span>{errors.bundleId.message}</span>}

                <input {...register("minTargetVersion", { required: "Minimum Target Version is required" })} placeholder="Minimum Target Version" />
                {errors.minTargetVersion && <span>{errors.minTargetVersion.message}</span>}

                <input {...register("recTargetVersion", { required: "Recommended Target Version is required" })} placeholder="Recommended Target Version" />
                {errors.recTargetVersion && <span>{errors.recTargetVersion.message}</span>}

                <select {...register("platformName", { required: "Platform is required" })}>
                  <option value="">Select Platform</option>
                  <option value="iOS">iOS</option>
                  <option value="Android">Android</option>
                </select>
                {errors.platformName && <span>{errors.platformName.message}</span>}

                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default GroupApps;
