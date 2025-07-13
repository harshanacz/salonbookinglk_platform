import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useAdminActivityTracker = () => {
  const { isLoaded, userId } = useAuth();

  // Remove automatic login tracking on page load/refresh
  // Login should only be tracked when user actually signs in
  
  const trackLogout = async () => {
    try {
      await fetch('/api/admin/auth-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch (err) {
      console.warn('Failed to log admin logout activity:', err);
    }
  };

  const trackLogin = async () => {
    try {
      // Only track for admin users - check if current route suggests admin access
      const isAdminRoute = window.location.pathname.includes('/admin') || 
                          window.location.pathname.includes('/super-admin');
      
      if (isAdminRoute) {
        await fetch('/api/admin/auth-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'login' }),
        });
      }
    } catch (err) {
      console.warn('Failed to log admin login activity:', err);
    }
  };

  return {
    trackLogout,
    trackLogin
  };
};
