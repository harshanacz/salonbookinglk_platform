// Client-side admin activity utilities
export interface ClientActivityData {
  action: string;
  details: string;
  target?: string;
  metadata?: Record<string, any>;
}

// Client-side activity logging function
export async function logClientAdminActivity(activityData: ClientActivityData) {
  try {
    const response = await fetch('/api/admin/log-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      console.error('Failed to log admin activity:', response.statusText);
    }
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}
