import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to track admin login activity
 * Should be used in admin layout components to track when admins access the system
 * Uses localStorage with timestamp to track login once per day (24 hours)
 */
export const useAdminLoginTracking = () => {
  const { user, isLoaded } = useUser();
  const hasLoggedActivity = useRef(false);

  useEffect(() => {
    const logLoginActivity = async () => {
      // Only log once per component mount and only for loaded admin users
      if (!isLoaded || !user || hasLoggedActivity.current) {
        return;
      }

      // Check if user has admin metadata
      const userType = user.publicMetadata?.type as string;
      if (userType !== 'ADMIN') {
        return;
      }

      // Check if we've already logged within the last 24 hours
      const sessionKey = `admin_login_logged_${user.id}`;
      const lastLoginTimestamp = localStorage.getItem(sessionKey);
      
      if (lastLoginTimestamp) {
        const lastLoginTime = new Date(parseInt(lastLoginTimestamp));
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - lastLoginTime.getTime();
        const hoursElapsed = timeDifference / (1000 * 60 * 60); // Convert to hours
        
        // If less than 24 hours have passed, don't log again
        if (hoursElapsed < 24) {
          hasLoggedActivity.current = true;
          return;
        }
      }

      try {
        const response = await fetch('/api/admin/log-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Empty body signals login tracking
        });

        if (response.ok) {
          // Store current timestamp for this login
          const currentTimestamp = new Date().getTime().toString();
          localStorage.setItem(sessionKey, currentTimestamp);
          hasLoggedActivity.current = true;
        }
      } catch (error) {
        console.error('Failed to log login activity:', error);
      }
    };

    logLoginActivity();
  }, [user, isLoaded]);

  return null;
};
