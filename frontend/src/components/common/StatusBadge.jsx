import React from 'react';
import { getStatusBadge } from '../../utils/helpers';
import { CheckCircle, XCircle, Clock, Loader, Ban } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />,
    running: <Loader className="w-4 h-4 animate-spin" />,
    pending: <Clock className="w-4 h-4" />,
    cancelled: <Ban className="w-4 h-4" />,
  };

  return (
    <span className={getStatusBadge(status)}>
      <span className="flex items-center gap-1">
        {icons[status]}
        {status}
      </span>
    </span>
  );
};

export default StatusBadge;