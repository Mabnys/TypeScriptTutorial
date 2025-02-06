import React from 'react';
import { AppGroup } from '../../Types/AppGroup';
import Button from '../button';
import Link from 'next/link';
import Image from 'next/image';

interface AppGroupListProps {
  appGroups: AppGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onImageUpload: (id: string) => void;
}

const AppGroupList: React.FC<AppGroupListProps> = ({ appGroups, selectedGroupId, onSelectGroup, onImageUpload }) => {    
  return (
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
        {appGroups.map(group => (
          <tr key={group.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-2">
              <input
                type="radio"
                name="groupSelect"
                checked={selectedGroupId === group.id}
                onChange={() => onSelectGroup(group.id)}
              />
            </td>
            <td className="border border-gray-300 p-2">{group.id}</td>
            <td className="border border-gray-300 p-2">
              <Link href={`/AppGroups/${group.id}`} className="text-blue-500 hover:underline">
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
               onClick={() => onImageUpload(group.id)}
              />
              ) : (
                <Button onClick={() => onImageUpload(group.id)}>Upload Image</Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AppGroupList;
