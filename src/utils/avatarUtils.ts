// Utility function to generate consistent avatar colors across the app
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#6366f1', // Purple
    '#3b82f6', // Blue  
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ];
  
  // Generate consistent hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
export const getAvatarInitials = (name: string): string => {
  return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
};
