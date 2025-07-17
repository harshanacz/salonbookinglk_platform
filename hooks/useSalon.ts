import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useSalon() {
  const [salonData, setSalonData] = useState<{ businessName: string } | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchSalon = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/salon?userId=${user.id}`);
        const data = await response.json();
        setSalonData(data);
      } catch (error) {
        console.error('Error fetching salon data:', error);
      }
    };

    fetchSalon();
  }, [user?.id]);

  return salonData;
}
