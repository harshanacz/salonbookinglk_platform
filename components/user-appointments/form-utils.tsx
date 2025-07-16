export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTime = (time: string) => {
  if (!time || time.length < 5) return "";
  
  const [hours, minutes] = time.split(':');
  const hourNum = parseInt(hours);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
  return `${displayHour}:${minutes} ${period}`;
};

export const getStatusColor = (status?: 'completed' | 'canceled') => {
  switch (status) {
    case 'completed': return 'text-green-600';
    case 'canceled': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getStatusText = (status?: 'completed' | 'canceled') => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'canceled': return 'Canceled';
    default: return 'Completed';
  }
};