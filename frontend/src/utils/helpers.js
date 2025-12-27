// Format date
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format duration (seconds to human readable)
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    success: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    running: 'text-blue-600 bg-blue-50',
    pending: 'text-yellow-600 bg-yellow-50',
    cancelled: 'text-gray-600 bg-gray-50',
    active: 'text-green-600 bg-green-50',
    inactive: 'text-gray-600 bg-gray-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

// Get status badge class
export const getStatusBadge = (status) => {
  const badges = {
    success: 'badge-success',
    failed: 'badge-error',
    running: 'badge-info',
    pending: 'badge-warning',
    cancelled: 'badge-gray',
    active: 'badge-success',
    inactive: 'badge-gray',
  };
  return `badge ${badges[status] || 'badge-gray'}`;
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Copy to clipboard
export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
};

// Calculate success rate
export const calculateSuccessRate = (successful, total) => {
  if (total === 0) return 0;
  return ((successful / total) * 100).toFixed(1);
};