import React from 'react';
import Link from 'next/link';
import { AppGroup } from '../../Types/AppGroup';

interface AppGroupItemProps {
  group: AppGroup;
}

const AppGroupItem: React.FC<AppGroupItemProps> = ({ group }) => {
  return (
    <li className="border p-4 rounded-md">
      <Link href={`/AppGroups/${group.id}`} className="text-blue-500 hover:underline">
        {group.groupName}
      </Link>
      <p className="text-gray-600">{group.appDescription}</p>
    </li>
  );
};

export default AppGroupItem;
