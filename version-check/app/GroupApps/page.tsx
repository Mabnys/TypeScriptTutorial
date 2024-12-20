'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../Header/header'; // Import Header component
import Footer from '../Footer/footer'; // Import Footer component

// Define the structure of an AppGroup
interface AppGroup {
  id: string;
  groupName: string;
  description: string;
  thumbnail?: string;
}

const GroupApps: React.FC = () => {
  // State to store the list of app groups
  const [appGroups, setAppGroups] = useState<AppGroup[]>([]);
  // State to track the selected app group
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Effect to fetch app groups on component mount
  useEffect(() => {
    fetchAppGroups();
  }, []);

  // Function to fetch app groups from the API
  const fetchAppGroups = async () => {
    // TODO: Implement API call to fetch app groups
    // For now, we'll use dummy data
    const dummyData: AppGroup[] = [
      { id: '1', groupName: 'Group 1', description: 'Description 1' },
      { id: '2', groupName: 'Group 2', description: 'Description 2' },
    ];
    setAppGroups(dummyData);
  };

  // Function to handle app group selection
  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  // Functions to handle button actions (to be implemented)
  const handleRefresh = () => fetchAppGroups();
  const handleAdd = () => {/* TODO: Implement add functionality */};
  const handleUpdate = () => {/* TODO: Implement update functionality */};
  const handleDelete = () => {/* TODO: Implement delete functionality */};

  return (
    <>
      <Header /> {/* Add Header component */}
      <div className="content">
        <h2>App Group Table</h2>
        
        {/* Action buttons */}
        <div className="action-buttons">
          <button id="refreshButton" className="action-button" onClick={handleRefresh}>Refresh App Group List</button>
          <button id="addButton" className="action-button" onClick={handleAdd}>Add App Group</button>
          <button id="updateButton" className="action-button" onClick={handleUpdate} disabled={!selectedGroupId}>Update App Group</button>
          <button id="deleteButton" className="action-button" onClick={handleDelete} disabled={!selectedGroupId}>Delete App Group</button>
        </div>
        
        {/* App Group Table */}
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
      </div>
      <Footer /> {/* Add Footer component */}
    </>
  );
};

export default GroupApps;
