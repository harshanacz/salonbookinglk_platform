import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to track admin login activity
 * Should be used in admin layout components to track when admins access the system
 * Uses sessionStorage to track login per browser session (not per page refresh)
 */
export const useAdminLoginTracking = () => {
  const { user, isLoaded } = useUser();
  const hasLoggedActivity = useRef(false);

  useEffect(() => {
    const logLoginActivity = async () => {
      // Only log once per browser session and only for loaded admin users
      if (!isLoaded || !user || hasLoggedActivity.current) {
        return;
      }

      // Check if user has admin metadata
      const userType = user.publicMetadata?.type as string;
      if (userType !== 'ADMIN') {
        return;
      }

      // Check if we've already logged this browser session
      const sessionKey = `admin_login_logged_${user.id}`;
      const hasLoggedThisSession = sessionStorage.getItem(sessionKey);

      // If already logged in this browser session, don't log again
      if (hasLoggedThisSession) {
        hasLoggedActivity.current = true;
        return;
      }

      try {
        const response = await fetch('/api/admin/login-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Mark as logged for this browser session
          sessionStorage.setItem(sessionKey, 'true');
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
