import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  const IconComponent = icon || Inbox;
  const displayTitle = title || 'No data found';
  const displayDescription = description || 'Get started by creating a new item.';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <IconComponent className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayTitle}</h3>
      <p className="text-gray-600 mb-6 max-w-sm">{displayDescription}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;