import { Star } from "lucide-react";

interface SalonRatingDisplayProps {
  reviewScore: number;
  numberOfReviewers: number;
  className?: string;
}

export default function SalonRatingDisplay({ 
  reviewScore, 
  numberOfReviewers, 
  className = "" 
}: SalonRatingDisplayProps) {
  const displayRating = numberOfReviewers > 0 ? reviewScore : 0;
  const filledStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < filledStars;
          const isHalf = index === filledStars && hasHalfStar;
          
          return (
            <div key={index} className="relative">
              <Star
                className={`w-4 h-4 ${
                  isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
              {isHalf && (
                <Star
                  className="absolute top-0 left-0 w-4 h-4 fill-yellow-400 text-yellow-400"
                  style={{
                    clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <span className="text-sm font-medium">
        {displayRating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500">
        ({numberOfReviewers} {numberOfReviewers === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
