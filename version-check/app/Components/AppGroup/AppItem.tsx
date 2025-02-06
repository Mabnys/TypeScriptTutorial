import React from 'react';
import { App } from '../../Types/App';

interface AppItemProps {
  app: App;
}

const AppItem: React.FC<AppItemProps> = ({ app }) => {
  return (
    <li className="border p-4 rounded-md">
      <h3 className="font-bold">{app.appName}</h3>
      <p>Bundle ID: {app.bundleId}</p>
      <p>Platform: {app.platformName}</p>
      <p>Min Version: {app.minimumTargetVersion}</p>
      <p>Recommended Version: {app.recommendedTargetVersion}</p>
    </li>
  );
};

export default AppItem;
