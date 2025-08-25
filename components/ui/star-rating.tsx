import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  maxStars?: number;
  onRatingChange: (rating: number) => void;
  initialRating?: number;
  size?: number;
  disabled?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  maxStars = 5,
  onRatingChange,
  initialRating = 0,
  size = 20,
  disabled = false
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starNumber: number) => {
    if (disabled) return;
    setRating(starNumber);
    onRatingChange(starNumber);
  };

  const handleStarHover = (starNumber: number) => {
    if (disabled) return;
    setHoverRating(starNumber);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
      {[...Array(maxStars)].map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= (hoverRating || rating);
        
        return (
          <Star
            key={index}
            size={size}
            className={`cursor-pointer transition-colors ${
              isFilled 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-400'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => handleStarClick(starNumber)}
            onMouseEnter={() => handleStarHover(starNumber)}
          />
        );
      })}
    </div>
  );
};

interface RatingDisplayProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showNumber?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  showNumber = true
}) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        const isPartial = starNumber > rating && starNumber - 1 < rating;
        
        return (
          <Star
            key={index}
            size={size}
            className={`${
              isFilled 
                ? 'fill-yellow-400 text-yellow-400' 
                : isPartial
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        );
      })}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
