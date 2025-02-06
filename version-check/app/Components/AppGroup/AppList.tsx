import React from 'react';
import { App } from '../../Types/App';
import Button from '../button';
import Image from 'next/image';

interface AppListProps {
  apps: App[];
  selectedAppId: string | null;
  onSelectApp: (id: string) => void;
  onImageUpload: (id: string) => void;
}

const AppList: React.FC<AppListProps> = ({ apps, selectedAppId, onSelectApp, onImageUpload }) => {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 p-2">Select</th>
          <th className="border border-gray-300 p-2">ID</th>
          <th className="border border-gray-300 p-2">App Name</th>
          <th className="border border-gray-300 p-2">Bundle ID</th>
          <th className="border border-gray-300 p-2">Minimum Target Version</th>
          <th className="border border-gray-300 p-2">Recommended Target Version</th>
          <th className="border border-gray-300 p-2">Platform Name</th>
          <th className="border border-gray-300 p-2">Last Update Date</th>
          <th className="border border-gray-300 p-2">Thumbnail</th>
        </tr>
      </thead>
      <tbody>
        {apps.map(app => (
          <tr key={app.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-2">
              <input
                type="radio"
                name="appSelect"
                checked={selectedAppId === app.id}
                onChange={() => onSelectApp(app.id)}
              />
            </td>
            <td className="border border-gray-300 p-2">{app.id}</td>
            <td className="border border-gray-300 p-2">{app.appName}</td>
            <td className="border border-gray-300 p-2">{app.bundleId}</td>
            <td className="border border-gray-300 p-2">{app.minimumTargetVersion}</td>
            <td className="border border-gray-300 p-2">{app.recommendedTargetVersion}</td>
            <td className="border border-gray-300 p-2">{app.platformName}</td>
            <td className="border border-gray-300 p-2">{new Date(app.lastUpdateDate).toLocaleDateString()}</td>

            <td className="border border-gray-300 p-2">
              {app.images && app.images.length > 0 ? (
                  <Image 
                  src={`data:image/png;base64,${app.images[0].blob}`}
                  alt={`Thumbnail for ${app.appName}`}
                  width={50} 
                  height={50} 
                  onClick={() => onImageUpload(app.id)}
                  className="cursor-pointer"
              />
              ) : (
                <Button onClick={() => onImageUpload(app.id)}>Upload Image</Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AppList;
