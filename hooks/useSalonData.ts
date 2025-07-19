import { useState, useEffect } from 'react';

interface SalonData {
  _id: string;
  basicInfo: {
    name: string;
    address: string;
    contactNumber: string;
    email?: string;
    website?: string;
    images: string[];
    description?: string;
  };
  operatingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  reviewScore?: number;
  numberOfReviewers?: number;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
  };
}

interface ServiceRating {
  serviceName: string;
  rating: number;
  reviewCount: number;
}

export const useSalonData = (salonId: string) => {
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [serviceRatings, setServiceRatings] = useState<ServiceRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        setLoading(true);
        
        // Fetch salon data
        const salonResponse = await fetch(`/api/salon/${salonId}`);
        if (!salonResponse.ok) {
          throw new Error('Failed to fetch salon data');
        }
        const salonData = await salonResponse.json();
        setSalon(salonData);

        // Fetch service ratings for this salon
        const ratingsResponse = await fetch(`/api/salon/${salonId}/ratings`);
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setServiceRatings(ratingsData.serviceRatings || []);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (salonId) {
      fetchSalonData();
    }
  }, [salonId]);

  return { salon, serviceRatings, loading, error };
};
