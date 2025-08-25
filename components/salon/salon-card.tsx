import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import SalonRatingDisplay from "./salon-rating-display";

interface SalonCardProps {
  salon: {
    _id: string;
    basicInfo: {
      name: string;
      address: string;
      contactNumber: string;
      images: string[];
    };
    operatingHours: {
      monday: { isOpen: boolean; openTime: string; closeTime: string };
      tuesday: { isOpen: boolean; openTime: string; closeTime: string };
      wednesday: { isOpen: boolean; openTime: string; closeTime: string };
      thursday: { isOpen: boolean; openTime: string; closeTime: string };
      friday: { isOpen: boolean; openTime: string; closeTime: string };
      saturday: { isOpen: boolean; openTime: string; closeTime: string };
      sunday: { isOpen: boolean; openTime: string; closeTime: string };
    };
    reviewScore?: number;
    numberOfReviewers?: number;
  };
}

export default function SalonCard({ salon }: SalonCardProps) {
  const getCurrentDayHours = () => {
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[today] as keyof typeof salon.operatingHours;
    return salon.operatingHours[currentDay];
  };

  const todayHours = getCurrentDayHours();
  const isOpen = todayHours?.isOpen;

  return (
    <Link 
      href={`/salons/${salon._id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative h-48 w-full">
        <Image
          src={salon.basicInfo.images[0] || "/placeholder.jpg"}
          alt={salon.basicInfo.name}
          fill
          className="object-cover rounded-t-lg"
        />
        {isOpen !== undefined && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOpen ? 'Open' : 'Closed'}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {salon.basicInfo.name}
        </h3>
        
        <div className="flex items-start gap-1 mb-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 line-clamp-2">
            {salon.basicInfo.address}
          </span>
        </div>

        {salon.reviewScore !== undefined && salon.numberOfReviewers !== undefined && (
          <div className="mb-2">
            <SalonRatingDisplay 
              reviewScore={salon.reviewScore}
              numberOfReviewers={salon.numberOfReviewers}
            />
          </div>
        )}

        {isOpen !== undefined && todayHours && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {isOpen 
                ? `${todayHours.openTime} - ${todayHours.closeTime}`
                : 'Closed today'
              }
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
